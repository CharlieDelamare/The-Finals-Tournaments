"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { removeMember } from "@/lib/actions/team";
import { useTransition } from "react";

type Member = {
  id: string;
  role: string;
  status: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

type TeamRosterProps = {
  teamId: string;
  members: Member[];
  isOwner: boolean;
};

export function TeamRoster({ teamId, members, isOwner }: TeamRosterProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(memberId: string) {
    startTransition(async () => {
      await removeMember(teamId, memberId);
    });
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {member.user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium">
                {member.user.displayName || member.user.username}
              </p>
              <p className="text-xs text-muted-foreground">
                @{member.user.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                member.status === "ACCEPTED"
                  ? "default"
                  : member.status === "PENDING"
                    ? "secondary"
                    : "destructive"
              }
            >
              {member.status === "ACCEPTED" ? member.role : member.status}
            </Badge>
            {isOwner && member.role !== "OWNER" && member.status !== "DECLINED" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleRemove(member.id)}
                disabled={isPending}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
