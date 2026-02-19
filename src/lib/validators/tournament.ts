import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().optional(),
  game: z.string().optional(),
  type: z.enum(["TEAM", "SOLO", "RANDOMISED"]),
  maxTeams: z.coerce.number().int().min(2).optional(),
  minTeamSize: z.coerce.number().int().min(1).optional(),
  maxTeamSize: z.coerce.number().int().min(1).optional(),
  teamsPerLobby: z.coerce.number().int().min(2).default(4),
  advancersPerLobby: z.coerce.number().int().min(1).default(2),
  registrationOpenDate: z.coerce.date().optional(),
  registrationCloseDate: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  rules: z.string().optional(),
  prizeDescription: z.string().optional(),
});

export const updateTournamentSchema = createTournamentSchema.partial();

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
