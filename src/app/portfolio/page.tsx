"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Coins, TrendingUp, TrendingDown, Award, History, Flame, Target, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { formatChips, INSTRUMENT_COLORS } from "@/lib/constants";
import type { Position, Transaction, Market, Instrument } from "@/types";

interface PositionWithMarket extends Position {
  market: Market & { instrument: Instrument };
}

export default function PortfolioPage() {
  const { data: session } = useSession();
  const { profile, loading: profileLoading } = useUserProfile();
  const [positions, setPositions] = useState<PositionWithMarket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    best_trade: number;
    worst_trade: number;
    current_streak: number;
    best_streak: number;
    checkin_streak: number;
    favorite_instrument: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;

      const [posResult, txResult] = await Promise.all([
        supabase
          .from("positions")
          .select("*, market:markets(*, instrument:instruments(*))")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (posResult.data) {
        setPositions(
          posResult.data.map((p) => {
            const market = Array.isArray(p.market) ? p.market[0] : p.market;
            const instrument = market
              ? Array.isArray(market.instrument)
                ? market.instrument[0]
                : market.instrument
              : null;
            return {
              ...p,
              market: { ...market, instrument },
            };
          }) as PositionWithMarket[]
        );
      }
      if (txResult.data) setTransactions(txResult.data);

      // Fetch detailed stats
      try {
        const statsRes = await fetch("/api/user/stats", { credentials: "include" });
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      } catch {
        // Non-critical
      }

      setLoading(false);
    }

    if (profile) fetchData();
  }, [profile]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">請先登入以查看投資組合</p>
      </div>
    );
  }

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const openPositions = positions.filter((p) => !p.settled);
  const settledPositions = positions.filter((p) => p.settled);

  // Compute accurate stats from settled positions only
  const settledWins = settledPositions.filter((p) => (p.payout || 0) > 0).length;
  const settledTrades = settledPositions.length;
  const settledProfit = settledPositions.reduce(
    (sum, p) => sum + ((p.payout || 0) - p.amount), 0
  );
  const winRate = settledTrades > 0 ? Math.round((settledWins / settledTrades) * 100) : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">投資組合</h1>

      {/* Stats cards */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">餘額</span>
            </div>
            <p className="text-xl font-bold">{formatChips(profile.chips_balance)}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {settledProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className="text-xs">總盈虧</span>
            </div>
            <p
              className={`text-xl font-bold ${
                settledProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {settledProfit >= 0 ? "+" : ""}
              {formatChips(settledProfit)}
            </p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs">勝率</span>
            </div>
            <p className="text-xl font-bold">{winRate}%</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <History className="h-4 w-4" />
              <span className="text-xs">已結算筆數</span>
            </div>
            <p className="text-xl font-bold">{settledTrades}</p>
          </Card>
        </div>
      )}

      {/* Detailed stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4 text-emerald-400" />
              <span className="text-xs">最佳單筆</span>
            </div>
            <p className={`text-lg font-bold ${stats.best_trade > 0 ? "text-emerald-400" : ""}`}>
              {stats.best_trade > 0 ? "+" : ""}{formatChips(stats.best_trade)}
            </p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-xs">最大虧損</span>
            </div>
            <p className={`text-lg font-bold ${stats.worst_trade < 0 ? "text-red-400" : ""}`}>
              {formatChips(stats.worst_trade)}
            </p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs">當前連勝</span>
            </div>
            <p className="text-lg font-bold">{stats.current_streak}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-xs">最長連勝</span>
            </div>
            <p className="text-lg font-bold">{stats.best_streak}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs">最常交易</span>
            </div>
            <p className="text-lg font-bold">{stats.favorite_instrument || "-"}</p>
          </Card>
        </div>
      )}

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="open">
            進行中 ({openPositions.length})
          </TabsTrigger>
          <TabsTrigger value="settled">
            已結算 ({settledPositions.length})
          </TabsTrigger>
          <TabsTrigger value="history">交易紀錄</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          {openPositions.length === 0 ? (
            <Card className="p-8 text-center border-border/50">
              <p className="text-muted-foreground">目前沒有進行中的持倉</p>
              <Link
                href="/"
                className="text-primary text-sm mt-2 inline-block hover:underline"
              >
                瀏覽市場
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {openPositions.map((pos) => (
                <PositionCard key={pos.id} position={pos} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settled">
          {settledPositions.length === 0 ? (
            <Card className="p-8 text-center border-border/50">
              <p className="text-muted-foreground">還沒有已結算的持倉</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {settledPositions.map((pos) => (
                <PositionCard key={pos.id} position={pos} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {transactions.length === 0 ? (
            <Card className="p-8 text-center border-border/50">
              <p className="text-muted-foreground">還沒有交易紀錄</p>
            </Card>
          ) : (
            <Card className="border-border/50 overflow-hidden">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={tx.type === "payout" ? "default" : "secondary"}
                      className={
                        tx.type === "payout"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : tx.type === "bet"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : tx.type === "checkin"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : tx.type === "admin_grant"
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : ""
                      }
                    >
                      {tx.type === "bet" ? "下注" : tx.type === "payout" ? "派彩" : tx.type === "checkin" ? "簽到" : tx.type === "admin_grant" ? "管理員發放" : tx.type}
                    </Badge>
                    {tx.side && (
                      <span
                        className={`text-xs font-bold ${
                          tx.side === "yes" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {tx.side.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        tx.type === "payout" ? "text-emerald-400" : "text-foreground"
                      }`}
                    >
                      {tx.type === "bet" ? "-" : "+"}
                      {formatChips(tx.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PositionCard({ position: pos }: { position: PositionWithMarket }) {
  const symbol = pos.market?.instrument?.symbol || "";
  const color = INSTRUMENT_COLORS[symbol] || "#7c3aed";
  const profit = pos.settled && pos.payout !== null ? pos.payout - pos.amount : null;

  return (
    <Link href={`/market/${pos.market_id}`}>
      <Card className="p-4 border-border/50 hover:border-border transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg">{pos.market?.instrument?.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {symbol}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    pos.side === "yes"
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-red-500/30 text-red-400"
                  }`}
                >
                  {pos.side.toUpperCase()}
                </Badge>
                {pos.settled && (
                  <Badge variant="secondary" className="text-[10px]">
                    已結算
                  </Badge>
                )}
              </div>
              <p className="text-sm truncate">{pos.market?.title}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-sm font-semibold">{formatChips(pos.amount)} 籌碼</div>
            {profit !== null ? (
              <div
                className={`text-xs font-medium ${
                  profit >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {profit >= 0 ? "+" : ""}
                {formatChips(profit)}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                預估：{formatChips(pos.potential_payout)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
