"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getTimeRemaining } from "@/lib/market-maker";

interface MarketTimerProps {
  cutoffTime: string;
  closeTime: string;
}

export function MarketTimer({ cutoffTime, closeTime }: MarketTimerProps) {
  const [cutoffLeft, setCutoffLeft] = useState(getTimeRemaining(cutoffTime));
  const [closeLeft, setCloseLeft] = useState(getTimeRemaining(closeTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setCutoffLeft(getTimeRemaining(cutoffTime));
      setCloseLeft(getTimeRemaining(closeTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [cutoffTime, closeTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="space-y-3">
      {/* Betting Cutoff */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Betting Closes</span>
        </div>
        {cutoffLeft.expired ? (
          <span className="text-sm font-semibold text-red-400">Closed</span>
        ) : (
          <span className="text-sm font-mono font-semibold text-yellow-400">
            {pad(cutoffLeft.hours)}:{pad(cutoffLeft.minutes)}:{pad(cutoffLeft.seconds)}
          </span>
        )}
      </div>

      {/* Market Close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Market Settles</span>
        </div>
        {closeLeft.expired ? (
          <span className="text-sm font-semibold text-muted-foreground">Settled</span>
        ) : (
          <span className="text-sm font-mono font-semibold">
            {pad(closeLeft.hours)}:{pad(closeLeft.minutes)}:{pad(closeLeft.seconds)}
          </span>
        )}
      </div>
    </div>
  );
}
