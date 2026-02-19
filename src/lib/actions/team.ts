"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/auth-utils";
import { createTeamSchema, inviteMemberSchema } from "@/lib/validators/team";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTeam(_prevState: any, formData: FormData) {
  const user = await requireAuth();

  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    tag: formData.get("tag"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, teamId: null };
  }

  const { name, tag, description } = parsed.data;

  const existing = await prisma.team.findFirst({
    where: { OR: [{ name }, { tag }] },
  });

  if (existing) {
    if (existing.name === name) {
      return { error: { name: ["Team name already taken"] }, teamId: null };
    }
    return { error: { tag: ["Tag already taken"] }, teamId: null };
  }

  const team = await prisma.team.create({
    data: {
      name,
      tag,
      description,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
          status: "ACCEPTED",
        },
      },
    },
  });

  revalidatePath("/teams");
  revalidatePath("/dashboard");
  redirect(`/teams/${team.id}`);
}

export async function inviteMember(_prevState: any, formData: FormData) {
  const user = await requireAuth();

  const parsed = inviteMemberSchema.safeParse({
    teamId: formData.get("teamId"),
    usernameOrEmail: formData.get("usernameOrEmail"),
  });

  if (!parsed.success) {
    return { error: "Invalid input", success: false };
  }

  const { teamId, usernameOrEmail } = parsed.data;

  // Verify the user is the team owner
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id, role: "OWNER", status: "ACCEPTED" },
  });

  if (!membership) {
    return { error: "You don't have permission to invite members", success: false };
  }

  // Find the target user
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    },
  });

  if (!targetUser) {
    return { error: "User not found", success: false };
  }

  if (targetUser.id === user.id) {
    return { error: "You can't invite yourself", success: false };
  }

  // Check if already a member or invited
  const existingMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUser.id } },
  });

  if (existingMembership) {
    if (existingMembership.status === "ACCEPTED") {
      return { error: "User is already a member", success: false };
    }
    if (existingMembership.status === "PENDING") {
      return { error: "User already has a pending invite", success: false };
    }
    // If declined, update to pending again
    await prisma.teamMember.update({
      where: { id: existingMembership.id },
      data: { status: "PENDING", joinedAt: new Date() },
    });
  } else {
    await prisma.teamMember.create({
      data: { teamId, userId: targetUser.id, status: "PENDING" },
    });
  }

  revalidatePath(`/teams/${teamId}`);
  return { error: null, success: true };
}

export async function respondToInvite(
  teamMemberId: string,
  accept: boolean
) {
  const user = await requireAuth();

  const membership = await prisma.teamMember.findUnique({
    where: { id: teamMemberId },
  });

  if (!membership || membership.userId !== user.id) {
    return { error: "Invite not found" };
  }

  if (membership.status !== "PENDING") {
    return { error: "Invite already responded to" };
  }

  await prisma.teamMember.update({
    where: { id: teamMemberId },
    data: {
      status: accept ? "ACCEPTED" : "DECLINED",
      joinedAt: accept ? new Date() : membership.joinedAt,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/teams/${membership.teamId}`);
  return { error: null };
}

export async function removeMember(teamId: string, memberId: string) {
  const user = await requireAuth();

  const ownership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id, role: "OWNER", status: "ACCEPTED" },
  });

  if (!ownership) {
    return { error: "You don't have permission" };
  }

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.teamId !== teamId) {
    return { error: "Member not found" };
  }

  if (member.role === "OWNER") {
    return { error: "Cannot remove the team owner" };
  }

  await prisma.teamMember.delete({ where: { id: memberId } });

  revalidatePath(`/teams/${teamId}`);
  return { error: null };
}
