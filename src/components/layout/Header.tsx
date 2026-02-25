"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { TrendingUp, Trophy, Briefcase, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatChips } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks";

const navItems = [
  { href: "/", label: "Markets", icon: TrendingUp },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
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
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            FM
          </div>
          <span className="text-lg font-bold">FutureMarket</span>
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
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm">Sign In</Button>
                </SignInButton>
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
