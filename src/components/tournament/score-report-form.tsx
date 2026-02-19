"use client";

import { useActionState, useState } from "react";
import { submitScoreAction } from "@/lib/actions/score";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Team = {
  lobbyTeamId: string;
  teamName: string;
  teamTag: string;
};

export function ScoreReportForm({
  lobbyId,
  teams,
}: {
  lobbyId: string;
  teams: Team[];
}) {
  type FormState = { error: string | null; status: string | undefined };
  const [placements, setPlacements] = useState<Record<string, number>>({});
  const [state, action, isPending] = useActionState<FormState, FormData>(submitScoreAction, {
    error: null,
    status: undefined,
  });

  const positions = Array.from({ length: teams.length }, (_, i) => i + 1);

  function setPlacement(lobbyTeamId: string, placement: number) {
    setPlacements((prev) => ({ ...prev, [lobbyTeamId]: placement }));
  }

  const allSet = teams.every((t) => placements[t.lobbyTeamId]);
  const usedPlacements = new Set(Object.values(placements));
  const hasDuplicates = usedPlacements.size < Object.keys(placements).length;

  return (
    <form action={action}>
      <input type="hidden" name="lobbyId" value={lobbyId} />
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

      {state?.error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state?.status === "confirmed" && (
        <div className="mb-4 rounded-md bg-green-500/10 p-3 text-sm text-green-500">
          Results confirmed! All reports agreed.
        </div>
      )}

      {state?.status === "disputed" && (
        <div className="mb-4 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-500">
          Report submitted, but there is a discrepancy with other reports. A
          dispute has been created.
        </div>
      )}

      <div className="space-y-3">
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
                setPlacement(team.lobbyTeamId, parseInt(v))
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

      <Button
        type="submit"
        className="mt-4 w-full"
        disabled={isPending || !allSet || hasDuplicates}
      >
        {isPending
          ? "Submitting..."
          : hasDuplicates
            ? "Fix duplicate placements"
            : "Submit Score Report"}
      </Button>
    </form>
  );
}
