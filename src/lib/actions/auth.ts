"use server";

import { signIn } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { registerSchema, loginSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function registerAction(
  _prevState: any,
  formData: FormData
) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: false };
  }

  const { email, username, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (existing.email === email) {
      return { error: { email: ["Email already taken"] }, success: false };
    }
    return { error: { username: ["Username already taken"] }, success: false };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { email, username, passwordHash, displayName: username },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: { email: ["Registration succeeded but auto-login failed. Please log in."] }, success: false };
    }
    throw error;
  }

  return { error: null, success: true };
}

export async function loginAction(
  _prevState: any,
  formData: FormData
) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid credentials", success: false };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password", success: false };
    }
    throw error;
  }

  return { error: null, success: true };
}
