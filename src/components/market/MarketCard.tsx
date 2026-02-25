"use client";

import Link from "next/link";
import { Clock, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/types";
import { calculateOdds, getTimeRemaining, isMarketBettable } from "@/lib/market-maker";
import { formatChips, formatPrice, INSTRUMENT_COLORS } from "@/lib/constants";
import { useEffect, useState } from "react";

interface MarketCardProps {
  market: Market;
  currentPrice?: number;
}

export function MarketCard({ market, currentPrice }: MarketCardProps) {
  const { yesPercent, noPercent } = calculateOdds(market.yes_pool, market.no_pool);
  const bettable = isMarketBettable(market.cutoff_time);
  const symbol = market.instrument?.symbol || "";
  const color = INSTRUMENT_COLORS[symbol] || "#7c3aed";
  const isUpdown = market.strike_price === 0.01;

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(market.cutoff_time));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(market.cutoff_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [market.cutoff_time]);

  const yesLabel = isUpdown ? "漲" : "Yes";
  const noLabel = isUpdown ? "跌" : "No";

  const statusBadge = () => {
    if (market.status === "settled") {
      return (
        <Badge variant="secondary" className="text-xs">
          {isUpdown
            ? (market.outcome === "yes" ? "收漲" : "收跌")
            : (market.outcome === "yes" ? "高於目標價" : "低於目標價")
          }
        </Badge>
      );
    }
    if (!bettable) {
      return (
        <Badge variant="destructive" className="text-xs">
          已停止下注
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-live-pulse" />
        交易中
      </Badge>
    );
  };

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-border hover:bg-card/80 transition-all cursor-pointer">
        {/* Color accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{market.instrument?.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {symbol}
                  </span>
                  {statusBadge()}
                </div>
              </div>
            </div>
            {currentPrice !== undefined && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">目前價格</div>
                <div className="text-sm font-semibold">{formatPrice(currentPrice, symbol)}</div>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm mb-4 leading-snug">{market.title}</h3>

          {/* Odds bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-emerald-400 font-semibold">{yesLabel} {yesPercent}%</span>
              <span className="text-red-400 font-semibold">{noLabel} {noPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div
                className="h-full rounded-l-full transition-all duration-500"
                style={{
                  width: `${yesPercent}%`,
                  backgroundColor: "var(--color-yes)",
                }}
              />
              <div
                className="h-full rounded-r-full transition-all duration-500"
                style={{
                  width: `${noPercent}%`,
                  backgroundColor: "var(--color-no)",
                }}
              />
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {formatChips(market.total_volume)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {market.participant_count}
              </span>
            </div>
            {bettable && !timeLeft.expired && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLeft.hours}時{timeLeft.minutes}分
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
