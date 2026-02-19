"use client";

import { Button } from "@/components/ui/button";
import { generateBracketAction } from "@/lib/actions/bracket";
import { generateRandomTeams } from "@/lib/actions/tournament";
import { useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";

type BracketManagerProps = {
  tournamentId: string;
  tournamentStatus: string;
  registrationCount: number;
  hasRounds: boolean;
  tournamentType: string;
};

export function BracketManager({
  tournamentId,
  tournamentStatus,
  registrationCount,
  hasRounds,
  tournamentType,
}: BracketManagerProps) {
  const [isPending, startTransition] = useTransition();

  const canGenerate =
    (tournamentStatus === "REGISTRATION_CLOSED" ||
      tournamentStatus === "IN_PROGRESS") &&
    registrationCount >= 2;

  const needsRandomTeams =
    tournamentType === "RANDOMISED" &&
    tournamentStatus === "REGISTRATION_CLOSED";

  return (
    <div className="space-y-4">
      {needsRandomTeams && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            This is a randomised tournament. Generate random teams first.
          </p>
          <Button
            disabled={isPending}
            variant="secondary"
            onClick={() => {
              startTransition(async () => {
                const result = await generateRandomTeams(tournamentId);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Random teams generated!");
                }
              });
            }}
          >
            {isPending ? "Generating..." : "Generate Random Teams"}
          </Button>
        </div>
      )}

      {canGenerate && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {hasRounds
              ? "Regenerating the bracket will delete existing bracket data."
              : `Generate bracket for ${registrationCount} registered teams.`}
          </p>
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await generateBracketAction(tournamentId);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Bracket generated!");
                }
              });
            }}
          >
            {isPending
              ? "Generating..."
              : hasRounds
                ? "Regenerate Bracket"
                : "Generate Bracket"}
          </Button>
        </div>
      )}

      {!canGenerate && !needsRandomTeams && (
        <p className="text-sm text-muted-foreground">
          {registrationCount < 2
            ? "Need at least 2 registrations to generate a bracket."
            : "Close registration first to generate the bracket."}
        </p>
      )}

      {hasRounds && (
        <Button variant="outline" asChild>
          <Link href={`/tournaments/${tournamentId}`}>View Bracket</Link>
        </Button>
      )}
    </div>
  );
}
