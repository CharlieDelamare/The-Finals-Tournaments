import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
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
    <div className="flex min-h-screen flex-col bg-black">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-finals-gold skew-x-[-6deg]">
              <span className="skew-x-[6deg] font-display text-xl font-extrabold italic text-black">
                TF
              </span>
            </div>
            <span className="font-display text-lg font-bold uppercase italic tracking-wider text-white">
              The Finals Tournaments
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-display text-sm font-semibold uppercase italic tracking-wider text-white/70 transition-colors hover:text-finals-gold"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-glow-red inline-flex items-center bg-finals-red px-6 py-2.5 font-display text-sm font-bold uppercase italic tracking-wider text-white transition-all hover:bg-finals-red-glow skew-x-[-6deg]"
            >
              <span className="skew-x-[6deg]">Play Now</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — full bleed */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(247,187,4,0.08)_0%,_transparent_70%)]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Diagonal accent lines */}
        <div className="absolute left-0 top-1/4 h-px w-full rotate-[-2deg] bg-gradient-to-r from-transparent via-finals-gold/30 to-transparent" />
        <div className="absolute left-0 bottom-1/3 h-px w-full rotate-[1deg] bg-gradient-to-r from-transparent via-finals-red/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          {/* Tagline */}
          <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm skew-x-[-6deg]">
            <span className="h-1.5 w-1.5 rounded-full bg-finals-gold" />
            <span className="skew-x-[6deg] text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              eSports Tournament Platform
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-shadow-glow font-display text-[4rem] font-extrabold uppercase italic leading-[0.85] tracking-tight text-white sm:text-[6rem] md:text-[8rem]">
            Compete.
            <br />
            <span className="text-finals-gold">Dominate.</span>
            <br />
            Win.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
            The ultimate tournament platform for The Finals. Create teams, join
            tournaments, and battle your way to the top.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="btn-glow-red group relative inline-flex items-center overflow-hidden bg-finals-red px-10 py-4 font-display text-lg font-bold uppercase italic tracking-wider text-white transition-all hover:bg-finals-red-glow skew-x-[-6deg]"
            >
              <span className="relative z-10 skew-x-[6deg]">
                Get Started
              </span>
            </Link>
            <Link
              href="/tournaments"
              className="inline-flex items-center border border-white/20 bg-white/5 px-10 py-4 font-display text-lg font-bold uppercase italic tracking-wider text-white/80 transition-all hover:border-finals-gold/50 hover:text-finals-gold skew-x-[-6deg]"
            >
              <span className="skew-x-[6deg]">Browse Tournaments</span>
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Stats bar — slanted */}
      <section className="relative z-10 -mt-16 clip-slant-both bg-finals-gold py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-8 px-4 text-center">
          <div>
            <div className="font-display text-4xl font-extrabold italic text-black sm:text-5xl">
              N-TEAM
            </div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-black/60">
              Lobby Format
            </div>
          </div>
          <div>
            <div className="font-display text-4xl font-extrabold italic text-black sm:text-5xl">
              LIVE
            </div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-black/60">
              Score Tracking
            </div>
          </div>
          <div>
            <div className="font-display text-4xl font-extrabold italic text-black sm:text-5xl">
              AUTO
            </div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-black/60">
              Bracket System
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      {featuredTournaments.length > 0 && (
        <section className="relative z-10 bg-black py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-end gap-4">
              <div className="h-8 w-1 bg-finals-gold" />
              <h2 className="font-display text-3xl font-extrabold uppercase italic text-white sm:text-4xl">
                Active Tournaments
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="group relative border border-white/10 bg-white/[0.02] transition-all hover:border-finals-gold/40 hover:bg-white/[0.05]"
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-finals-gold to-finals-red" />
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-display text-xl font-bold uppercase italic text-white group-hover:text-finals-gold">
                        {tournament.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-finals-gold/50 font-display text-xs uppercase italic text-finals-gold"
                      >
                        {tournament.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/40">
                      {tournament.game || "The Finals"} &middot;{" "}
                      {tournament.type} &middot;{" "}
                      {tournament._count.registrations} registered
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-finals-gold/70 group-hover:text-finals-gold">
                      View Details
                      <svg
                        className="h-3 w-3 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="relative overflow-hidden border-t border-white/5 bg-black py-24">
        {/* Background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(210,31,60,0.05)_0%,_transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-extrabold uppercase italic text-white sm:text-5xl">
              Built for <span className="text-finals-gold">The Finals</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/40">
              Purpose-built tournament system for multi-team lobby
              elimination formats.
            </p>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            {[
              {
                title: "Battle Royale Brackets",
                desc: "Multi-team lobbies with configurable elimination. N teams per lobby, top K advance.",
                icon: (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                    />
                  </svg>
                ),
              },
              {
                title: "Team Management",
                desc: "Create teams, invite players, manage rosters. Full ownership and captain role system.",
                icon: (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Score Verification",
                desc: "Consensus-based scoring with automatic dispute detection and admin resolution.",
                icon: (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-black p-8 transition-colors hover:bg-white/[0.03]"
              >
                <div className="mb-4 text-finals-gold">{feature.icon}</div>
                <h3 className="font-display text-xl font-bold uppercase italic text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative clip-slant-t bg-gradient-to-br from-finals-red to-finals-red-glow py-24 pt-32">
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-4xl font-extrabold uppercase italic text-white sm:text-6xl">
            Ready to compete?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/70">
            Join thousands of players competing in The Finals tournaments.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center border-2 border-white bg-white px-12 py-4 font-display text-lg font-bold uppercase italic tracking-wider text-black transition-all hover:bg-transparent hover:text-white skew-x-[-6deg]"
          >
            <span className="skew-x-[6deg]">Sign Up Free</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center bg-finals-gold skew-x-[-6deg]">
                <span className="skew-x-[6deg] font-display text-sm font-extrabold italic text-black">
                  TF
                </span>
              </div>
              <span className="text-sm text-white/30">
                The Finals Tournaments
              </span>
            </div>
            <p className="text-xs text-white/20">
              Built with Next.js, Tailwind CSS & shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
