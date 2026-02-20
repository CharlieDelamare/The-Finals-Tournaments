import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  try {
    const session = await auth();
    if (session?.user) {
      redirect("/dashboard");
    }
  } catch {
    // Auth may fail if database is unavailable — continue rendering landing page
  }

  const featuredTournaments = await prisma.tournament.findMany({
    where: {
      status: { in: ["REGISTRATION_OPEN", "IN_PROGRESS"] },
    },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  }).catch(() => []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav for unauthenticated */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">TFT</span>
            <span className="hidden text-sm font-medium sm:block">
              The Finals Tournaments
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Compete. Dominate.{" "}
              <span className="text-primary">Win.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              The ultimate eSports tournament platform. Create teams, join
              tournaments, and battle your way to the top with our
              advanced bracket and scoring system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tournaments">Browse Tournaments</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      {featuredTournaments.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold">Active Tournaments</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTournaments.map((tournament) => (
              <Card key={tournament.id} className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {tournament.name}
                    </CardTitle>
                    <Badge>{tournament.status.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tournament.game || "General"} &middot;{" "}
                    {tournament.type} &middot;{" "}
                    {tournament._count.registrations} registered
                  </p>
                  <Button className="mt-4 w-full" variant="outline" asChild>
                    <Link href={`/tournaments/${tournament.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl text-primary">&#9876;</span>
              </div>
              <h3 className="font-semibold">Battle Royale Brackets</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Multi-team lobbies with configurable elimination formats
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl text-primary">&#128101;</span>
              </div>
              <h3 className="font-semibold">Team Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create teams, invite players, and manage rosters
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl text-primary">&#127942;</span>
              </div>
              <h3 className="font-semibold">Score Verification</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Automated consensus-based scoring with dispute resolution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 py-6 text-center text-sm text-muted-foreground">
        The Finals Tournaments — eSports Tournament Platform
      </footer>
    </div>
  );
}
