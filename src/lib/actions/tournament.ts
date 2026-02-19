"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/auth-utils";
import { createTournamentSchema } from "@/lib/validators/tournament";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TournamentStatus } from "@prisma/client";

export async function createTournament(
  _prevState: any,
  formData: FormData
) {
  const user = await requireAdmin();

  const parsed = createTournamentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    game: formData.get("game"),
    type: formData.get("type"),
    maxTeams: formData.get("maxTeams") || undefined,
    minTeamSize: formData.get("minTeamSize") || undefined,
    maxTeamSize: formData.get("maxTeamSize") || undefined,
    teamsPerLobby: formData.get("teamsPerLobby") || 4,
    advancersPerLobby: formData.get("advancersPerLobby") || 2,
    registrationOpenDate: formData.get("registrationOpenDate") || undefined,
    registrationCloseDate: formData.get("registrationCloseDate") || undefined,
    startDate: formData.get("startDate") || undefined,
    rules: formData.get("rules"),
    prizeDescription: formData.get("prizeDescription"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, tournamentId: null };
  }

  const tournament = await prisma.tournament.create({
    data: {
      ...parsed.data,
      createdById: user.id,
    },
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
  redirect(`/admin/tournaments/${tournament.id}`);
}

export async function updateTournamentStatus(
  tournamentId: string,
  status: TournamentStatus
) {
  await requireAdmin();

  const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
    DRAFT: ["REGISTRATION_OPEN", "CANCELLED"],
    REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
    REGISTRATION_CLOSED: ["IN_PROGRESS", "REGISTRATION_OPEN", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: ["DRAFT"],
  };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) return { error: "Tournament not found" };

  if (!validTransitions[tournament.status].includes(status)) {
    return { error: `Cannot transition from ${tournament.status} to ${status}` };
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status },
  });

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath("/tournaments");
  return { error: null };
}

export async function registerTeamForTournament(
  tournamentId: string,
  teamId: string
) {
  const user = await requireAuth();

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) return { error: "Tournament not found" };
  if (tournament.status !== "REGISTRATION_OPEN") {
    return { error: "Registration is not open" };
  }
  if (tournament.type !== "TEAM") {
    return { error: "This is not a team tournament" };
  }

  // Verify user owns the team
  const ownership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id, role: "OWNER", status: "ACCEPTED" },
  });
  if (!ownership) return { error: "You don't own this team" };

  // Check team size requirements
  const memberCount = await prisma.teamMember.count({
    where: { teamId, status: "ACCEPTED" },
  });
  if (tournament.minTeamSize && memberCount < tournament.minTeamSize) {
    return { error: `Team needs at least ${tournament.minTeamSize} members` };
  }
  if (tournament.maxTeamSize && memberCount > tournament.maxTeamSize) {
    return { error: `Team has too many members (max ${tournament.maxTeamSize})` };
  }

  // Check max teams cap
  if (tournament.maxTeams) {
    const currentCount = await prisma.tournamentRegistration.count({
      where: { tournamentId },
    });
    if (currentCount >= tournament.maxTeams) {
      return { error: "Tournament is full" };
    }
  }

  // Check duplicate registration
  const existing = await prisma.tournamentRegistration.findFirst({
    where: { tournamentId, teamId },
  });
  if (existing) return { error: "Team is already registered" };

  await prisma.tournamentRegistration.create({
    data: { tournamentId, teamId },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  return { error: null };
}

export async function registerUserForTournament(tournamentId: string) {
  const user = await requireAuth();

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) return { error: "Tournament not found" };
  if (tournament.status !== "REGISTRATION_OPEN") {
    return { error: "Registration is not open" };
  }
  if (tournament.type === "TEAM") {
    return { error: "Use team registration for team tournaments" };
  }

  // Check max capacity
  if (tournament.maxTeams) {
    const currentCount = await prisma.tournamentRegistration.count({
      where: { tournamentId },
    });
    if (currentCount >= tournament.maxTeams) {
      return { error: "Tournament is full" };
    }
  }

  // Check duplicate
  const existing = await prisma.tournamentRegistration.findFirst({
    where: { tournamentId, userId: user.id },
  });
  if (existing) return { error: "Already registered" };

  await prisma.tournamentRegistration.create({
    data: { tournamentId, userId: user.id },
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  return { error: null };
}

export async function unregisterFromTournament(
  tournamentId: string,
  teamId?: string
) {
  const user = await requireAuth();

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) return { error: "Tournament not found" };
  if (tournament.status !== "REGISTRATION_OPEN") {
    return { error: "Cannot unregister after registration closes" };
  }

  if (teamId) {
    const ownership = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id, role: "OWNER", status: "ACCEPTED" },
    });
    if (!ownership) return { error: "You don't own this team" };

    await prisma.tournamentRegistration.deleteMany({
      where: { tournamentId, teamId },
    });
  } else {
    await prisma.tournamentRegistration.deleteMany({
      where: { tournamentId, userId: user.id },
    });
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  return { error: null };
}

export async function generateRandomTeams(tournamentId: string) {
  await requireAdmin();

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: { where: { teamId: null } } },
  });

  if (!tournament) return { error: "Tournament not found" };
  if (tournament.type !== "RANDOMISED") return { error: "Not a randomised tournament" };

  const teamSize = tournament.maxTeamSize || 4;
  const userIds = tournament.registrations.map((r) => r.userId).filter(Boolean) as string[];

  // Shuffle
  for (let i = userIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [userIds[i], userIds[j]] = [userIds[j], userIds[i]];
  }

  // Split into groups
  const groups: string[][] = [];
  for (let i = 0; i < userIds.length; i += teamSize) {
    groups.push(userIds.slice(i, i + teamSize));
  }

  // Handle remainder: if last group is too small, distribute members
  if (
    groups.length > 1 &&
    tournament.minTeamSize &&
    groups[groups.length - 1].length < tournament.minTeamSize
  ) {
    const lastGroup = groups.pop()!;
    lastGroup.forEach((uid, idx) => {
      groups[idx % groups.length].push(uid);
    });
  }

  // Create teams and registrations in a transaction
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < groups.length; i++) {
      const team = await tx.team.create({
        data: {
          name: `Team ${i + 1} (${tournament.name})`,
          tag: `T${i + 1}`,
          description: `Auto-generated team for ${tournament.name}`,
          members: {
            create: groups[i].map((uid, idx) => ({
              userId: uid,
              role: idx === 0 ? "OWNER" : "MEMBER",
              status: "ACCEPTED",
            })),
          },
        },
      });

      await tx.tournamentRegistration.create({
        data: { tournamentId, teamId: team.id },
      });
    }

    // Remove individual registrations
    await tx.tournamentRegistration.deleteMany({
      where: { tournamentId, teamId: null },
    });
  });

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
  return { error: null };
}
