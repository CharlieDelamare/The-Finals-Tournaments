import { prisma } from "@/lib/db/prisma";
import { TournamentStatus, TournamentType } from "@prisma/client";

export async function getTournaments(filters?: {
  status?: TournamentStatus;
  type?: TournamentType;
  search?: string;
}) {
  return prisma.tournament.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.search && {
        name: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    include: {
      _count: { select: { registrations: true } },
      createdBy: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTournamentById(tournamentId: string) {
  return prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      createdBy: { select: { username: true, displayName: true } },
      _count: { select: { registrations: true } },
      registrations: {
        include: {
          team: {
            include: {
              members: { where: { status: "ACCEPTED" } },
            },
          },
          user: { select: { id: true, username: true, displayName: true } },
        },
        orderBy: { registeredAt: "asc" },
      },
      rounds: {
        include: {
          lobbies: {
            include: {
              lobbyTeams: {
                include: {
                  team: { select: { id: true, name: true, tag: true } },
                },
                orderBy: { seed: "asc" },
              },
              _count: { select: { scoreReports: true, disputes: true } },
            },
            orderBy: { lobbyNumber: "asc" },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });
}

export async function getTournamentBracket(tournamentId: string) {
  return prisma.tournamentRound.findMany({
    where: { tournamentId },
    include: {
      lobbies: {
        include: {
          lobbyTeams: {
            include: {
              team: { select: { id: true, name: true, tag: true } },
            },
            orderBy: { seed: "asc" },
          },
          _count: { select: { scoreReports: true, disputes: true } },
        },
        orderBy: { lobbyNumber: "asc" },
      },
    },
    orderBy: { roundNumber: "asc" },
  });
}

export async function getAdminStats() {
  const [tournamentCount, userCount, teamCount, openDisputes] =
    await Promise.all([
      prisma.tournament.count(),
      prisma.user.count(),
      prisma.team.count(),
      prisma.scoreDispute.count({ where: { status: "OPEN" } }),
    ]);
  return { tournamentCount, userCount, teamCount, openDisputes };
}
