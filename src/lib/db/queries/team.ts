import { prisma } from "@/lib/db/prisma";

export async function getTeamsByUser(userId: string) {
  return prisma.teamMember.findMany({
    where: { userId, status: "ACCEPTED" },
    include: {
      team: {
        include: {
          members: { where: { status: "ACCEPTED" }, include: { user: { select: { id: true, username: true, displayName: true } } } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function getTeamById(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      },
      tournamentRegistrations: {
        include: {
          tournament: { select: { id: true, name: true, status: true, game: true } },
        },
        orderBy: { registeredAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getPendingInvites(userId: string) {
  return prisma.teamMember.findMany({
    where: { userId, status: "PENDING" },
    include: {
      team: {
        include: {
          members: {
            where: { role: "OWNER", status: "ACCEPTED" },
            include: { user: { select: { username: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function searchUsers(query: string, excludeTeamId?: string) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, username: true, displayName: true, email: true },
    take: 10,
  });

  if (excludeTeamId) {
    const existingMembers = await prisma.teamMember.findMany({
      where: { teamId: excludeTeamId, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { userId: true },
    });
    const memberIds = new Set(existingMembers.map((m) => m.userId));
    return users.filter((u) => !memberIds.has(u.id));
  }

  return users;
}

export async function getAllTeams() {
  return prisma.team.findMany({
    include: {
      members: { where: { status: "ACCEPTED" } },
    },
    orderBy: { createdAt: "desc" },
  });
}
