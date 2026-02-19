import { z } from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(30, "Team name must be at most 30 characters"),
  tag: z
    .string()
    .min(2, "Tag must be at least 2 characters")
    .max(5, "Tag must be at most 5 characters")
    .regex(/^[A-Z0-9]+$/i, "Tag can only contain letters and numbers")
    .transform((v) => v.toUpperCase()),
  description: z.string().max(500, "Description too long").optional(),
});

export const inviteMemberSchema = z.object({
  teamId: z.string(),
  usernameOrEmail: z.string().min(1, "Username or email is required"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
