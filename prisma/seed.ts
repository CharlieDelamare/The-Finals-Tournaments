import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.scoreReportEntry.deleteMany();
  await prisma.scoreReport.deleteMany();
  await prisma.scoreDispute.deleteMany();
  await prisma.lobbyTeam.deleteMany();
  await prisma.lobby.deleteMany();
  await prisma.tournamentRound.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data.");

  // 1. USERS
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@tournament.gg",
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
      displayName: "Tournament Admin",
    },
  });

  const player1 = await prisma.user.create({
    data: {
      email: "player1@tournament.gg",
      username: "player1",
      passwordHash: userHash,
      displayName: "Shadow Wolf",
    },
  });

  const player2 = await prisma.user.create({
    data: {
      email: "player2@tournament.gg",
      username: "player2",
      passwordHash: userHash,
      displayName: "Phoenix Fire",
    },
  });

  const player3 = await prisma.user.create({
    data: {
      email: "player3@tournament.gg",
      username: "player3",
      passwordHash: userHash,
      displayName: "Ice Blade",
    },
  });

  const player4 = await prisma.user.create({
    data: {
      email: "player4@tournament.gg",
      username: "player4",
      passwordHash: userHash,
      displayName: "Storm Rider",
    },
  });

  const player5 = await prisma.user.create({
    data: {
      email: "player5@tournament.gg",
      username: "player5",
      passwordHash: userHash,
      displayName: "Dark Knight",
    },
  });

  console.log("Created 6 users (1 admin + 5 players).");

  // 2. TEAMS
  const team1 = await prisma.team.create({
    data: {
      name: "Shadow Strikers",
      tag: "SS",
      description: "Elite competitive squad, born to dominate",
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: team1.id, userId: player1.id, role: "OWNER", status: "ACCEPTED" },
      { teamId: team1.id, userId: player2.id, role: "MEMBER", status: "ACCEPTED" },
    ],
  });

  const team2 = await prisma.team.create({
    data: {
      name: "Phoenix Rising",
      tag: "PHX",
      description: "Rising from the ashes, always stronger",
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: team2.id, userId: player3.id, role: "OWNER", status: "ACCEPTED" },
      { teamId: team2.id, userId: player4.id, role: "MEMBER", status: "ACCEPTED" },
    ],
  });

  const team3 = await prisma.team.create({
    data: {
      name: "Storm Chasers",
      tag: "SC",
      description: "Chasing victory through the storm",
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: team3.id, userId: player5.id, role: "OWNER", status: "ACCEPTED" },
      { teamId: team3.id, userId: player1.id, role: "MEMBER", status: "PENDING" },
    ],
  });

  console.log("Created 3 teams.");

  // Create extra teams for bracket generation
  const extraTeams: Array<{ id: string }> = [];
  for (let i = 1; i <= 5; i++) {
    const t = await prisma.team.create({
      data: {
        name: `Auto Team ${i}`,
        tag: `AT${i}`,
        description: `Auto-generated team ${i} for seeding`,
      },
    });
    // Add admin as member so the team is valid
    await prisma.teamMember.create({
      data: { teamId: t.id, userId: admin.id, role: "OWNER", status: "ACCEPTED" },
    });
    extraTeams.push(t);
  }

  console.log("Created 5 extra teams for bracket seeding.");

  // 3. TOURNAMENTS

  // Draft tournament
  await prisma.tournament.create({
    data: {
      name: "Winter Championship 2026",
      description: "The biggest winter tournament of the year. Draft stage.",
      game: "The Finals",
      type: "TEAM",
      status: "DRAFT",
      maxTeams: 16,
      minTeamSize: 2,
      maxTeamSize: 4,
      teamsPerLobby: 4,
      advancersPerLobby: 2,
      createdById: admin.id,
    },
  });

  // Registration Open tournament
  const openTournament = await prisma.tournament.create({
    data: {
      name: "Spring Invitational",
      description: "Spring season invitational. Registration is open!",
      game: "The Finals",
      type: "TEAM",
      status: "REGISTRATION_OPEN",
      maxTeams: 8,
      minTeamSize: 1,
      maxTeamSize: 4,
      teamsPerLobby: 4,
      advancersPerLobby: 2,
      startDate: new Date("2026-04-01"),
      createdById: admin.id,
    },
  });

  // Register teams for open tournament
  await prisma.tournamentRegistration.createMany({
    data: [
      { tournamentId: openTournament.id, teamId: team1.id },
      { tournamentId: openTournament.id, teamId: team2.id },
    ],
  });

  // In-Progress tournament (with bracket and disputes)
  const inProgressTournament = await prisma.tournament.create({
    data: {
      name: "Summer Showdown",
      description: "Mid-season tournament currently in progress.",
      game: "The Finals",
      type: "TEAM",
      status: "IN_PROGRESS",
      maxTeams: 8,
      minTeamSize: 1,
      maxTeamSize: 4,
      teamsPerLobby: 4,
      advancersPerLobby: 2,
      createdById: admin.id,
    },
  });

  // Register 8 teams
  const allTeamsForInProgress = [team1, team2, team3, ...extraTeams];
  for (const t of allTeamsForInProgress) {
    await prisma.tournamentRegistration.create({
      data: { tournamentId: inProgressTournament.id, teamId: t.id },
    });
  }

  // Create bracket for in-progress tournament: 8 teams, 4/lobby, 2 advance = 2 rounds
  const ipRound1 = await prisma.tournamentRound.create({
    data: {
      tournamentId: inProgressTournament.id,
      roundNumber: 1,
      name: "Semi Finals",
      status: "IN_PROGRESS",
    },
  });

  const ipRound2 = await prisma.tournamentRound.create({
    data: {
      tournamentId: inProgressTournament.id,
      roundNumber: 2,
      name: "Grand Final",
      status: "PENDING",
    },
  });

  // Round 1: 2 lobbies of 4
  const ipLobby1 = await prisma.lobby.create({
    data: {
      roundId: ipRound1.id,
      tournamentId: inProgressTournament.id,
      lobbyNumber: 1,
      status: "DISPUTED",
    },
  });

  const ipL1Teams = [team1, team2, extraTeams[0], extraTeams[1]];
  const ipL1LobbyTeams = [];
  for (let i = 0; i < ipL1Teams.length; i++) {
    const lt = await prisma.lobbyTeam.create({
      data: {
        lobbyId: ipLobby1.id,
        teamId: ipL1Teams[i].id,
        seed: i + 1,
      },
    });
    ipL1LobbyTeams.push(lt);
  }

  // Create conflicting score reports for lobby 1 (dispute)
  const report1 = await prisma.scoreReport.create({
    data: {
      lobbyId: ipLobby1.id,
      reporterId: player1.id,
      reportedByTeamId: team1.id,
      entries: {
        create: [
          { lobbyTeamId: ipL1LobbyTeams[0].id, placement: 1 },
          { lobbyTeamId: ipL1LobbyTeams[1].id, placement: 2 },
          { lobbyTeamId: ipL1LobbyTeams[2].id, placement: 3 },
          { lobbyTeamId: ipL1LobbyTeams[3].id, placement: 4 },
        ],
      },
    },
  });

  const report2 = await prisma.scoreReport.create({
    data: {
      lobbyId: ipLobby1.id,
      reporterId: player3.id,
      reportedByTeamId: team2.id,
      entries: {
        create: [
          { lobbyTeamId: ipL1LobbyTeams[0].id, placement: 2 },
          { lobbyTeamId: ipL1LobbyTeams[1].id, placement: 1 },
          { lobbyTeamId: ipL1LobbyTeams[2].id, placement: 3 },
          { lobbyTeamId: ipL1LobbyTeams[3].id, placement: 4 },
        ],
      },
    },
  });

  // Create dispute
  await prisma.scoreDispute.create({
    data: {
      lobbyId: ipLobby1.id,
      reason:
        "Score reports disagree: Shadow Strikers reported 1st place, but Phoenix Rising placed them 2nd.",
      status: "OPEN",
      raisedById: player1.id,
    },
  });

  const ipLobby2 = await prisma.lobby.create({
    data: {
      roundId: ipRound1.id,
      tournamentId: inProgressTournament.id,
      lobbyNumber: 2,
      status: "RESULTS_CONFIRMED",
    },
  });

  const ipL2Teams = [team3, extraTeams[2], extraTeams[3], extraTeams[4]];
  const ipL2LobbyTeams = [];
  for (let i = 0; i < ipL2Teams.length; i++) {
    const lt = await prisma.lobbyTeam.create({
      data: {
        lobbyId: ipLobby2.id,
        teamId: ipL2Teams[i].id,
        seed: i + 1,
        placement: i + 1,
        isAdvancer: i < 2,
      },
    });
    ipL2LobbyTeams.push(lt);
  }

  // Grand Final lobby (empty, waiting for round 1)
  await prisma.lobby.create({
    data: {
      roundId: ipRound2.id,
      tournamentId: inProgressTournament.id,
      lobbyNumber: 1,
      status: "PENDING",
    },
  });

  // Completed tournament (full bracket with confirmed results)
  const completedTournament = await prisma.tournament.create({
    data: {
      name: "Autumn Classic",
      description: "The season finale. All results are in!",
      game: "The Finals",
      type: "TEAM",
      status: "COMPLETED",
      maxTeams: 8,
      minTeamSize: 1,
      maxTeamSize: 4,
      teamsPerLobby: 4,
      advancersPerLobby: 2,
      createdById: admin.id,
    },
  });

  // Register same 8 teams
  for (const t of allTeamsForInProgress) {
    await prisma.tournamentRegistration.create({
      data: { tournamentId: completedTournament.id, teamId: t.id },
    });
  }

  // Round 1
  const cRound1 = await prisma.tournamentRound.create({
    data: {
      tournamentId: completedTournament.id,
      roundNumber: 1,
      name: "Semi Finals",
      status: "COMPLETED",
    },
  });

  const cRound2 = await prisma.tournamentRound.create({
    data: {
      tournamentId: completedTournament.id,
      roundNumber: 2,
      name: "Grand Final",
      status: "COMPLETED",
    },
  });

  // Lobby 1 (completed)
  const cLobby1 = await prisma.lobby.create({
    data: {
      roundId: cRound1.id,
      tournamentId: completedTournament.id,
      lobbyNumber: 1,
      status: "RESULTS_CONFIRMED",
    },
  });

  for (let i = 0; i < 4; i++) {
    await prisma.lobbyTeam.create({
      data: {
        lobbyId: cLobby1.id,
        teamId: allTeamsForInProgress[i].id,
        seed: i + 1,
        placement: i + 1,
        isAdvancer: i < 2,
      },
    });
  }

  // Lobby 2 (completed)
  const cLobby2 = await prisma.lobby.create({
    data: {
      roundId: cRound1.id,
      tournamentId: completedTournament.id,
      lobbyNumber: 2,
      status: "RESULTS_CONFIRMED",
    },
  });

  for (let i = 0; i < 4; i++) {
    await prisma.lobbyTeam.create({
      data: {
        lobbyId: cLobby2.id,
        teamId: allTeamsForInProgress[i + 4].id,
        seed: i + 1,
        placement: i + 1,
        isAdvancer: i < 2,
      },
    });
  }

  // Grand Final (completed) - top 2 from each lobby
  const cGrandFinal = await prisma.lobby.create({
    data: {
      roundId: cRound2.id,
      tournamentId: completedTournament.id,
      lobbyNumber: 1,
      status: "RESULTS_CONFIRMED",
    },
  });

  const grandFinalTeams = [
    allTeamsForInProgress[0], // 1st from lobby 1
    allTeamsForInProgress[1], // 2nd from lobby 1
    allTeamsForInProgress[4], // 1st from lobby 2
    allTeamsForInProgress[5], // 2nd from lobby 2
  ];

  for (let i = 0; i < grandFinalTeams.length; i++) {
    await prisma.lobbyTeam.create({
      data: {
        lobbyId: cGrandFinal.id,
        teamId: grandFinalTeams[i].id,
        seed: i + 1,
        placement: i + 1,
        isAdvancer: i === 0, // Only winner
      },
    });
  }

  console.log("Created 4 tournaments (DRAFT, REGISTRATION_OPEN, IN_PROGRESS, COMPLETED).");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
