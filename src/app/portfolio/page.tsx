"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Coins, TrendingUp, TrendingDown, Award, History } from "lucide-react";
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
  const { user, isSignedIn } = useUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const [positions, setPositions] = useState<PositionWithMarket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }

    if (profile) fetchData();
  }, [profile]);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Sign in to view your portfolio</p>
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
  const winRate =
    profile && profile.total_trades > 0
      ? Math.round((profile.wins / profile.total_trades) * 100)
      : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Portfolio</h1>

      {/* Stats cards */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">Balance</span>
            </div>
            <p className="text-xl font-bold">{formatChips(profile.chips_balance)}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {profile.total_profit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className="text-xs">Total Profit</span>
            </div>
            <p
              className={`text-xl font-bold ${
                profile.total_profit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {profile.total_profit >= 0 ? "+" : ""}
              {formatChips(profile.total_profit)}
            </p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs">Win Rate</span>
            </div>
            <p className="text-xl font-bold">{winRate}%</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <History className="h-4 w-4" />
              <span className="text-xs">Total Trades</span>
            </div>
            <p className="text-xl font-bold">{profile.total_trades}</p>
          </Card>
        </div>
      )}

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="open">
            Open ({openPositions.length})
          </TabsTrigger>
          <TabsTrigger value="settled">
            Settled ({settledPositions.length})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          {openPositions.length === 0 ? (
            <Card className="p-8 text-center border-border/50">
              <p className="text-muted-foreground">No open positions</p>
              <Link
                href="/"
                className="text-primary text-sm mt-2 inline-block hover:underline"
              >
                Browse markets
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
              <p className="text-muted-foreground">No settled positions yet</p>
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
              <p className="text-muted-foreground">No transactions yet</p>
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
                          : ""
                      }
                    >
                      {tx.type}
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
                    Settled
                  </Badge>
                )}
              </div>
              <p className="text-sm truncate">{pos.market?.title}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-sm font-semibold">{formatChips(pos.amount)} chips</div>
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
                Est: {formatChips(pos.potential_payout)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
