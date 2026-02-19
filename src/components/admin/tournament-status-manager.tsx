"use client";

import { Button } from "@/components/ui/button";
import { updateTournamentStatus } from "@/lib/actions/tournament";
import { useTransition } from "react";
import { toast } from "sonner";

const transitions: Record<string, { label: string; status: string; variant: "default" | "destructive" | "outline" | "secondary" }[]> = {
  DRAFT: [
    { label: "Open Registration", status: "REGISTRATION_OPEN", variant: "default" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  REGISTRATION_OPEN: [
    { label: "Close Registration", status: "REGISTRATION_CLOSED", variant: "secondary" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  REGISTRATION_CLOSED: [
    { label: "Start Tournament", status: "IN_PROGRESS", variant: "default" },
    { label: "Reopen Registration", status: "REGISTRATION_OPEN", variant: "outline" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  IN_PROGRESS: [
    { label: "Mark Completed", status: "COMPLETED", variant: "default" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  CANCELLED: [
    { label: "Reset to Draft", status: "DRAFT", variant: "outline" },
  ],
  COMPLETED: [],
};

export function TournamentStatusManager({
  tournamentId,
  currentStatus,
}: {
  tournamentId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const availableTransitions = transitions[currentStatus] || [];

  if (availableTransitions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {availableTransitions.map((t) => (
        <Button
          key={t.status}
          variant={t.variant}
          size="sm"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await updateTournamentStatus(
                tournamentId,
                t.status as never
              );
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success(`Status changed to ${t.status}`);
              }
            });
          }}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
