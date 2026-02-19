"use client";

import { useActionState } from "react";
import { createTournament } from "@/lib/actions/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type FormState = { error: Record<string, string[]> | null; tournamentId: string | null };

export function TournamentForm() {
  const [state, action, isPending] = useActionState<FormState, FormData>(createTournament, {
    error: null,
    tournamentId: null,
  });

  const errors = state?.error as Record<string, string[]> | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Tournament</CardTitle>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input id="name" name="name" required />
              {errors?.name && (
                <p className="text-sm text-destructive">{errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Input id="game" name="game" placeholder="The Finals" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tournament Type *</Label>
              <Select name="type" defaultValue="TEAM">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM">Team</SelectItem>
                  <SelectItem value="SOLO">Solo</SelectItem>
                  <SelectItem value="RANDOMISED">Randomised</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamsPerLobby">Teams per Lobby</Label>
              <Input
                id="teamsPerLobby"
                name="teamsPerLobby"
                type="number"
                min={2}
                defaultValue={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advancersPerLobby">Advancers per Lobby</Label>
              <Input
                id="advancersPerLobby"
                name="advancersPerLobby"
                type="number"
                min={1}
                defaultValue={2}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxTeams">Max Teams/Players</Label>
              <Input id="maxTeams" name="maxTeams" type="number" min={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minTeamSize">Min Team Size</Label>
              <Input id="minTeamSize" name="minTeamSize" type="number" min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTeamSize">Max Team Size</Label>
              <Input id="maxTeamSize" name="maxTeamSize" type="number" min={1} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="registrationOpenDate">Registration Opens</Label>
              <Input
                id="registrationOpenDate"
                name="registrationOpenDate"
                type="datetime-local"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationCloseDate">Registration Closes</Label>
              <Input
                id="registrationCloseDate"
                name="registrationCloseDate"
                type="datetime-local"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Rules</Label>
            <Textarea id="rules" name="rules" rows={5} placeholder="Tournament rules..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizeDescription">Prize Description</Label>
            <Input id="prizeDescription" name="prizeDescription" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create Tournament"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
