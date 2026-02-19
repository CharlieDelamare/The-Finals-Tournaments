import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function advanceTeamsToNextRound(
  tx: TransactionClient,
  lobbyId: string
) {
  const lobby = await tx.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      round: {
        include: {
          tournament: true,
          lobbies: {
            include: { lobbyTeams: true },
          },
        },
      },
      lobbyTeams: {
        where: { isAdvancer: true, isBye: false },
        include: { team: true },
        orderBy: { placement: "asc" },
      },
    },
  });

  if (!lobby) return;

  const tournament = lobby.round.tournament;
  const currentRoundNumber = lobby.round.roundNumber;

  // Find the next round
  const nextRound = await tx.tournamentRound.findUnique({
    where: {
      tournamentId_roundNumber: {
        tournamentId: tournament.id,
        roundNumber: currentRoundNumber + 1,
      },
    },
    include: {
      lobbies: {
        orderBy: { lobbyNumber: "asc" },
        include: { lobbyTeams: true },
      },
    },
  });

  if (!nextRound) return; // Grand Final completed, no next round

  // Check if ALL lobbies in the current round are completed
  const allLobbiesComplete = lobby.round.lobbies.every(
    (l) => l.status === "RESULTS_CONFIRMED" || l.lobbyTeams.every((lt) => lt.isBye)
  );

  if (!allLobbiesComplete) return; // Wait for all lobbies to complete

  // Collect all advancers from the current round
  const allAdvancers: { teamId: string; seed: number }[] = [];
  for (const roundLobby of lobby.round.lobbies) {
    const advancersFromLobby = roundLobby.lobbyTeams
      .filter((lt) => lt.isAdvancer && !lt.isBye)
      .sort((a, b) => (a.placement ?? 999) - (b.placement ?? 999));

    for (const advancer of advancersFromLobby) {
      allAdvancers.push({
        teamId: advancer.teamId,
        seed: allAdvancers.length + 1,
      });
    }
  }

  // Distribute advancers into next round lobbies
  const lobbyCount = nextRound.lobbies.length;
  const teamsPerLobby = Math.ceil(allAdvancers.length / lobbyCount);

  for (let i = 0; i < allAdvancers.length; i++) {
    const lobbyIdx = i % lobbyCount;
    const nextLobby = nextRound.lobbies[lobbyIdx];

    // Check if team is already in this lobby
    const existing = nextLobby.lobbyTeams.find(
      (lt) => lt.teamId === allAdvancers[i].teamId
    );

    if (!existing) {
      await tx.lobbyTeam.create({
        data: {
          lobbyId: nextLobby.id,
          teamId: allAdvancers[i].teamId,
          seed: allAdvancers[i].seed,
        },
      });
    }
  }

  // Update round statuses
  await tx.tournamentRound.update({
    where: { id: lobby.round.id },
    data: { status: "COMPLETED" },
  });

  await tx.tournamentRound.update({
    where: { id: nextRound.id },
    data: { status: "IN_PROGRESS" },
  });
}

export async function checkTournamentCompletion(
  tx: TransactionClient,
  tournamentId: string
) {
  const rounds = await tx.tournamentRound.findMany({
    where: { tournamentId },
    orderBy: { roundNumber: "desc" },
    include: {
      lobbies: { include: { lobbyTeams: true } },
    },
  });

  const lastRound = rounds[0];
  if (!lastRound) return;

  const allComplete = lastRound.lobbies.every(
    (l) => l.status === "RESULTS_CONFIRMED"
  );

  if (allComplete) {
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "COMPLETED" },
    });
  }
}
