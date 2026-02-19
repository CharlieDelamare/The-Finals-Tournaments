import { prisma } from "@/lib/db/prisma";

export async function getDashboardData(userId: string) {
  const [teams, pendingInvites, upcomingTournaments, recentResults] =
    await Promise.all([
      prisma.teamMember.findMany({
        where: { userId, status: "ACCEPTED" },
        include: {
          team: {
            include: {
              members: { where: { status: "ACCEPTED" } },
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      }),
      prisma.teamMember.findMany({
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
      }),
      prisma.tournament.findMany({
        where: {
          status: { in: ["REGISTRATION_OPEN", "IN_PROGRESS"] },
        },
        include: {
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: "asc" },
        take: 6,
      }),
      prisma.lobbyTeam.findMany({
        where: {
          team: {
            members: { some: { userId, status: "ACCEPTED" } },
          },
          placement: { not: null },
        },
        include: {
          lobby: {
            include: {
              round: { include: { tournament: true } },
            },
          },
          team: true,
        },
        orderBy: { lobby: { round: { tournament: { updatedAt: "desc" } } } },
        take: 5,
      }),
    ]);

  return { teams, pendingInvites, upcomingTournaments, recentResults };
}
