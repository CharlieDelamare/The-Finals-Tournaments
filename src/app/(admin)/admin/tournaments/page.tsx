import { requireAdmin } from "@/lib/auth/auth-utils";
import { getTournaments } from "@/lib/db/queries/tournament";
import { TournamentStatusBadge } from "@/components/tournament/tournament-status-badge";
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

export default async function AdminTournamentsPage() {
  await requireAdmin();
  const tournaments = await getTournaments();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Button asChild>
          <Link href="/admin/tournaments/create">Create Tournament</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="font-medium">
                  {tournament.name}
                </TableCell>
                <TableCell>{tournament.type}</TableCell>
                <TableCell>
                  <TournamentStatusBadge status={tournament.status} />
                </TableCell>
                <TableCell>
                  {tournament._count.registrations}
                  {tournament.maxTeams ? ` / ${tournament.maxTeams}` : ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tournament.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/tournaments/${tournament.id}`}>
                      Manage
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tournaments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No tournaments yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
