import { prisma } from "@/lib/db/prisma";
import {
  calculateRoundPlans,
  calculateByes,
  snakeSeedDistribution,
} from "./utils";

export async function generateBracket(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      registrations: {
        include: { team: true },
        where: { status: "REGISTERED" },
        orderBy: { seed: "asc" },
      },
    },
  });

  if (!tournament) throw new Error("Tournament not found");

  // Get teams (for TEAM type, teams from registrations; for SOLO/RANDOMISED, should have been converted to teams)
  const teams = tournament.registrations
    .filter((r) => r.teamId)
    .map((r, idx) => ({
      teamId: r.teamId!,
      seed: r.seed ?? idx + 1,
    }));

  if (teams.length < 2) throw new Error("Need at least 2 teams to generate a bracket");

  const { teamsPerLobby, advancersPerLobby } = tournament;
  const byeCount = calculateByes(teams.length, teamsPerLobby, advancersPerLobby);
  const roundPlans = calculateRoundPlans(teams.length, teamsPerLobby, advancersPerLobby);

  // Sort teams by seed
  teams.sort((a, b) => a.seed - b.seed);

  await prisma.$transaction(async (tx) => {
    // Delete existing bracket data
    await tx.lobby.deleteMany({ where: { tournamentId } });
    await tx.tournamentRound.deleteMany({ where: { tournamentId } });

    // Create rounds
    const createdRounds: Array<{ id: string; roundNumber: number }> = [];
    for (const plan of roundPlans) {
      const round = await tx.tournamentRound.create({
        data: {
          tournamentId,
          roundNumber: plan.roundNumber,
          name: plan.name,
          status: plan.roundNumber === 1 ? "IN_PROGRESS" : "PENDING",
        },
      });
      createdRounds.push({ id: round.id, roundNumber: plan.roundNumber });
    }

    // Distribute teams into Round 1 lobbies
    const round1Plan = roundPlans[0];
    const round1Id = createdRounds.find((r) => r.roundNumber === 1)!.id;

    const lobbies = snakeSeedDistribution(teams, round1Plan.lobbyCount);

    // Add byes to lobbies with fewer teams
    let byesRemaining = byeCount;
    for (let i = lobbies.length - 1; i >= 0 && byesRemaining > 0; i--) {
      while (lobbies[i].length < teamsPerLobby && byesRemaining > 0) {
        lobbies[i].push({ teamId: "BYE", seed: 999 });
        byesRemaining--;
      }
    }

    // Create Round 1 lobbies with teams
    for (let lobbyIdx = 0; lobbyIdx < lobbies.length; lobbyIdx++) {
      const lobby = await tx.lobby.create({
        data: {
          roundId: round1Id,
          tournamentId,
          lobbyNumber: lobbyIdx + 1,
          status: "PENDING",
        },
      });

      for (const team of lobbies[lobbyIdx]) {
        if (team.teamId === "BYE") {
          // Create a placeholder bye team if it doesn't exist
          let byeTeam = await tx.team.findFirst({
            where: { tag: "BYE" },
          });
          if (!byeTeam) {
            byeTeam = await tx.team.create({
              data: { name: "BYE", tag: "BYE", description: "Bye placeholder" },
            });
          }
          await tx.lobbyTeam.create({
            data: {
              lobbyId: lobby.id,
              teamId: byeTeam.id,
              seed: team.seed,
              isBye: true,
              isAdvancer: false,
            },
          });
        } else {
          await tx.lobbyTeam.create({
            data: {
              lobbyId: lobby.id,
              teamId: team.teamId,
              seed: team.seed,
              isBye: false,
            },
          });
        }
      }
    }

    // Create empty lobbies for subsequent rounds
    for (let roundIdx = 1; roundIdx < roundPlans.length; roundIdx++) {
      const plan = roundPlans[roundIdx];
      const roundId = createdRounds.find(
        (r) => r.roundNumber === plan.roundNumber
      )!.id;

      for (let lobbyIdx = 0; lobbyIdx < plan.lobbyCount; lobbyIdx++) {
        await tx.lobby.create({
          data: {
            roundId,
            tournamentId,
            lobbyNumber: lobbyIdx + 1,
            status: "PENDING",
          },
        });
      }
    }

    // Update tournament status
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "IN_PROGRESS" },
    });
  });
}
