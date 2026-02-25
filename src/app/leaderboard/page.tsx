"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, TrendingUp, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardEntry } from "@/types";
import { formatChips } from "@/lib/constants";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data.leaderboard) setEntries(data.leaderboard);
      } catch {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-bold text-muted-foreground w-5 text-center">
            {index + 1}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top players ranked by total profit. Compete and climb!
        </p>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const entry = entries[idx];
            if (!entry) return null;
            const isFirst = idx === 0;
            return (
              <Card
                key={entry.id}
                className={`p-6 text-center border-border/50 ${
                  isFirst ? "ring-2 ring-yellow-500/30 bg-yellow-500/5" : ""
                } ${idx === 0 ? "order-2" : idx === 1 ? "order-1 mt-4" : "order-3 mt-4"}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={entry.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {(entry.username || "?")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">{getRankIcon(idx)}</div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm truncate max-w-[120px]">
                      {entry.username || "Anonymous"}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        entry.total_profit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {entry.total_profit >= 0 ? "+" : ""}
                      {formatChips(entry.total_profit)}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{entry.total_trades} trades</span>
                    <span>{entry.win_rate}% win</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <Card className="border-border/50 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_100px_80px] gap-4 px-6 py-3 bg-secondary text-xs font-medium text-muted-foreground">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">Profit</span>
          <span className="text-right">Balance</span>
          <span className="text-right">Win%</span>
        </div>
        {entries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No players yet. Be the first!
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.id}
              className="grid grid-cols-[60px_1fr_120px_100px_80px] gap-4 px-6 py-3 items-center border-t border-border/30 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center justify-center">{getRankIcon(i)}</div>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={entry.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {(entry.username || "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.username || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.total_trades} trades
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-semibold ${
                    entry.total_profit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {entry.total_profit >= 0 ? "+" : ""}
                  {formatChips(entry.total_profit)}
                </span>
              </div>
              <div className="text-right text-sm">{formatChips(entry.chips_balance)}</div>
              <div className="text-right text-sm">{entry.win_rate}%</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
