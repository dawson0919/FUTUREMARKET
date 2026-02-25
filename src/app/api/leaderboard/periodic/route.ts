import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getPeriodStart(period: string): string {
  const now = new Date();

  if (period === "week") {
    // Monday 00:00 UTC of current week
    const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
    const diff = day === 0 ? 6 : day - 1; // days since Monday
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
    return monday.toISOString();
  }

  // month: 1st of current month 00:00 UTC
  const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return firstDay.toISOString();
}

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") || "week";

  if (!["week", "month"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const periodStart = getPeriodStart(period);

  // Fetch all transactions within the period
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("user_id, type, amount, market_id")
    .gte("created_at", periodStart)
    .in("type", ["bet", "payout"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  // Aggregate by user
  const userStats: Record<string, {
    user_id: string;
    bets: number;
    payouts: number;
    trade_count: number;
    win_markets: Set<string>;
  }> = {};

  for (const tx of transactions) {
    if (!userStats[tx.user_id]) {
      userStats[tx.user_id] = {
        user_id: tx.user_id,
        bets: 0,
        payouts: 0,
        trade_count: 0,
        win_markets: new Set(),
      };
    }
    const stat = userStats[tx.user_id];
    if (tx.type === "bet") {
      stat.bets += tx.amount;
      stat.trade_count += 1;
    } else if (tx.type === "payout") {
      stat.payouts += tx.amount;
      if (tx.amount > 0) {
        stat.win_markets.add(tx.market_id);
      }
    }
  }

  // Calculate profit and filter
  const entries = Object.values(userStats)
    .map((s) => ({
      user_id: s.user_id,
      period_profit: s.payouts - s.bets,
      period_trades: s.trade_count,
      period_wins: s.win_markets.size,
    }))
    .filter((e) => e.period_profit !== 0)
    .sort((a, b) => b.period_profit - a.period_profit)
    .slice(0, 50);

  if (entries.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  // Fetch user profiles
  const userIds = entries.map((e) => e.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, chips_balance")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  const leaderboard = entries.map((e) => {
    const profile = profileMap.get(e.user_id);
    return {
      id: e.user_id,
      username: profile?.username || null,
      avatar_url: profile?.avatar_url || null,
      chips_balance: profile?.chips_balance || 0,
      period_profit: e.period_profit,
      period_trades: e.period_trades,
      period_wins: e.period_wins,
    };
  });

  return NextResponse.json({ leaderboard, period, periodStart });
}
