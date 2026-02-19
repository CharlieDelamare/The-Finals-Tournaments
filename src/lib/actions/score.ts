"use server";

import { requireAuth, requireAdmin } from "@/lib/auth/auth-utils";
import { submitScoreReport, adminConfirmResults } from "@/lib/scoring/processor";
import { resolveDispute } from "@/lib/scoring/dispute";
import { submitScoreSchema, resolveDisputeSchema } from "@/lib/validators/score";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function submitScoreAction(
  _prevState: any,
  formData: FormData
) {
  const user = await requireAuth();

  const lobbyId = formData.get("lobbyId") as string;
  const placementsRaw = formData.get("placements") as string;

  let placements: { lobbyTeamId: string; placement: number }[];
  try {
    placements = JSON.parse(placementsRaw);
  } catch {
    return { error: "Invalid placements data", status: undefined };
  }

  const parsed = submitScoreSchema.safeParse({ lobbyId, placements });
  if (!parsed.success) {
    return { error: "Invalid input", status: undefined };
  }

  // Find user's team in this lobby
  const lobbyTeam = await prisma.lobbyTeam.findFirst({
    where: {
      lobbyId,
      team: {
        members: { some: { userId: user.id, status: "ACCEPTED" } },
      },
    },
  });

  try {
    const result = await submitScoreReport(
      lobbyId,
      user.id,
      lobbyTeam?.teamId ?? null,
      parsed.data.placements
    );

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { round: true },
    });

    if (lobby) {
      revalidatePath(`/tournaments/${lobby.tournamentId}`);
    }

    return { error: null, status: result };
  } catch (e) {
    return { error: (e as Error).message, status: undefined };
  }
}

export async function adminSetResultsAction(
  lobbyId: string,
  placements: { lobbyTeamId: string; placement: number }[]
) {
  await requireAdmin();

  try {
    await adminConfirmResults(lobbyId, placements);

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
    });

    if (lobby) {
      revalidatePath(`/tournaments/${lobby.tournamentId}`);
      revalidatePath(`/admin/tournaments/${lobby.tournamentId}`);
    }

    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function resolveDisputeAction(
  _prevState: any,
  formData: FormData
) {
  const admin = await requireAdmin();

  const disputeId = formData.get("disputeId") as string;
  const resolution = formData.get("resolution") as string;
  const placementsRaw = formData.get("placements") as string;

  let placements: { lobbyTeamId: string; placement: number }[];
  try {
    placements = JSON.parse(placementsRaw);
  } catch {
    return { error: "Invalid placements data" };
  }

  const parsed = resolveDisputeSchema.safeParse({
    disputeId,
    resolution,
    placements,
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  try {
    await resolveDispute(
      disputeId,
      admin.id,
      resolution,
      parsed.data.placements
    );

    revalidatePath("/admin/disputes");
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
