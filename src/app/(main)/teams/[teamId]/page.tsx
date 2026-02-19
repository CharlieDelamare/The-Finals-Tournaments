import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/auth-utils";
import { getTeamById } from "@/lib/db/queries/team";
import { TeamRoster } from "@/components/team/team-roster";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await requireAuth();
  const team = await getTeamById(teamId);

  if (!team) notFound();

  const isOwner = team.members.some(
    (m) => m.userId === user.id && m.role === "OWNER" && m.status === "ACCEPTED"
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
            {team.tag}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {team.description && (
              <p className="mt-1 text-muted-foreground">{team.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Roster</CardTitle>
                <CardDescription>
                  {team.members.filter((m) => m.status === "ACCEPTED").length}{" "}
                  active members
                </CardDescription>
              </div>
              {isOwner && <InviteMemberDialog teamId={team.id} />}
            </CardHeader>
            <CardContent>
              <TeamRoster
                teamId={team.id}
                members={team.members}
                isOwner={isOwner}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tournament History</CardTitle>
            </CardHeader>
            <CardContent>
              {team.tournamentRegistrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tournaments yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {team.tournamentRegistrations.map((reg) => (
                    <Link
                      key={reg.id}
                      href={`/tournaments/${reg.tournament.id}`}
                      className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                    >
                      <p className="font-medium">{reg.tournament.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">
                          {reg.tournament.status.replace("_", " ")}
                        </Badge>
                        {reg.tournament.game && (
                          <span className="text-xs text-muted-foreground">
                            {reg.tournament.game}
                          </span>
                        )}
                      </div>
                    </Link>
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
