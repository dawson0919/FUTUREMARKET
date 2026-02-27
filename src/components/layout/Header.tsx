"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { TrendingUp, Trophy, Briefcase, Coins, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatChips } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks";

const navItems = [
  { href: "/", label: "市場", icon: TrendingUp },
  { href: "/leaderboard", label: "排行榜", icon: Trophy },
  { href: "/portfolio", label: "投資組合", icon: Briefcase },
];

export function Header() {
  const pathname = usePathname();
  const { profile } = useUserProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6d5dfc] to-[#4338ca] shadow-lg shadow-[#6d5dfc]/20">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M8 36L18 26L26 32L40 14" stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M34 12L42 13L41 21" stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">THE FUTURE MARKET</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {mounted && (
            <>
              <SignedIn>
                {profile && (
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">
                      {formatChips(profile.chips_balance)}
                    </span>
                  </div>
                )}
                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    管理
                  </Link>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in">
                  <Button size="sm">登入</Button>
                </Link>
              </SignedOut>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex md:hidden border-t border-border">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              pathname === item.href
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
