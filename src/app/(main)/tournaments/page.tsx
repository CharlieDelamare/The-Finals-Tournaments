import { getTournaments } from "@/lib/db/queries/tournament";
import { TournamentCard } from "@/components/tournament/tournament-card";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; search?: string }>;
}) {
  const params = await searchParams;
  const tournaments = await getTournaments({
    status: params.status as never,
    type: params.type as never,
    search: params.search,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <p className="mt-1 text-muted-foreground">
          Browse and register for upcoming tournaments
        </p>
      </div>

      {tournaments.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No tournaments found. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
