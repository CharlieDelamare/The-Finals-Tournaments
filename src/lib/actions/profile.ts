"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(30).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(_prevState: any, formData: FormData) {
  const user = await requireAuth();

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: false };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: parsed.data.displayName,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
