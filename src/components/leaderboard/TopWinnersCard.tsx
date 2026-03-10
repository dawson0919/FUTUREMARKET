"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, ChevronRight, Crown, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatChips } from "@/lib/constants";

interface LeaderEntry {
  id: string;
  username: string | null;
  avatar_url: string | null;
  chips_balance: number;
  total_trades: number;
  wins: number;
  win_rate: number;
}

function getRankDecoration(index: number) {
  switch (index) {
    case 0:
      return { icon: <Crown className="h-4 w-4 text-yellow-400" />, bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400" };
    case 1:
      return { icon: <Medal className="h-4 w-4 text-gray-300" />, bg: "bg-gray-500/10 border-gray-500/20", text: "text-gray-300" };
    case 2:
      return { icon: <Medal className="h-4 w-4 text-amber-600" />, bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-600" };
    default:
      return { icon: null, bg: "", text: "" };
  }
}

export function TopWinnersCard() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data.leaderboard) setEntries(data.leaderboard.slice(0, 3));
        else setEntries([]);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Card className="border-border/50 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h2 className="font-bold text-base">籌碼排行榜</h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            還沒有玩家，成為第一個吧！
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const rank = getRankDecoration(i);
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${rank.bg}`}
                >
                  {/* Rank icon */}
                  <div className="flex h-8 w-8 items-center justify-center shrink-0">
                    {rank.icon || (
                      <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar + name */}
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={entry.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {(entry.username || "?")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {entry.username || "匿名"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.total_trades} 筆交易 · 勝率 {entry.win_rate}%
                    </p>
                  </div>

                  {/* Chips balance */}
                  <div className="text-right shrink-0 flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-sm font-bold text-amber-300">
                      {formatChips(entry.chips_balance)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <Link
        href="/leaderboard"
        className="flex items-center justify-center gap-1 border-t border-border/50 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        查看完整排行榜
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}
