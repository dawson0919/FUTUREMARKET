"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpDownCard } from "@/components/market/UpDownCard";
import { TopWinnersCard } from "@/components/leaderboard/TopWinnersCard";
import { DailyCheckinBanner } from "@/components/checkin/DailyCheckinBanner";
import { ChipRequestCard } from "@/components/chips/ChipRequestCard";
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
        <p className="text-muted-foreground mb-3">
          預測期貨與加密貨幣的每日收盤價，用免費籌碼下注，登上排行榜！
        </p>

        {/* Competition Banner */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-amber-950/60 px-5 py-4 mb-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🏆</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">比賽公告</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">進行中</span>
            </div>
            <p className="text-base font-bold text-amber-100 mb-0.5">
              第一屆 刀神的海期教室 預測投注比賽
            </p>
            <p className="text-sm text-amber-200/80 mb-3">
              3/10 開始 → 4/10 結算 · 排名第一名獲得
              <span className="text-amber-300 font-bold"> 1,000 USDT </span>
              獎金！
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-3 py-1.5 border border-amber-500/20">
                <span className="text-amber-400">📅</span>
                <span className="text-amber-200/70">比賽期間：</span>
                <span className="text-amber-100 font-semibold">2026/3/10 – 4/10</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-3 py-1.5 border border-amber-500/20">
                <span className="text-amber-400">🎖️</span>
                <span className="text-amber-200/70">冠軍獎金：</span>
                <span className="text-amber-100 font-semibold">1,000 USDT</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-3 py-1.5 border border-amber-500/20">
                <span className="text-amber-400">📊</span>
                <span className="text-amber-200/70">以 4/10 排行榜排名為準</span>
              </div>
              <Link
                href="/competition"
                className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 transition-colors rounded-lg px-3 py-1.5 border border-amber-500/30"
              >
                <span className="text-amber-300 font-bold">查看詳情 →</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs mb-4">
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-muted-foreground">加密貨幣收盤：</span>
            <span className="text-foreground font-semibold">每日 08:00 (台灣)</span>
            <span className="text-muted-foreground">· 06:00 停止下注</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-muted-foreground">期貨收盤：</span>
            <span className="text-foreground font-semibold">每日 05:00 (台灣)</span>
            <span className="text-muted-foreground">· 03:00 停止下注</span>
          </div>
        </div>

        {/* 賠率說明 */}
        <div className="rounded-xl bg-secondary/60 border border-border/40 p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="text-foreground font-semibold text-sm mb-2">派彩機制：機率越高，賠率越低</p>
          <p className="mb-2">
            本平台採用 <span className="text-foreground font-medium">Parimutuel（同池分彩）</span> 機制，所有下注籌碼匯入同一獎池，預測正確的一方按下注比例瓜分整個獎池。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 px-3 py-2">
              <span className="text-emerald-400 font-semibold">高機率（如 95%）→ 低賠率 ≈ 1.05x</span>
              <p className="mt-0.5">風險低，幾乎穩贏但賺得少</p>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/15 px-3 py-2">
              <span className="text-red-400 font-semibold">低機率（如 5%）→ 高賠率 ≈ 20x</span>
              <p className="mt-0.5">風險高，可能大賺但很容易輸</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-in */}
      <DailyCheckinBanner />

      {/* Chip Request */}
      <ChipRequestCard />

      {/* Top Winners Card */}
      <TopWinnersCard />

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

      {/* 輔助下注工具推薦 */}
      <div className="mt-12 pt-8 border-t border-border/30">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">輔助下注工具</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="https://Qsignals.net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors"
          >
            <span className="text-lg">📊</span>
            <div>
              <p className="text-sm font-semibold">量化交易信號網</p>
              <p className="text-xs text-muted-foreground">Qsignals.net</p>
            </div>
          </a>
          <a
            href="https://bitpredict.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors"
          >
            <span className="text-lg">🔮</span>
            <div>
              <p className="text-sm font-semibold">免費預測報告</p>
              <p className="text-xs text-muted-foreground">bitpredict.net</p>
            </div>
          </a>
          <a
            href="https://copy-trading-strateg-had8.bolt.host/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors"
          >
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-semibold">加密策略跟單</p>
              <p className="text-xs text-muted-foreground">copy-trading</p>
            </div>
          </a>
          <a
            href="https://texasporker-production.up.railway.app/lobby"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 hover:border-border transition-colors"
          >
            <span className="text-lg">🃏</span>
            <div>
              <p className="text-sm font-semibold">線上德州撲克</p>
              <p className="text-xs text-muted-foreground">Texas Porker</p>
            </div>
          </a>
        </div>
      </div>
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
