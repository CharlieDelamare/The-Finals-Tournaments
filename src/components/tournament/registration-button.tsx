"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerTeamForTournament,
  registerUserForTournament,
  unregisterFromTournament,
} from "@/lib/actions/tournament";
import { useTransition, useState } from "react";
import { toast } from "sonner";

type Team = {
  id: string;
  name: string;
  tag: string;
};

type RegistrationButtonProps = {
  tournamentId: string;
  tournamentType: string;
  tournamentStatus: string;
  isRegistered: boolean;
  registeredTeamId?: string;
  userTeams: Team[];
};

export function RegistrationButton({
  tournamentId,
  tournamentType,
  tournamentStatus,
  isRegistered,
  registeredTeamId,
  userTeams,
}: RegistrationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  if (tournamentStatus !== "REGISTRATION_OPEN") {
    return null;
  }

  if (isRegistered) {
    return (
      <Button
        variant="destructive"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await unregisterFromTournament(
              tournamentId,
              registeredTeamId
            );
            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success("Unregistered successfully");
            }
          });
        }}
      >
        {isPending ? "Withdrawing..." : "Withdraw Registration"}
      </Button>
    );
  }

  if (tournamentType === "TEAM") {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {userTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                [{team.tag}] {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={isPending || !selectedTeam}
          onClick={() => {
            startTransition(async () => {
              const result = await registerTeamForTournament(
                tournamentId,
                selectedTeam
              );
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success("Team registered!");
              }
            });
          }}
        >
          {isPending ? "Registering..." : "Register Team"}
        </Button>
      </div>
    );
  }

  // SOLO or RANDOMISED
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await registerUserForTournament(tournamentId);
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success("Registered successfully!");
          }
        });
      }}
    >
      {isPending ? "Registering..." : "Register"}
    </Button>
  );
}
