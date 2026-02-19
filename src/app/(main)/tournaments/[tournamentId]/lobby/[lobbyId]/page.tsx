import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { ScoreReportForm } from "@/components/tournament/score-report-form";
import { TournamentStatusBadge } from "@/components/tournament/tournament-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LobbyDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string; lobbyId: string }>;
}) {
  const { tournamentId, lobbyId } = await params;
  const user = await requireAuth();

  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      round: {
        include: { tournament: true },
      },
      lobbyTeams: {
        include: {
          team: {
            include: {
              members: { where: { status: "ACCEPTED" }, select: { userId: true } },
            },
          },
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
          },
        },
        orderBy: { createdAt: "asc" },
      },
      disputes: {
        include: {
          raisedBy: { select: { username: true } },
          resolvedBy: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lobby) notFound();

  // Check if user belongs to a team in this lobby
  const userTeamInLobby = lobby.lobbyTeams.find(
    (lt) => !lt.isBye && lt.team.members.some((m) => m.userId === user.id)
  );

  const hasAlreadyReported = lobby.scoreReports.some(
    (r) => r.reportedByTeamId === userTeamInLobby?.teamId
  );

  const canReport =
    !!userTeamInLobby &&
    !hasAlreadyReported &&
    (lobby.status === "IN_PROGRESS" || lobby.status === "AWAITING_RESULTS");

  const nonByeTeams = lobby.lobbyTeams.filter((lt) => !lt.isBye);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/tournaments/${tournamentId}`}>Back to Tournament</Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {lobby.round.name} — Lobby {lobby.lobbyNumber}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {lobby.round.tournament.name}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge
            variant={
              lobby.status === "RESULTS_CONFIRMED"
                ? "default"
                : lobby.status === "DISPUTED"
                  ? "destructive"
                  : "secondary"
            }
          >
            {lobby.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teams */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lobby.lobbyTeams
                .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99))
                .map((lt) => (
                  <div
                    key={lt.id}
                    className={`flex items-center justify-between rounded-md border border-border px-3 py-2 ${lt.isBye ? "opacity-30" : ""} ${lt.isAdvancer ? "border-green-500/50 bg-green-500/5" : ""}`}
                  >
                    <span className="font-medium">
                      {lt.isBye ? (
                        <span className="italic text-muted-foreground">
                          BYE
                        </span>
                      ) : (
                        <>
                          [{lt.team.tag}] {lt.team.name}
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {lt.placement && (
                        <Badge
                          variant={lt.isAdvancer ? "default" : "secondary"}
                        >
                          #{lt.placement}
                        </Badge>
                      )}
                      {lt.isAdvancer && (
                        <Badge variant="outline" className="text-green-500">
                          Advanced
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Score Reports</CardTitle>
            <CardDescription>
              {lobby.scoreReports.length} report(s) submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lobby.scoreReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reports submitted yet.
              </p>
            ) : (
              <div className="space-y-4">
                {lobby.scoreReports.map((report, idx) => (
                  <div key={report.id} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Report #{idx + 1} by @{report.reporter.username}
                      </span>
                      <Badge variant={report.isConfirmed ? "default" : "secondary"}>
                        {report.isConfirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {report.entries
                        .sort((a, b) => a.placement - b.placement)
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              [{entry.lobbyTeam.team.tag}]{" "}
                              {entry.lobbyTeam.team.name}
                            </span>
                            <span className="text-muted-foreground">
                              #{entry.placement}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Report Form */}
      {canReport && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submit Score Report</CardTitle>
            <CardDescription>
              Report the final placements for all teams in this lobby
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreReportForm
              lobbyId={lobbyId}
              teams={nonByeTeams.map((lt) => ({
                lobbyTeamId: lt.id,
                teamName: lt.team.name,
                teamTag: lt.team.tag,
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Disputes */}
      {lobby.disputes.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lobby.disputes.map((dispute) => (
                <div key={dispute.id} className="rounded-lg border border-destructive/50 p-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={dispute.status === "OPEN" ? "destructive" : "secondary"}
                    >
                      {dispute.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {dispute.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{dispute.reason}</p>
                  {dispute.resolution && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resolution: {dispute.resolution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
