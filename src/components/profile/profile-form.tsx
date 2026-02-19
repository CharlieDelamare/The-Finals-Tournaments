"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfileFormProps = {
  user: {
    displayName: string | null;
    avatarUrl: string | null;
  };
};

type FormState = { error: Record<string, string[]> | null; success: boolean };

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, isPending] = useActionState<FormState, FormData>(updateProfile, {
    error: null,
    success: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {state?.success && (
            <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
              Profile updated successfully!
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={user.displayName || ""}
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              defaultValue={user.avatarUrl || ""}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
