"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpDownCard } from "@/components/market/UpDownCard";
import { usePrices } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { INSTRUMENTS, formatPrice, formatChips, INSTRUMENT_COLORS } from "@/lib/constants";
import { calculateOdds, getTimeRemaining } from "@/lib/market-maker";
import type { Market, Instrument } from "@/types";

interface InstrumentGroup {
  instrument: Instrument;
  markets: Market[];
  totalVolume: number;
}

export default function HomePage() {
  const { prices } = usePrices();
  const [groups, setGroups] = useState<InstrumentGroup[]>([]);
  const [updownMarkets, setUpdownMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "crypto" | "futures">("all");

  useEffect(() => {
    async function fetchMarkets() {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("markets")
        .select("*, instrument:instruments(*)")
        .eq("market_date", today)
        .order("strike_price", { ascending: false });

      if (data) {
        const updowns: Market[] = [];
        const marketsByInstrument: Record<string, Market[]> = {};

        for (const m of data) {
          const inst = Array.isArray(m.instrument) ? m.instrument[0] : m.instrument;
          if (!inst) continue;
          const sym = inst.symbol;
          const market = { ...m, instrument: inst };

          // Separate updown markets (strike_price = 0.01)
          if (m.strike_price === 0.01) {
            updowns.push(market);
          } else {
            if (!marketsByInstrument[sym]) marketsByInstrument[sym] = [];
            marketsByInstrument[sym].push(market);
          }
        }

        setUpdownMarkets(updowns);

        const grouped: InstrumentGroup[] = INSTRUMENTS.map((inst) => {
          const markets = marketsByInstrument[inst.symbol] || [];
          const totalVolume = markets.reduce((s, m) => s + m.total_volume, 0);
          return {
            instrument: {
              id: 0,
              symbol: inst.symbol,
              name: inst.name,
              type: inst.type,
              icon: inst.icon,
              close_hour: 0,
              close_minute: 0,
              cutoff_minutes: 120,
              active: true,
            },
            markets,
            totalVolume,
          };
        }).filter((g) => g.markets.length > 0);

        setGroups(grouped);
      }
      setLoading(false);
    }

    fetchMarkets();
    const channel = supabase
      .channel("home-markets")
      .on("postgres_changes", { event: "*", schema: "public", table: "markets" }, () => {
        fetchMarkets();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredGroups = filter === "all"
    ? groups
    : groups.filter((g) => g.instrument.type === filter);

  const filteredUpdown = filter === "all"
    ? updownMarkets
    : updownMarkets.filter((m) => {
        const inst = m.instrument as { type: string };
        return inst?.type === filter;
      });

  return (
    <div>
      {/* Price ticker */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {INSTRUMENTS.map((inst) => {
          const priceData = prices[inst.symbol];
          return (
            <Link
              key={inst.symbol}
              href={`/instrument/${inst.symbol.toLowerCase()}`}
              className="flex-shrink-0 flex items-center gap-3 rounded-xl bg-card border border-border/50 px-4 py-3 min-w-[180px] hover:border-border transition-colors"
            >
              <span className="text-xl">{inst.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: inst.color }}>
                    {inst.symbol}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{inst.name}</span>
                </div>
                {priceData ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatPrice(priceData.price, inst.symbol)}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        priceData.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {priceData.changePercent >= 0 ? "+" : ""}
                      {priceData.changePercent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="h-4 w-20 rounded bg-secondary animate-shimmer" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">預測市場</h1>
        <p className="text-muted-foreground">
          預測期貨與加密貨幣的每日收盤價，用免費籌碼下注，登上排行榜！
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "all" as const, label: "全部市場" },
          { key: "crypto" as const, label: "加密貨幣" },
          { key: "futures" as const, label: "期貨" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* === Up/Down Daily Cards === */}
          {filteredUpdown.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">每天 漲跌預測</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUpdown.map((m) => (
                  <UpDownCard key={m.id} market={m} />
                ))}
              </div>
            </div>
          )}

          {/* === Strike Price Instrument Groups === */}
          {filteredGroups.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">收盤價預測</h2>
              <div className="space-y-4">
                {filteredGroups.map((group) => (
                  <InstrumentGroupCard
                    key={group.instrument.symbol}
                    group={group}
                    currentPrice={prices[group.instrument.symbol]?.price}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredGroups.length === 0 && filteredUpdown.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">目前沒有可用的市場</p>
              <p className="text-muted-foreground text-sm mt-1">
                市場每日自動建立，請稍後再查看！
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InstrumentGroupCard({
  group,
  currentPrice,
}: {
  group: InstrumentGroup;
  currentPrice?: number;
}) {
  const { instrument, markets, totalVolume } = group;
  const color = INSTRUMENT_COLORS[instrument.symbol] || "#7c3aed";

  const [timeLeft, setTimeLeft] = useState(
    markets.length > 0 ? getTimeRemaining(markets[0].cutoff_time) : { hours: 0, minutes: 0, seconds: 0, expired: true, total: 0, days: 0 }
  );

  useEffect(() => {
    if (markets.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(markets[0].cutoff_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [markets]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Link href={`/instrument/${instrument.symbol.toLowerCase()}`}>
      <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-border transition-all cursor-pointer">
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{instrument.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                    {instrument.type === "crypto" ? "加密" : "期貨"}
                  </span>
                  <span className="text-xs text-muted-foreground">{instrument.name}</span>
                  {!timeLeft.expired && (
                    <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-live-pulse" />
                      進行中
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold">
                  {instrument.symbol} 今日收盤價將達到什麼價格？
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!timeLeft.expired && (
                <div className="text-right hidden md:block">
                  <div className="font-mono text-sm font-semibold">
                    {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">剩餘時間</div>
                </div>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {formatChips(totalVolume)} 交易量
            </span>
            <span>{markets.length} 個價位</span>
            {currentPrice !== undefined && (
              <span>目前: <span className="text-foreground font-semibold">{formatPrice(currentPrice, instrument.symbol)}</span></span>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {markets.slice(0, 6).map((m) => {
              const { yesPercent } = calculateOdds(m.yes_pool, m.no_pool);
              const isAbove = currentPrice !== undefined && currentPrice > m.strike_price;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 text-xs"
                >
                  <span className={`font-semibold ${isAbove ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {formatPrice(m.strike_price, instrument.symbol)}
                  </span>
                  <span className="text-muted-foreground">
                    {yesPercent}%
                  </span>
                </div>
              );
            })}
            {markets.length > 6 && (
              <div className="flex items-center bg-secondary rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
                +{markets.length - 6} 更多
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
