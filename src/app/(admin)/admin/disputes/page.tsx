import { requireAdmin } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function AdminDisputesPage() {
  await requireAdmin();

  const disputes = await prisma.scoreDispute.findMany({
    include: {
      lobby: {
        include: {
          round: {
            include: { tournament: { select: { id: true, name: true } } },
          },
        },
      },
      raisedBy: { select: { username: true } },
      resolvedBy: { select: { username: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Score Disputes</h1>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Lobby</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell>{dispute.lobby.round.tournament.name}</TableCell>
                <TableCell>
                  {dispute.lobby.round.name} — L{dispute.lobby.lobbyNumber}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      dispute.status === "OPEN"
                        ? "destructive"
                        : dispute.status === "RESOLVED"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {dispute.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {dispute.reason}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dispute.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {dispute.status === "OPEN" && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/disputes/${dispute.id}`}>
                        Resolve
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {disputes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No disputes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
