import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TournamentStatusBadge } from "./tournament-status-badge";

type TournamentCardProps = {
  tournament: {
    id: string;
    name: string;
    game: string | null;
    type: string;
    status: string;
    maxTeams: number | null;
    startDate: Date | null;
    _count: { registrations: number };
  };
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">
              {tournament.name}
            </CardTitle>
            <TournamentStatusBadge status={tournament.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              {tournament.game || "General"} &middot; {tournament.type}
            </p>
            <p>
              {tournament._count.registrations} registered
              {tournament.maxTeams ? ` / ${tournament.maxTeams}` : ""}
            </p>
            {tournament.startDate && (
              <p>Starts {new Date(tournament.startDate).toLocaleDateString()}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
