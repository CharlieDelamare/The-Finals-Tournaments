import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth-utils";
import { getTournamentById } from "@/lib/db/queries/tournament";
import { getTeamsByUser } from "@/lib/db/queries/team";
import { TournamentStatusBadge } from "@/components/tournament/tournament-status-badge";
import { RegistrationButton } from "@/components/tournament/registration-button";
import { BracketView } from "@/components/tournament/bracket-view";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const user = await requireAuth();
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) notFound();

  const userMemberships = await getTeamsByUser(user.id);
  const userTeams = userMemberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    tag: m.team.tag,
  }));

  // Check if user is registered
  const userRegistration = tournament.registrations.find(
    (r) =>
      r.userId === user.id ||
      (r.teamId && userTeams.some((t) => t.id === r.teamId))
  );

  const hasRounds = tournament.rounds.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <TournamentStatusBadge status={tournament.status} />
            </div>
            {tournament.description && (
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {tournament.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {tournament.game && <Badge variant="outline">{tournament.game}</Badge>}
              <Badge variant="outline">{tournament.type}</Badge>
              <span>
                {tournament.teamsPerLobby} per lobby, top{" "}
                {tournament.advancersPerLobby} advance
              </span>
            </div>
          </div>
          <RegistrationButton
            tournamentId={tournament.id}
            tournamentType={tournament.type}
            tournamentStatus={tournament.status}
            isRegistered={!!userRegistration}
            registeredTeamId={userRegistration?.teamId ?? undefined}
            userTeams={userTeams.filter(
              (t) => !tournament.registrations.some((r) => r.teamId === t.id)
            )}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bracket */}
          {hasRounds && (
            <Card>
              <CardHeader>
                <CardTitle>Bracket</CardTitle>
              </CardHeader>
              <CardContent>
                <BracketView
                  rounds={tournament.rounds}
                  advancersPerLobby={tournament.advancersPerLobby}
                />
              </CardContent>
            </Card>
          )}

          {/* Rules */}
          {tournament.rules && (
            <Card>
              <CardHeader>
                <CardTitle>Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {tournament.rules}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tournament Info */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registered</span>
                <span>
                  {tournament._count.registrations}
                  {tournament.maxTeams ? ` / ${tournament.maxTeams}` : ""}
                </span>
              </div>
              {tournament.startDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {tournament.registrationOpenDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reg. Opens</span>
                  <span>
                    {new Date(tournament.registrationOpenDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {tournament.registrationCloseDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reg. Closes</span>
                  <span>
                    {new Date(tournament.registrationCloseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {tournament.prizeDescription && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Prize</span>
                    <p className="mt-1">{tournament.prizeDescription}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created by</span>
                <span>{tournament.createdBy.username}</span>
              </div>
            </CardContent>
          </Card>

          {/* Registrations */}
          <Card>
            <CardHeader>
              <CardTitle>
                Registered ({tournament.registrations.length})
              </CardTitle>
              <CardDescription>
                {tournament.type === "TEAM" ? "Teams" : "Players"} signed up
              </CardDescription>
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
                          : reg.user?.displayName || reg.user?.username || "Unknown"}
                      </span>
                      {reg.team && (
                        <span className="text-xs text-muted-foreground">
                          {reg.team.members.length} members
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
