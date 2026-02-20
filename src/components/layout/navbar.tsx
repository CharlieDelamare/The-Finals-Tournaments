"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-finals-gold skew-x-[-6deg]">
              <span className="skew-x-[6deg] font-display text-lg font-extrabold italic text-black">
                TF
              </span>
            </div>
            <span className="hidden font-display text-base font-bold uppercase italic tracking-wider text-white sm:block">
              The Finals Tournaments
            </span>
          </Link>

          {user && (
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/tournaments"
                className="font-display text-sm font-semibold uppercase italic tracking-wider text-white/50 transition-colors hover:text-finals-gold"
              >
                Tournaments
              </Link>
              <Link
                href="/teams"
                className="font-display text-sm font-semibold uppercase italic tracking-wider text-white/50 transition-colors hover:text-finals-gold"
              >
                Teams
              </Link>
              <Link
                href="/dashboard"
                className="font-display text-sm font-semibold uppercase italic tracking-wider text-white/50 transition-colors hover:text-finals-gold"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="font-display text-sm font-semibold uppercase italic tracking-wider text-finals-gold transition-colors hover:text-finals-gold/80"
                >
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-none border border-white/10 hover:border-finals-gold/50 hover:bg-white/5"
                  >
                    <Avatar className="h-9 w-9 rounded-none">
                      <AvatarFallback className="rounded-none bg-finals-gold/20 font-display text-sm font-bold italic text-finals-gold">
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-none border-white/10 bg-black"
                >
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-display text-sm font-bold italic text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/teams">My Teams</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-finals-red focus:text-finals-red"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="border border-white/10 hover:border-finals-gold/50 hover:bg-white/5 md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="font-display text-sm font-semibold uppercase italic tracking-wider text-white/70 transition-colors hover:text-finals-gold"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-glow-red inline-flex items-center bg-finals-red px-5 py-2 font-display text-sm font-bold uppercase italic tracking-wider text-white transition-all hover:bg-finals-red-glow skew-x-[-6deg]"
              >
                <span className="skew-x-[6deg]">Play Now</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && user && (
        <div className="border-t border-white/10 bg-black/95 px-4 pb-4 pt-2 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { href: "/tournaments", label: "Tournaments" },
              { href: "/teams", label: "Teams" },
              { href: "/dashboard", label: "Dashboard" },
              ...(isAdmin
                ? [{ href: "/admin", label: "Admin" }]
                : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-l-2 border-transparent px-4 py-2.5 font-display text-sm font-semibold uppercase italic tracking-wider text-white/50 transition-all hover:border-finals-gold hover:bg-white/5 hover:text-finals-gold"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
