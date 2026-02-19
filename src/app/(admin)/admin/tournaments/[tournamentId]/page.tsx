import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth-utils";
import { getTournamentById } from "@/lib/db/queries/tournament";
import { TournamentStatusBadge } from "@/components/tournament/tournament-status-badge";
import { TournamentStatusManager } from "@/components/admin/tournament-status-manager";
import { BracketManager } from "@/components/admin/bracket-manager";
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

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  await requireAdmin();
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <TournamentStatusBadge status={tournament.status} />
            <Badge variant="outline">{tournament.type}</Badge>
            {tournament.game && (
              <Badge variant="outline">{tournament.game}</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/tournaments/${tournament.id}`}>
            View Public Page
          </Link>
        </Button>
      </div>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Status Management</CardTitle>
          <CardDescription>Change the tournament status</CardDescription>
        </CardHeader>
        <CardContent>
          <TournamentStatusManager
            tournamentId={tournament.id}
            currentStatus={tournament.status}
          />
        </CardContent>
      </Card>

      {/* Bracket Management */}
      <Card>
        <CardHeader>
          <CardTitle>Bracket Management</CardTitle>
          <CardDescription>
            Generate and manage the tournament bracket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BracketManager
            tournamentId={tournament.id}
            tournamentStatus={tournament.status}
            registrationCount={tournament._count.registrations}
            hasRounds={tournament.rounds.length > 0}
            tournamentType={tournament.type}
          />
        </CardContent>
      </Card>

      {/* Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registrations ({tournament.registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tournament.registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No registrations yet.
            </p>
          ) : (
            <div className="space-y-2">
              {tournament.registrations.map((reg, idx) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {idx + 1}.{" "}
                    {reg.team
                      ? `[${reg.team.tag}] ${reg.team.name}`
                      : reg.user?.displayName || reg.user?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {reg.registeredAt.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Teams per Lobby:</span>{" "}
            {tournament.teamsPerLobby}
          </div>
          <div>
            <span className="text-muted-foreground">Advancers per Lobby:</span>{" "}
            {tournament.advancersPerLobby}
          </div>
          <div>
            <span className="text-muted-foreground">Max Teams:</span>{" "}
            {tournament.maxTeams || "Unlimited"}
          </div>
          <div>
            <span className="text-muted-foreground">Team Size:</span>{" "}
            {tournament.minTeamSize || "?"} - {tournament.maxTeamSize || "?"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
