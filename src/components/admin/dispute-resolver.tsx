"use client";

import { useActionState, useState } from "react";
import { resolveDisputeAction } from "@/lib/actions/score";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Team = {
  lobbyTeamId: string;
  teamName: string;
  teamTag: string;
};

export function DisputeResolver({
  disputeId,
  teams,
}: {
  disputeId: string;
  teams: Team[];
}) {
  type FormState = { error: string | null };
  const [placements, setPlacements] = useState<Record<string, number>>({});
  const [state, action, isPending] = useActionState<FormState, FormData>(resolveDisputeAction, {
    error: null,
  });

  const positions = Array.from({ length: teams.length }, (_, i) => i + 1);
  const allSet = teams.every((t) => placements[t.lobbyTeamId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolve Dispute</CardTitle>
      </CardHeader>
      <form action={action}>
        <input type="hidden" name="disputeId" value={disputeId} />
        <input
          type="hidden"
          name="placements"
          value={JSON.stringify(
            teams.map((t) => ({
              lobbyTeamId: t.lobbyTeamId,
              placement: placements[t.lobbyTeamId] || 0,
            }))
          )}
        />

        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Set Final Placements</Label>
            <div className="space-y-2">
              {teams.map((team) => (
                <div
                  key={team.lobbyTeamId}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="font-medium">
                    [{team.teamTag}] {team.teamName}
                  </span>
                  <Select
                    value={placements[team.lobbyTeamId]?.toString() || ""}
                    onValueChange={(v) =>
                      setPlacements((prev) => ({
                        ...prev,
                        [team.lobbyTeamId]: parseInt(v),
                      }))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Place" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos.toString()}>
                          #{pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution Notes</Label>
            <Textarea
              id="resolution"
              name="resolution"
              placeholder="Explain how the dispute was resolved..."
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !allSet}
          >
            {isPending ? "Resolving..." : "Resolve Dispute"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
