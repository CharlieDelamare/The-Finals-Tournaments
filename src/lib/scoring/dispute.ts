import { prisma } from "@/lib/db/prisma";
import { adminConfirmResults } from "./processor";

export async function resolveDispute(
  disputeId: string,
  adminId: string,
  resolution: string,
  placements: { lobbyTeamId: string; placement: number }[]
) {
  const dispute = await prisma.scoreDispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) throw new Error("Dispute not found");
  if (dispute.status !== "OPEN") throw new Error("Dispute already resolved");

  await prisma.scoreDispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      resolvedById: adminId,
      resolution,
      resolvedAt: new Date(),
    },
  });

  // Apply the admin-determined placements
  await adminConfirmResults(dispute.lobbyId, placements);
}

export async function dismissDispute(
  disputeId: string,
  adminId: string,
  reason: string
) {
  await prisma.scoreDispute.update({
    where: { id: disputeId },
    data: {
      status: "DISMISSED",
      resolvedById: adminId,
      resolution: reason,
      resolvedAt: new Date(),
    },
  });
}
