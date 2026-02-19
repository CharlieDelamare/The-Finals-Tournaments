import { requireAuth } from "@/lib/auth/auth-utils";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PendingInvites } from "@/components/team/pending-invites";

export default async function DashboardPage() {
  const user = await requireAuth();
  const { teams, pendingInvites, upcomingTournaments } =
    await getDashboardData(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user.name || user.username}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your tournaments and teams.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Teams */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Teams</CardTitle>
              <CardDescription>Teams you&apos;re a member of</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href="/teams/create">Create Team</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re not on any teams yet.{" "}
                <Link
                  href="/teams/create"
                  className="text-primary hover:underline"
                >
                  Create one
                </Link>{" "}
                or wait for an invite.
              </p>
            ) : (
              <div className="space-y-3">
                {teams.map((membership) => (
                  <Link
                    key={membership.team.id}
                    href={`/teams/${membership.team.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{membership.team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        [{membership.team.tag}] &middot;{" "}
                        {membership.team.members.length} members
                      </p>
                    </div>
                    <Badge variant="secondary">{membership.role}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invites */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>Team invitations awaiting your response</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingInvites invites={pendingInvites} />
          </CardContent>
        </Card>

        {/* Upcoming Tournaments */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tournaments</CardTitle>
              <CardDescription>Open for registration or in progress</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/tournaments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingTournaments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active tournaments right now.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{tournament.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tournament.game || "General"} &middot;{" "}
                          {tournament.type}
                        </p>
                      </div>
                      <Badge
                        variant={
                          tournament.status === "REGISTRATION_OPEN"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {tournament.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tournament._count.registrations} registered
                      {tournament.maxTeams
                        ? ` / ${tournament.maxTeams} max`
                        : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
