"use client";

import { respondToInvite } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

type Invite = {
  id: string;
  team: {
    id: string;
    name: string;
    tag: string;
    members: Array<{
      user: { username: string };
    }>;
  };
};

export function PendingInvites({ invites }: { invites: Invite[] }) {
  const [isPending, startTransition] = useTransition();

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No pending invites.</p>
    );
  }

  function handleResponse(id: string, accept: boolean) {
    startTransition(async () => {
      await respondToInvite(id, accept);
    });
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="rounded-lg border border-border p-3"
        >
          <p className="font-medium">
            {invite.team.name}{" "}
            <span className="text-muted-foreground">[{invite.team.tag}]</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Invited by{" "}
            {invite.team.members[0]?.user?.username || "Unknown"}
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={() => handleResponse(invite.id, true)}
              disabled={isPending}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResponse(invite.id, false)}
              disabled={isPending}
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
