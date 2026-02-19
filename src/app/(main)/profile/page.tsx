import { requireAuth } from "@/lib/auth/auth-utils";
import { prisma } from "@/lib/db/prisma";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const sessionUser = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Profile</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Username:</span>{" "}
            {user.username}
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span> {user.role}
          </p>
          <p>
            <span className="text-muted-foreground">Joined:</span>{" "}
            {user.createdAt.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <ProfileForm user={user} />
    </div>
  );
}
