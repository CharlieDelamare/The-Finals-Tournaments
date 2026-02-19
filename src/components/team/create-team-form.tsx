"use client";

import { useActionState } from "react";
import { createTeam } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormState = { error: Record<string, string[]> | null; teamId: string | null };

export function CreateTeamForm() {
  const [state, action, isPending] = useActionState<FormState, FormData>(createTeam, {
    error: null,
    teamId: null,
  });

  const errors = state?.error as Record<string, string[]> | null;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Create a Team</CardTitle>
        <CardDescription>
          Set up your team and start inviting players
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Shadow Strikers"
              required
            />
            {errors?.name && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag">Tag (2-5 characters)</Label>
            <Input
              id="tag"
              name="tag"
              placeholder="SS"
              maxLength={5}
              required
            />
            {errors?.tag && (
              <p className="text-sm text-destructive">{errors.tag[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us about your team..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create Team"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
