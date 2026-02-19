"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LobbyTeam = {
  id: string;
  placement: number | null;
  isAdvancer: boolean;
  isBye: boolean;
  seed: number | null;
  team: { id: string; name: string; tag: string };
};

type Lobby = {
  id: string;
  lobbyNumber: number;
  status: string;
  lobbyTeams: LobbyTeam[];
  _count: { scoreReports: number; disputes: number };
};

type Round = {
  id: string;
  roundNumber: number;
  name: string;
  status: string;
  lobbies: Lobby[];
};

const statusColors: Record<string, string> = {
  PENDING: "border-muted",
  IN_PROGRESS: "border-blue-500",
  AWAITING_RESULTS: "border-yellow-500",
  RESULTS_CONFIRMED: "border-green-500",
  DISPUTED: "border-red-500",
};

export function BracketView({
  rounds,
  advancersPerLobby,
}: {
  rounds: Round[];
  advancersPerLobby: number;
}) {
  if (rounds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Bracket has not been generated yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="flex gap-6"
        style={{ minWidth: `${rounds.length * 280}px` }}
      >
        {rounds.map((round) => (
          <div key={round.id} className="w-64 shrink-0">
            <div className="mb-3 text-center">
              <h3 className="font-semibold">{round.name}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  round.status === "COMPLETED" && "text-green-500",
                  round.status === "IN_PROGRESS" && "text-blue-500"
                )}
              >
                {round.status}
              </Badge>
            </div>

            <div className="space-y-4">
              {round.lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className={cn(
                    "rounded-lg border-2 bg-card p-3",
                    statusColors[lobby.status] || "border-muted"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Lobby {lobby.lobbyNumber}</span>
                    <div className="flex items-center gap-1">
                      {lobby._count.disputes > 0 && (
                        <Badge variant="destructive" className="h-5 text-[10px]">
                          Disputed
                        </Badge>
                      )}
                      {lobby.status === "RESULTS_CONFIRMED" && (
                        <Badge variant="outline" className="h-5 text-[10px] text-green-500">
                          Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {lobby.lobbyTeams
                      .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99))
                      .map((lt) => (
                        <div
                          key={lt.id}
                          className={cn(
                            "flex items-center justify-between rounded px-2 py-1 text-sm",
                            lt.isBye && "opacity-30",
                            lt.isAdvancer &&
                              "bg-green-500/10 text-green-400",
                            lt.placement &&
                              !lt.isAdvancer &&
                              "opacity-50"
                          )}
                        >
                          <span className="truncate">
                            {lt.isBye ? (
                              <span className="italic">BYE</span>
                            ) : (
                              <>
                                <span className="text-muted-foreground">
                                  [{lt.team.tag}]
                                </span>{" "}
                                {lt.team.name}
                              </>
                            )}
                          </span>
                          {lt.placement && (
                            <Badge
                              variant={lt.isAdvancer ? "default" : "secondary"}
                              className="ml-2 h-5 text-[10px]"
                            >
                              #{lt.placement}
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
