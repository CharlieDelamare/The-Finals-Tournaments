"use server";

import { requireAdmin } from "@/lib/auth/auth-utils";
import { generateBracket } from "@/lib/bracket/generator";
import { revalidatePath } from "next/cache";

export async function generateBracketAction(tournamentId: string) {
  await requireAdmin();

  try {
    await generateBracket(tournamentId);
    revalidatePath(`/admin/tournaments/${tournamentId}`);
    revalidatePath(`/tournaments/${tournamentId}`);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
