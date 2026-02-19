import { requireAuth } from "@/lib/auth/auth-utils";
import { getAllTeams, getTeamsByUser } from "@/lib/db/queries/team";
import { TeamCard } from "@/components/team/team-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TeamsPage() {
  const user = await requireAuth();
  const [myMemberships, allTeams] = await Promise.all([
    getTeamsByUser(user.id),
    getAllTeams(),
  ]);

  const myTeamIds = new Set(myMemberships.map((m) => m.team.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your teams or browse existing ones
          </p>
        </div>
        <Button asChild>
          <Link href="/teams/create">Create Team</Link>
        </Button>
      </div>

      {myMemberships.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">My Teams</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myMemberships.map((membership) => (
              <TeamCard key={membership.team.id} team={membership.team} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">All Teams</h2>
        {allTeams.length === 0 ? (
          <p className="text-muted-foreground">No teams created yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTeams
              .filter((t) => !myTeamIds.has(t.id))
              .map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
