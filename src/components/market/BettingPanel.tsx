"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import type { Market } from "@/types";
import {
  calculateOdds,
  calculatePotentialPayout,
  isMarketBettable,
} from "@/lib/market-maker";
import { formatChips } from "@/lib/constants";
import { useUserProfile } from "@/lib/hooks";
import { useToast } from "@/components/ui/toast-notification";

interface BettingPanelProps {
  market: Market;
  onBetPlaced: () => void;
}

export function BettingPanel({ market, onBetPlaced }: BettingPanelProps) {
  const { isSignedIn } = useUser();
  const { profile, refreshProfile } = useUserProfile();
  const { showToast } = useToast();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bettable = isMarketBettable(market.cutoff_time) && market.status === "open";
  const { yesPercent, noPercent } = calculateOdds(market.yes_pool, market.no_pool);
  const isUpdown = market.strike_price === 0.01;
  const yesLabel = isUpdown ? "漲 Up" : "Yes";
  const noLabel = isUpdown ? "跌 Down" : "No";
  const betAmount = parseInt(amount) || 0;

  const potentialPayout = calculatePotentialPayout(
    betAmount,
    side,
    market.yes_pool,
    market.no_pool
  );

  const multiplier = betAmount > 0 ? (potentialPayout / betAmount).toFixed(2) : "0.00";

  async function handleBet() {
    if (!betAmount || betAmount <= 0) {
      setError("請輸入有效的下注金額");
      return;
    }
    if (profile && betAmount > profile.chips_balance) {
      setError("籌碼不足");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/markets/${market.id}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ side, amount: betAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "下注失敗");
        return;
      }

      const sideLabel = side === "yes" ? yesLabel : noLabel;
      showToast(
        "success",
        `下注成功！${formatChips(betAmount)} 籌碼 → ${sideLabel}`,
        `預估獎金：${formatChips(potentialPayout)} 籌碼`
      );
      setAmount("");
      await refreshProfile();
      onBetPlaced();
    } catch {
      setError("下注失敗");
    } finally {
      setLoading(false);
    }
  }

  const quickAmounts = [100, 500, 1000, 5000];

  if (!bettable) {
    return (
      <Card className="p-6 border-border/50">
        <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
          <Lock className="h-8 w-8" />
          <p className="font-medium">
            {market.status === "settled"
              ? "此市場已結算"
              : "此市場已停止下注"}
          </p>
        </div>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="p-6 border-border/50">
        <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
          <p className="font-medium">請先登入再下注</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border/50">
      <h3 className="font-semibold mb-4">下注</h3>

      {/* Balance */}
      {profile && (
        <div className="text-sm text-muted-foreground mb-4">
          餘額：<span className="font-semibold text-foreground">{formatChips(profile.chips_balance)}</span> 籌碼
        </div>
      )}

      {/* Side selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setSide("yes")}
          className={`py-3 rounded-lg font-semibold text-sm transition-all ${
            side === "yes"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-secondary text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"
          }`}
        >
          {yesLabel} {yesPercent}%
        </button>
        <button
          onClick={() => setSide("no")}
          className={`py-3 rounded-lg font-semibold text-sm transition-all ${
            side === "no"
              ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
              : "bg-secondary text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
          }`}
        >
          {noLabel} {noPercent}%
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <Input
          type="number"
          placeholder="輸入下注金額..."
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
          className="bg-secondary border-border"
        />
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2 mb-4">
        {quickAmounts.map((qa) => (
          <button
            key={qa}
            onClick={() => setAmount(String(qa))}
            className="flex-1 py-1.5 rounded-md bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {formatChips(qa)}
          </button>
        ))}
      </div>

      {/* Payout estimate */}
      {betAmount > 0 && (
        <div className="bg-secondary rounded-lg p-3 mb-4 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">預估獎金</span>
            <span className="font-semibold text-emerald-400">
              {formatChips(potentialPayout)} 籌碼
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">賠率</span>
            <span className="font-semibold">{multiplier}x</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleBet}
        disabled={loading || betAmount <= 0}
        className={`w-full font-semibold ${
          side === "yes"
            ? "bg-emerald-500 hover:bg-emerald-600"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {loading
          ? "下注中..."
          : `下注 ${betAmount > 0 ? formatChips(betAmount) : ""} → ${side === "yes" ? yesLabel : noLabel}`}
      </Button>
    </Card>
  );
}
