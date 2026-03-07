"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, ExternalLink, TrendingUp, Users, Clock, BookOpen, Shield, Info } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BettingPanel } from "@/components/market/BettingPanel";
import { MarketTimer } from "@/components/market/MarketTimer";
import { useMarket, usePrices } from "@/lib/hooks";
import { calculateOdds } from "@/lib/market-maker";
import { formatChips, formatPrice, INSTRUMENT_COLORS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { Position } from "@/types";

export default function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { market, loading, refreshMarket } = useMarket(id);
  const { prices } = usePrices();
  const { data: session } = useSession();
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    async function fetchPositions() {
      if (!session?.user?.id || !market) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_id", session.user.id)
        .single();

      if (profile) {
        const { data } = await supabase
          .from("positions")
          .select("*")
          .eq("user_id", profile.id)
          .eq("market_id", market.id)
          .order("created_at", { ascending: false });
        if (data) setPositions(data);
      }
    }
    fetchPositions();
  }, [session, market]);

  if (loading || !market) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const symbol = market.instrument?.symbol || "";
  const color = INSTRUMENT_COLORS[symbol] || "#7c3aed";
  const { yesPercent, noPercent } = calculateOdds(market.yes_pool, market.no_pool);
  const currentPrice = prices[symbol]?.price;

  // Detect up/down market
  const isUpdown = market.strike_price === 0.01;
  const refMatch = isUpdown ? market.description?.match(/ref:([\d.]+)/) : null;
  const refPrice = refMatch ? parseFloat(refMatch[1]) : 0;

  return (
    <div>
      {/* Back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回市場
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market header */}
          <Card className="p-6 border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{market.instrument?.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {symbol}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {market.instrument?.name}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold">{market.title}</h1>
                </div>
              </div>
              <Badge
                variant={market.status === "open" ? "default" : "secondary"}
                className={
                  market.status === "open"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : ""
                }
              >
                {market.status === "open" ? "交易中" : market.status === "closed" ? "已關閉" : "已結算"}
              </Badge>
            </div>

            {/* Price info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-secondary rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {isUpdown ? "開盤參考價" : "目標價格"}
                </div>
                <div className="font-semibold">
                  {isUpdown ? formatPrice(refPrice, symbol) : formatPrice(market.strike_price, symbol)}
                </div>
              </div>
              {currentPrice !== undefined && (
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">目前價格</div>
                  <div className="font-semibold">{formatPrice(currentPrice, symbol)}</div>
                </div>
              )}
              <div className="bg-secondary rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">交易量</div>
                <div className="font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {formatChips(market.total_volume)}
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">參與人數</div>
                <div className="font-semibold flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {market.participant_count}
                </div>
              </div>
            </div>

            {/* Big odds display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <div className="text-sm text-emerald-400 mb-1">{isUpdown ? "漲 Up" : "Yes"}</div>
                <div className="text-3xl font-bold text-emerald-400">{yesPercent}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  獎池：{formatChips(market.yes_pool)}
                </div>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                <div className="text-sm text-red-400 mb-1">{isUpdown ? "跌 Down" : "No"}</div>
                <div className="text-3xl font-bold text-red-400">{noPercent}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  獎池：{formatChips(market.no_pool)}
                </div>
              </div>
            </div>

            {/* Outcome */}
            {market.status === "settled" && (
              <div
                className={`rounded-lg p-4 text-center ${
                  market.outcome === "yes"
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <div className="text-sm text-muted-foreground mb-1">結算結果</div>
                <div
                  className={`text-lg font-bold ${
                    market.outcome === "yes" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  收盤價 {market.closing_price ? formatPrice(market.closing_price, symbol) : "N/A"}
                  {" — "}
                  {isUpdown
                    ? (market.outcome === "yes" ? "漲 ↑" : "跌 ↓")
                    : (market.outcome === "yes" ? "高於目標價" : "低於目標價")
                  }
                </div>
              </div>
            )}
          </Card>

          {/* Your positions */}
          {positions.length > 0 && (
            <Card className="p-6 border-border/50">
              <h3 className="font-semibold mb-4">我的持倉</h3>
              <div className="space-y-3">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between bg-secondary rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          pos.side === "yes"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {pos.side.toUpperCase()}
                      </span>
                      <div>
                        <div className="text-sm font-medium">
                          {formatChips(pos.amount)} 籌碼
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(pos.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {pos.settled && pos.payout !== null ? (
                        <span
                          className={`text-sm font-semibold ${
                            pos.payout > 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {pos.payout > 0 ? "+" : ""}
                          {formatChips(pos.payout - pos.amount)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          預估獎金：{formatChips(pos.potential_payout)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rules & Resolution */}
          <MarketRules symbol={symbol} instrumentType={market.instrument?.type || "crypto"} strikePrice={market.strike_price} isUpdown={isUpdown} refPrice={refPrice} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timer */}
          <Card className="p-6 border-border/50">
            <MarketTimer cutoffTime={market.cutoff_time} closeTime={market.close_time} />
          </Card>

          {/* Betting panel */}
          <BettingPanel market={market} onBetPlaced={refreshMarket} />

          {/* How to play */}
          <Card className="p-5 border-border/50">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              如何參與
            </h4>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>選擇{isUpdown
                ? <> <span className="text-emerald-400 font-medium">漲 Up</span> 或 <span className="text-red-400 font-medium">跌 Down</span></>
                : <> <span className="text-emerald-400 font-medium">Yes</span> 或 <span className="text-red-400 font-medium">No</span></>
              } 方向</li>
              <li>輸入下注籌碼數量</li>
              <li>確認下注，等待收盤結算</li>
              <li>預測正確即可瓜分獎池</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MarketRules({
  symbol,
  instrumentType,
  strikePrice,
  isUpdown,
  refPrice,
}: {
  symbol: string;
  instrumentType: string;
  strikePrice: number;
  isUpdown: boolean;
  refPrice: number;
}) {
  const isCrypto = instrumentType === "crypto";

  const priceSourceName = symbol === "PAXG" ? "Binance" : isCrypto ? "Crypto.com" : "Yahoo Finance";
  const priceSourcePair = symbol === "PAXG" ? "PAXGUSDT" : isCrypto ? `${symbol}_USDT` : symbol === "NQ" ? "NQ=F" : "ES=F";

  const closeTimeDesc = isCrypto ? "UTC 00:00 (台灣時間 08:00)" : "UTC 21:00 (台灣時間 05:00)";

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-6">
        {/* Section: Rules */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            遊戲規則
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            {isUpdown ? (
              <>
                <p>
                  本市場預測 <span className="text-foreground font-semibold">{symbol}</span> 今日收盤價相較於開盤參考價
                  <span className="text-foreground font-semibold"> {formatPrice(refPrice, symbol)}</span> 是漲還是跌。
                </p>
                <ul className="space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">漲 Up</span>
                    <span>= 你預測收盤價將 <span className="text-foreground">高於</span> 開盤參考價</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400 font-bold shrink-0">跌 Down</span>
                    <span>= 你預測收盤價將 <span className="text-foreground">等於或低於</span> 開盤參考價</span>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  本市場預測 <span className="text-foreground font-semibold">{symbol}</span> 今日收盤價是否會
                  <span className="text-emerald-400 font-semibold"> 高於 </span>
                  目標價格 <span className="text-foreground font-semibold">{formatPrice(strikePrice, symbol)}</span>。
                </p>
                <ul className="space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">Yes</span>
                    <span>= 你預測收盤價將 <span className="text-foreground">高於</span> 目標價格</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400 font-bold shrink-0">No&nbsp;</span>
                    <span>= 你預測收盤價將 <span className="text-foreground">等於或低於</span> 目標價格</span>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Section: Resolution */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            結算方式
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              本市場的結算價格來源為 <span className="text-foreground font-semibold">{priceSourceName}</span>，
              交易對為 <span className="text-foreground font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">{priceSourcePair}</span>。
            </p>
            <p>
              收盤時間為每日 <span className="text-foreground font-semibold">{closeTimeDesc}</span>，
              系統將在收盤後自動擷取價格並進行結算。
            </p>
            <p>
              結算結果完全取決於上述資料來源的價格數據。不同交易所或不同交易對的價格不列入結算依據。
            </p>
          </div>
        </div>

        <Separator />

        {/* Section: Payout */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            派彩機制
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              本平台採用 <span className="text-foreground font-semibold">Parimutuel（同池分彩）</span> 機制：
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>所有 Yes 和 No 的下注籌碼匯入同一獎池</li>
              <li>收盤結算後，預測正確的一方按各自下注比例瓜分整個獎池</li>
              <li>預測錯誤的一方將失去全部下注籌碼</li>
            </ul>

            <div className="bg-secondary rounded-lg p-4 mt-3">
              <p className="text-xs font-semibold text-foreground mb-2">派彩計算範例：</p>
              <div className="text-xs space-y-1">
                <p>假設 Yes 獎池 = 60,000 / No 獎池 = 40,000 / 總獎池 = 100,000</p>
                <p>你在 Yes 下注 10,000（佔 Yes 獎池 16.7%）</p>
                <p>若結果為 Yes：你的派彩 = 100,000 x 16.7% = <span className="text-emerald-400 font-semibold">16,700 籌碼</span></p>
                <p>淨利潤 = 16,700 - 10,000 = <span className="text-emerald-400 font-semibold">+6,700 籌碼</span></p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section: Important Notes */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            重要事項
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>收盤前 <span className="text-yellow-400 font-semibold">2 小時</span> 停止接受下注</li>
            <li>下注後無法撤銷，請謹慎操作</li>
            <li>每位玩家初始獲得 <span className="text-foreground font-semibold">100,000</span> 免費籌碼</li>
            <li>本平台僅供娛樂競技使用，所有籌碼均為虛擬貨幣，不涉及真實金錢</li>
            <li>排行榜依據總盈虧排名，展現你的預測實力！</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
