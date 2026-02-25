"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { calculatePrices } from "@/lib/market-maker";
import { INSTRUMENTS, INSTRUMENT_COLORS } from "@/lib/constants";
import type { Market } from "@/types";

function ProbabilityGauge({ percent, label }: { percent: number; label: string }) {
  // Semicircle gauge: 0% = left, 100% = right
  // SVG arc from 180deg to 0deg
  const radius = 36;
  const cx = 44;
  const cy = 44;
  const startAngle = Math.PI; // 180 degrees (left)
  const endAngle = 0; // 0 degrees (right)
  const angle = startAngle - (percent / 100) * Math.PI;

  // Background arc path (full semicircle)
  const bgStartX = cx + radius * Math.cos(startAngle);
  const bgStartY = cy - radius * Math.sin(startAngle);
  const bgEndX = cx + radius * Math.cos(endAngle);
  const bgEndY = cy - radius * Math.sin(endAngle);

  // Foreground arc path
  const fgEndX = cx + radius * Math.cos(angle);
  const fgEndY = cy - radius * Math.sin(angle);
  const largeArc = percent > 50 ? 1 : 0;

  const isUp = label === "漲";
  const color = isUp ? "#22c55e" : "#ef4444";

  return (
    <div className="relative flex flex-col items-center">
      <svg width="88" height="50" viewBox="0 0 88 50">
        {/* Background arc (gray) */}
        <path
          d={`M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`}
          fill="none"
          stroke="oklch(0.25 0.01 260)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Foreground arc (colored) */}
        {percent > 0 && (
          <path
            d={`M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 ${largeArc} 1 ${fgEndX} ${fgEndY}`}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute bottom-0 text-center">
        <span className="text-lg font-bold text-foreground">{percent}%</span>
        <div className="text-[10px] font-semibold" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

export function UpDownCard({ market }: { market: Market }) {
  const inst = INSTRUMENTS.find(
    (i) => i.symbol === (market.instrument as { symbol: string })?.symbol
  );
  if (!inst) return null;

  const symbol = inst.symbol;
  const color = INSTRUMENT_COLORS[symbol] || "#7c3aed";
  const { yesPercent } = calculatePrices(market.yes_pool, market.no_pool);
  const noPercent = 100 - yesPercent;

  // Determine which side is winning
  const upPercent = yesPercent;
  const gaugeLabel = upPercent >= 50 ? "漲" : "跌";
  const gaugePercent = upPercent >= 50 ? upPercent : noPercent;

  // Date label
  const dateLabel = new Date(market.market_date).toLocaleDateString("zh-TW", {
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="group border-border/50 bg-card hover:border-border transition-all cursor-pointer overflow-hidden h-full">
        <div className="p-5">
          {/* Top: icon + title + gauge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                {inst.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold leading-snug">
                  {inst.name} {dateLabel} 漲還是跌？
                </h3>
              </div>
            </div>
            <ProbabilityGauge percent={gaugePercent} label={gaugeLabel} />
          </div>

          {/* Up / Down buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button className="py-2.5 rounded-lg text-sm font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
              漲 Up
            </button>
            <button className="py-2.5 rounded-lg text-sm font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              跌 Down
            </button>
          </div>

          {/* Footer: live + bookmark */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-live-pulse" />
              <span className="text-red-400 font-medium">即時</span>
            </div>
            <button
              onClick={(e) => e.preventDefault()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
