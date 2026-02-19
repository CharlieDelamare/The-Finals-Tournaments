import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TeamCardProps = {
  team: {
    id: string;
    name: string;
    tag: string;
    description?: string | null;
    members: Array<{ id: string }>;
  };
};

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <Badge variant="outline">{team.tag}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {team.description && (
            <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {team.members.length} member{team.members.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
