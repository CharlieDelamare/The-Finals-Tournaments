import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { DisputeResolver } from "@/components/admin/dispute-resolver";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ disputeId: string }>;
}) {
  const { disputeId } = await params;
  await requireAdmin();

  const dispute = await prisma.scoreDispute.findUnique({
    where: { id: disputeId },
    include: {
      lobby: {
        include: {
          round: {
            include: { tournament: true },
          },
          lobbyTeams: {
            where: { isBye: false },
            include: {
              team: { select: { id: true, name: true, tag: true } },
            },
            orderBy: { seed: "asc" },
          },
          scoreReports: {
            include: {
              reporter: { select: { username: true } },
              entries: {
                include: {
                  lobbyTeam: {
                    include: { team: { select: { name: true, tag: true } } },
                  },
                },
                orderBy: { placement: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      raisedBy: { select: { username: true } },
    },
  });

  if (!dispute) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispute Resolution</h1>
        <p className="mt-1 text-muted-foreground">
          {dispute.lobby.round.tournament.name} — {dispute.lobby.round.name},
          Lobby {dispute.lobby.lobbyNumber}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Dispute Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{dispute.status}</Badge>
          </div>
          <p className="text-sm">{dispute.reason}</p>
        </CardContent>
      </Card>

      {/* Score Reports Side by Side */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
          <CardDescription>Compare reports to identify discrepancies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {dispute.lobby.scoreReports.map((report, idx) => (
              <div key={report.id} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-sm font-medium">
                  Report #{idx + 1} by @{report.reporter.username}
                </p>
                <div className="space-y-1">
                  {report.entries
                    .sort((a, b) => a.placement - b.placement)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          [{entry.lobbyTeam.team.tag}]{" "}
                          {entry.lobbyTeam.team.name}
                        </span>
                        <span className="font-medium">#{entry.placement}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resolution Form */}
      {dispute.status === "OPEN" && (
        <DisputeResolver
          disputeId={dispute.id}
          teams={dispute.lobby.lobbyTeams.map((lt) => ({
            lobbyTeamId: lt.id,
            teamName: lt.team.name,
            teamTag: lt.team.tag,
          }))}
        />
      )}
    </div>
  );
}
