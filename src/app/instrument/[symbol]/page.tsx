"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Bookmark, Share2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { usePrices, useUserProfile } from "@/lib/hooks";
import {
  calculatePrices,
  calculatePotentialPayout,
  formatCents,
  isMarketBettable,
  getTimeRemaining,
} from "@/lib/market-maker";
import {
  formatChips,
  formatPrice,
  INSTRUMENTS,
  INSTRUMENT_COLORS,
} from "@/lib/constants";
import type { Market } from "@/types";

export default function InstrumentPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();
  const inst = INSTRUMENTS.find((i) => i.symbol === upperSymbol);
  const color = INSTRUMENT_COLORS[upperSymbol] || "#7c3aed";
  const { prices } = usePrices();
  const { isSignedIn } = useUser();
  const { profile, refreshProfile } = useUserProfile();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, total: 0 });

  // Betting panel state
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betSide, setBetSide] = useState<"yes" | "no">("yes");
  const [betAmount, setBetAmount] = useState("");
  const [betLoading, setBetLoading] = useState(false);
  const [betError, setBetError] = useState("");

  const currentPrice = prices[upperSymbol]?.price;
  const priceData = prices[upperSymbol];

  const fetchMarkets = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("markets")
      .select("*, instrument:instruments(*)")
      .eq("market_date", today)
      .order("strike_price", { ascending: false });

    if (data) {
      const filtered = data
        .map((m) => ({ ...m, instrument: Array.isArray(m.instrument) ? m.instrument[0] : m.instrument }))
        .filter((m) => m.instrument?.symbol === upperSymbol && m.strike_price !== 0.01);
      setMarkets(filtered);
      if (filtered.length > 0 && !selectedMarket) {
        setSelectedMarket(filtered[Math.floor(filtered.length / 2)]);
      }
      if (filtered.length > 0) {
        setTimeLeft(getTimeRemaining(filtered[0].cutoff_time));
      }
    }
    setLoading(false);
  }, [upperSymbol, selectedMarket]);

  useEffect(() => {
    fetchMarkets();
    const channel = supabase
      .channel(`instrument-${upperSymbol}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "markets" }, fetchMarkets)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [upperSymbol, fetchMarkets]);

  useEffect(() => {
    if (markets.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(markets[0].cutoff_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [markets]);

  function selectMarket(market: Market, side: "yes" | "no") {
    setSelectedMarket(market);
    setBetSide(side);
    setBetAmount("");
    setBetError("");
  }

  async function handleBet() {
    if (!selectedMarket) return;
    const amount = parseInt(betAmount);
    if (!amount || amount <= 0) { setBetError("請輸入有效金額"); return; }
    if (profile && amount > profile.chips_balance) { setBetError("籌碼不足"); return; }

    setBetLoading(true);
    setBetError("");
    try {
      const res = await fetch(`/api/markets/${selectedMarket.id}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ side: betSide, amount }),
      });
      const data = await res.json();
      if (!res.ok) { setBetError(data.error || "下注失敗"); return; }
      setBetAmount("");
      refreshProfile();
      fetchMarkets();
    } catch { setBetError("下注失敗"); } finally { setBetLoading(false); }
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const totalVolume = markets.reduce((s, m) => s + m.total_volume, 0);
  const closeDate = markets.length > 0
    ? new Date(markets[0].close_time).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
    : "";

  const selectedPrices = selectedMarket
    ? calculatePrices(selectedMarket.yes_pool, selectedMarket.no_pool)
    : null;

  const potentialPayout = selectedMarket && parseInt(betAmount) > 0
    ? calculatePotentialPayout(parseInt(betAmount), betSide, selectedMarket.yes_pool, selectedMarket.no_pool)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回市場
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* === LEFT: Main content === */}
        <div>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl" style={{ backgroundColor: `${color}20` }}>
              {inst?.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                  {inst?.type === "crypto" ? "加密" : "期貨"}
                </span>
                <span className="text-xs text-muted-foreground">{inst?.name}</span>
              </div>
              <h1 className="text-xl font-bold">
                {upperSymbol} 今日收盤價高於 ___？
              </h1>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <span>${formatChips(totalVolume)} 交易量</span>
            <span>|</span>
            <span>{closeDate}</span>
            {currentPrice !== undefined && (
              <>
                <span>|</span>
                <span>目前價格: <span className="text-foreground font-semibold">{formatPrice(currentPrice, upperSymbol)}</span></span>
              </>
            )}
          </div>

          {/* Countdown */}
          {!timeLeft.expired && (
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <span>預估剩餘時間:</span>
              <span className="font-semibold text-foreground">
                {timeLeft.days > 0 ? `${timeLeft.days}天 ` : ""}{pad(timeLeft.hours)}時{pad(timeLeft.minutes)}分
              </span>
            </div>
          )}

          {/* === Strike Price Table === */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            {markets.map((market, i) => {
              const { yesCents, noCents, yesPercent } = calculatePrices(market.yes_pool, market.no_pool);
              const bettable = isMarketBettable(market.cutoff_time) && market.status === "open";
              const isAbove = currentPrice !== undefined && currentPrice > market.strike_price;
              const isSelected = selectedMarket?.id === market.id;

              return (
                <div
                  key={market.id}
                  className={`grid grid-cols-[1fr_80px_140px_140px] items-center px-4 py-3.5 transition-colors ${
                    i > 0 ? "border-t border-border/30" : ""
                  } ${isSelected ? "bg-accent/30" : "hover:bg-accent/10"}`}
                >
                  {/* Strike Price */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <ArrowUp className={`h-3.5 w-3.5 ${isAbove ? "text-emerald-400" : "text-muted-foreground"}`} />
                      <Link href={`/market/${market.id}`} className="font-semibold hover:underline">
                        &gt;{formatPrice(market.strike_price, upperSymbol)}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5">
                      ${formatChips(market.total_volume)} 交易量
                    </div>
                  </div>

                  {/* Probability */}
                  <div className="text-center">
                    <span className="text-lg font-bold">
                      {market.total_volume === 0 && yesPercent === 50 ? "<1" : yesPercent}%
                    </span>
                  </div>

                  {/* Buy Yes */}
                  <div className="flex justify-center">
                    <button
                      disabled={!bettable || !isSignedIn}
                      onClick={() => selectMarket(market, "yes")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-w-[120px] ${
                        isSelected && betSide === "yes"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      買入 是 {formatCents(yesCents)}
                    </button>
                  </div>

                  {/* Buy No */}
                  <div className="flex justify-center">
                    <button
                      disabled={!bettable || !isSignedIn}
                      onClick={() => selectMarket(market, "no")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-w-[120px] ${
                        isSelected && betSide === "no"
                          ? "bg-red-500 text-white"
                          : "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      買入 否 {formatCents(noCents)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules section */}
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <span className="text-primary font-bold text-sm">遊戲規則</span>
              <span className="text-muted-foreground text-sm cursor-pointer hover:text-foreground">盤口背景</span>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
              {/* How it works */}
              <div>
                <h4 className="text-foreground font-semibold mb-1.5">玩法說明</h4>
                <p>
                  每個市場提問：「{upperSymbol} 今日收盤價是否會高於目標價格？」
                  玩家可選擇「是」或「否」下注。若預測正確，將按比例獲得獎金池派彩。
                </p>
              </div>

              {/* Daily cycle */}
              <div>
                <h4 className="text-foreground font-semibold mb-1.5">每日結算週期</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>每日自動建立新的預測市場，提供多個價位供玩家選擇</li>
                  <li>收盤時間到達後，系統自動取得收盤價並結算所有市場</li>
                  <li>
                    {inst?.type === "crypto"
                      ? "加密貨幣收盤時間: UTC 00:00（台灣時間 08:00）"
                      : "期貨收盤時間: UTC 21:00（台灣時間 05:00）"}
                  </li>
                  <li>結算完成後，次日市場將根據最新價格重新建立</li>
                  <li>每天的投注模式相同，歷史紀錄可在「投資組合」頁面查看</li>
                </ul>
              </div>

              {/* Payout mechanism */}
              <div>
                <h4 className="text-foreground font-semibold mb-1.5">賠率與派彩機制</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>每個市場有「是」和「否」兩個資金池，所有下注金額匯入對應池中</li>
                  <li>價格以分（¢）顯示：是¢ + 否¢ = 100¢，反映市場的隱含機率</li>
                  <li>結算時，輸方資金池全額分配給贏方，按下注比例派彩</li>
                  <li>例：若你下注 1,000 在「是」池，佔「是」池 10%，贏時獲得總池 10%</li>
                </ul>
              </div>

              {/* Settlement */}
              <div>
                <h4 className="text-foreground font-semibold mb-1.5">結算依據</h4>
                <p>
                  本市場的結算價格來源為{" "}
                  <span className="text-foreground font-semibold">
                    {upperSymbol === "PAXG" ? "Binance" : inst?.type === "crypto" ? "Crypto.com" : "Yahoo Finance"}
                  </span>
                  ，交易對為{" "}
                  <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">
                    {upperSymbol === "PAXG" ? "PAXGUSDT"
                      : inst?.type === "crypto"
                        ? (upperSymbol === "XAUT" ? "XAUT_USD" : `${upperSymbol}_USDT`)
                        : (upperSymbol === "NQ" ? "NQ=F" : "ES=F")}
                  </span>
                  。不同交易所或不同交易對的價格不列入結算依據。
                </p>
              </div>

              {/* Weekend & cutoff */}
              <div>
                <h4 className="text-foreground font-semibold mb-1.5">重要事項</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    收盤前 <span className="text-yellow-400 font-semibold">2 小時</span> 停止接受下注
                  </li>
                  <li>
                    <span className="text-yellow-400 font-semibold">假日（週六、週日）</span>僅開放加密貨幣投注，
                    期貨市場（NQ、ES）休市不開盤
                  </li>
                  <li>每位玩家初始獲得 <span className="text-foreground font-semibold">100,000</span> 免費籌碼</li>
                  <li>本平台僅供娛樂競技使用，所有籌碼均為虛擬貨幣，不涉及任何真實資金</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT: Betting Panel (sticky) === */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="border-border/50 overflow-hidden">
            {/* Panel header */}
            {selectedMarket ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-secondary/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xl" style={{ backgroundColor: `${color}20` }}>
                    {inst?.icon}
                  </div>
                  <div className="text-sm font-semibold">
                    &gt;{formatPrice(selectedMarket.strike_price, upperSymbol)}
                  </div>
                </div>

                <div className="p-4">
                  {/* Buy / Sell tabs */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <span className="font-bold text-foreground border-b-2 border-primary pb-1">買入</span>
                    <span className="text-muted-foreground cursor-not-allowed">賣出</span>
                    <div className="flex-1" />
                    <span className="text-muted-foreground text-xs">盤口</span>
                  </div>

                  {/* Yes / No toggle */}
                  {selectedPrices && (
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <button
                        onClick={() => setBetSide("yes")}
                        className={`py-3 rounded-lg font-bold text-sm transition-all ${
                          betSide === "yes"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-secondary text-muted-foreground hover:bg-emerald-500/10"
                        }`}
                      >
                        是 {formatCents(selectedPrices.yesCents)}
                      </button>
                      <button
                        onClick={() => setBetSide("no")}
                        className={`py-3 rounded-lg font-bold text-sm transition-all ${
                          betSide === "no"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-secondary text-muted-foreground hover:bg-red-500/10"
                        }`}
                      >
                        否 {formatCents(selectedPrices.noCents)}
                      </button>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">金額</span>
                      <span className="text-2xl font-bold">
                        {betAmount ? `$${parseInt(betAmount).toLocaleString()}` : "$0"}
                      </span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={betAmount}
                      onChange={(e) => { setBetAmount(e.target.value); setBetError(""); }}
                      className="bg-secondary border-border text-center text-lg font-semibold"
                    />
                  </div>

                  {/* Quick amounts */}
                  <div className="flex gap-1.5 mb-4">
                    {[100, 500, 1000, 5000].map((q) => (
                      <button
                        key={q}
                        onClick={() => setBetAmount((prev) => String((parseInt(prev) || 0) + q))}
                        className="flex-1 py-2 rounded-lg bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        +${q >= 1000 ? `${q / 1000}K` : q}
                      </button>
                    ))}
                    <button
                      onClick={() => profile && setBetAmount(String(profile.chips_balance))}
                      className="py-2 px-3 rounded-lg bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      最大
                    </button>
                  </div>

                  {/* Payout info */}
                  {parseInt(betAmount) > 0 && (
                    <div className="bg-secondary/50 rounded-lg p-3 mb-4 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">預估派彩</span>
                        <span className="font-semibold text-emerald-400">{formatChips(potentialPayout)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">淨利潤</span>
                        <span className="font-semibold text-emerald-400">
                          +{formatChips(potentialPayout - parseInt(betAmount))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Balance */}
                  {profile && (
                    <div className="text-xs text-muted-foreground mb-3 text-center">
                      可用: {formatChips(profile.chips_balance)} 籌碼
                    </div>
                  )}

                  {/* Error */}
                  {betError && (
                    <div className="text-red-400 text-sm mb-3 text-center">{betError}</div>
                  )}

                  {/* Submit */}
                  <Button
                    onClick={handleBet}
                    disabled={betLoading || !parseInt(betAmount) || !isSignedIn}
                    className={`w-full py-6 text-base font-bold ${
                      betSide === "yes"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {betLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "交易"}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center mt-3">
                    交易即表示你同意 <Link href="/terms" className="underline hover:text-foreground">使用條款</Link>。
                  </p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>點擊左側價位開始下注</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
