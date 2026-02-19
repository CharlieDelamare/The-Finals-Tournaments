import { prisma } from "@/lib/db/prisma";
import { advanceTeamsToNextRound, checkTournamentCompletion } from "@/lib/bracket/advancement";

export async function submitScoreReport(
  lobbyId: string,
  reporterId: string,
  reportedByTeamId: string | null,
  placements: { lobbyTeamId: string; placement: number }[]
) {
  // Validate lobby
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      lobbyTeams: { where: { isBye: false } },
      scoreReports: { include: { entries: true } },
    },
  });

  if (!lobby) throw new Error("Lobby not found");
  if (lobby.status === "RESULTS_CONFIRMED") {
    throw new Error("Results already confirmed");
  }

  // Validate placements cover all non-bye teams
  const nonByeTeamIds = new Set(lobby.lobbyTeams.map((lt) => lt.id));
  for (const p of placements) {
    if (!nonByeTeamIds.has(p.lobbyTeamId)) {
      throw new Error(`Invalid lobbyTeamId: ${p.lobbyTeamId}`);
    }
  }

  // Check for duplicate report from same team
  if (reportedByTeamId) {
    const existingReport = lobby.scoreReports.find(
      (r) => r.reportedByTeamId === reportedByTeamId
    );
    if (existingReport) {
      throw new Error("Your team has already submitted a report for this lobby");
    }
  }

  // Create score report
  const report = await prisma.scoreReport.create({
    data: {
      lobbyId,
      reporterId,
      reportedByTeamId,
      entries: {
        create: placements.map((p) => ({
          lobbyTeamId: p.lobbyTeamId,
          placement: p.placement,
        })),
      },
    },
    include: { entries: true },
  });

  // Update lobby status
  await prisma.lobby.update({
    where: { id: lobbyId },
    data: { status: "AWAITING_RESULTS" },
  });

  // Check for consensus
  return checkForConsensus(lobbyId);
}

async function checkForConsensus(lobbyId: string): Promise<"submitted" | "confirmed" | "disputed"> {
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      lobbyTeams: { where: { isBye: false } },
      scoreReports: {
        where: { isConfirmed: false },
        include: { entries: true },
      },
    },
  });

  if (!lobby) return "submitted";

  const teamsInLobby = lobby.lobbyTeams.length;
  const reports = lobby.scoreReports;

  // Need at least 2 reports to attempt consensus
  if (reports.length < 2) return "submitted";

  // Check if all reports agree
  const referenceEntries = reports[0].entries;
  const allAgree = reports.every((report) =>
    report.entries.every((entry) => {
      const ref = referenceEntries.find(
        (r) => r.lobbyTeamId === entry.lobbyTeamId
      );
      return ref && ref.placement === entry.placement;
    })
  );

  if (allAgree) {
    await confirmLobbyResults(lobbyId, referenceEntries);
    return "confirmed";
  } else if (reports.length >= 2) {
    await createAutoDispute(lobbyId, reports);
    return "disputed";
  }

  return "submitted";
}

async function confirmLobbyResults(
  lobbyId: string,
  entries: Array<{ lobbyTeamId: string; placement: number }>
) {
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      round: { include: { tournament: true } },
    },
  });

  if (!lobby) return;

  const advancersPerLobby = lobby.round.tournament.advancersPerLobby;

  await prisma.$transaction(async (tx) => {
    // Update placements
    for (const entry of entries) {
      const isAdvancer = entry.placement <= advancersPerLobby;
      await tx.lobbyTeam.update({
        where: { id: entry.lobbyTeamId },
        data: {
          placement: entry.placement,
          isAdvancer,
        },
      });
    }

    // Mark reports as confirmed
    await tx.scoreReport.updateMany({
      where: { lobbyId },
      data: { isConfirmed: true },
    });

    // Mark lobby as confirmed
    await tx.lobby.update({
      where: { id: lobbyId },
      data: { status: "RESULTS_CONFIRMED" },
    });

    // Advance teams to next round
    await advanceTeamsToNextRound(tx, lobbyId);

    // Check if tournament is complete
    await checkTournamentCompletion(tx, lobby.tournamentId);
  });
}

async function createAutoDispute(
  lobbyId: string,
  reports: Array<{
    id: string;
    reporterId: string;
    entries: Array<{ lobbyTeamId: string; placement: number }>;
  }>
) {
  // Build discrepancy description
  const discrepancies: string[] = [];
  const ref = reports[0].entries;

  for (let i = 1; i < reports.length; i++) {
    for (const entry of reports[i].entries) {
      const refEntry = ref.find((r) => r.lobbyTeamId === entry.lobbyTeamId);
      if (refEntry && refEntry.placement !== entry.placement) {
        discrepancies.push(
          `Team ${entry.lobbyTeamId}: Report 1 says #${refEntry.placement}, Report ${i + 1} says #${entry.placement}`
        );
      }
    }
  }

  const reason = `Score reports disagree: ${discrepancies.join("; ") || "Placement discrepancy detected"}`;

  await prisma.$transaction(async (tx) => {
    await tx.scoreDispute.create({
      data: {
        lobbyId,
        reason,
        status: "OPEN",
        raisedById: reports[0].reporterId,
      },
    });

    await tx.lobby.update({
      where: { id: lobbyId },
      data: { status: "DISPUTED" },
    });
  });
}

export async function adminConfirmResults(
  lobbyId: string,
  placements: { lobbyTeamId: string; placement: number }[]
) {
  await confirmLobbyResults(lobbyId, placements);
}
