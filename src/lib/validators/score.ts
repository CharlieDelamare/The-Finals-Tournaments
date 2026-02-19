import { z } from "zod";

export const submitScoreSchema = z.object({
  lobbyId: z.string(),
  placements: z.array(
    z.object({
      lobbyTeamId: z.string(),
      placement: z.number().int().min(1),
    })
  ),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string(),
  resolution: z.string().min(1, "Resolution description is required"),
  placements: z.array(
    z.object({
      lobbyTeamId: z.string(),
      placement: z.number().int().min(1),
    })
  ),
});

export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
