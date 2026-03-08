"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardEntry, PeriodicLeaderboardEntry } from "@/types";
import { formatChips } from "@/lib/constants";

interface Champion {
  id: number;
  edition: number;
  title: string;
  prize: string;
  start_date: string;
  end_date: string;
  champion_username: string | null;
  champion_avatar_url: string | null;
  final_chips: number;
  total_trades: number;
  wins: number;
}

type Period = "all" | "week" | "month";

const PERIOD_LABELS: Record<Period, string> = {
  all: "全部時間",
  week: "本週",
  month: "本月",
};

// Unified entry shape for rendering
interface DisplayEntry {
  id: string;
  username: string | null;
  avatar_url: string | null;
  chips_balance: number;
  profit: number;
  trades: number;
  win_rate: number;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [displayEntries, setDisplayEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [champions, setChampions] = useState<Champion[]>([]);

  useEffect(() => {
    fetch("/api/champions")
      .then((r) => r.json())
      .then((d) => setChampions(d.champions || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (period === "all") {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data.leaderboard) {
          setDisplayEntries(
            (data.leaderboard as LeaderboardEntry[]).map((e) => ({
              id: e.id,
              username: e.username,
              avatar_url: e.avatar_url,
              chips_balance: e.chips_balance,
              profit: e.total_profit,
              trades: e.total_trades,
              win_rate: e.win_rate,
            }))
          );
        }
      } else {
        const res = await fetch(`/api/leaderboard/periodic?period=${period}`);
        const data = await res.json();
        if (data.leaderboard) {
          setDisplayEntries(
            (data.leaderboard as PeriodicLeaderboardEntry[]).map((e) => ({
              id: e.id,
              username: e.username,
              avatar_url: e.avatar_url,
              chips_balance: e.chips_balance,
              profit: e.period_profit,
              trades: e.period_trades,
              win_rate: e.period_trades > 0
                ? Math.round((e.period_wins / e.period_trades) * 100)
                : 0,
            }))
          );
        } else {
          setDisplayEntries([]);
        }
      }
    } catch {
      console.error("Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">排行榜</h1>
          <p className="text-muted-foreground">
            {period === "all"
              ? "依據總盈虧排名，展現你的預測實力！"
              : period === "week"
              ? "本週獲利排名，每週一重置"
              : "本月獲利排名，每月1日重置"}
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(["all", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {displayEntries.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 0, 2].map((idx) => {
                const entry = displayEntries[idx];
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
                          {entry.username || "匿名"}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            entry.profit >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {entry.profit >= 0 ? "+" : ""}
                          {formatChips(entry.profit)}
                        </p>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{entry.trades} 筆交易</span>
                        <span>勝率 {entry.win_rate}%</span>
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
              <span>排名</span>
              <span>玩家</span>
              <span className="text-right">
                {period === "all" ? "總盈虧" : `${PERIOD_LABELS[period]}盈虧`}
              </span>
              <span className="text-right">餘額</span>
              <span className="text-right">勝率</span>
            </div>
            {displayEntries.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {period === "all"
                  ? "還沒有玩家，成為第一個吧！"
                  : `${PERIOD_LABELS[period]}還沒有交易紀錄`}
              </div>
            ) : (
              displayEntries.map((entry, i) => (
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
                        {entry.username || "匿名"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.trades} 筆交易
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold ${
                        entry.profit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {entry.profit >= 0 ? "+" : ""}
                      {formatChips(entry.profit)}
                    </span>
                  </div>
                  <div className="text-right text-sm">{formatChips(entry.chips_balance)}</div>
                  <div className="text-right text-sm">{entry.win_rate}%</div>
                </div>
              ))
            )}
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">僅顯示前 10 名</p>
        </>
      )}

      {/* Hall of Champions */}
      {champions.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border/30">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold">歷屆冠軍名人堂</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {champions.map((c) => (
              <Card key={c.id} className="p-5 border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    第 {c.edition} 屆
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{c.title}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-amber-500/40">
                      <AvatarImage src={c.champion_avatar_url || ""} />
                      <AvatarFallback className="bg-amber-500/20 text-amber-300 font-bold">
                        {(c.champion_username || "?")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Trophy className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-100">{c.champion_username || "匿名"}</p>
                    <p className="text-xs text-amber-400 font-semibold">{formatChips(c.final_chips)} 籌碼</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.total_trades} 筆交易 · 勝 {c.wins} 場</span>
                  <span className="text-amber-400 font-semibold">🏆 {c.prize}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(c.start_date).toLocaleDateString("zh-TW")} – {new Date(c.end_date).toLocaleDateString("zh-TW")}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
