import { requireAdmin } from "@/lib/auth/auth-utils";
import { getAdminStats } from "@/lib/db/queries/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  const statCards = [
    { label: "Tournaments", value: stats.tournamentCount, href: "/admin/tournaments" },
    { label: "Users", value: stats.userCount, href: "/admin/users" },
    { label: "Teams", value: stats.teamCount, href: "/admin/tournaments" },
    { label: "Open Disputes", value: stats.openDisputes, href: "/admin/disputes" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
