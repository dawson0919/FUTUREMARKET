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

  // Get markets that were settled within the period
  const { data: periodMarkets } = await supabase
    .from("markets")
    .select("id")
    .eq("status", "settled")
    .gte("close_time", periodStart);

  if (!periodMarkets || periodMarkets.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  const marketIds = periodMarkets.map((m) => m.id);

  // Compute from settled positions in those markets
  const { data: positions, error } = await supabase
    .from("positions")
    .select("user_id, amount, payout, market_id")
    .eq("settled", true)
    .in("market_id", marketIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!positions || positions.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  // Aggregate by user
  const userStats: Record<
    string,
    { profit: number; trades: number; wins: number }
  > = {};

  for (const pos of positions) {
    if (!userStats[pos.user_id]) {
      userStats[pos.user_id] = { profit: 0, trades: 0, wins: 0 };
    }
    const s = userStats[pos.user_id];
    s.profit += (pos.payout || 0) - pos.amount;
    s.trades += 1;
    if ((pos.payout || 0) > 0) {
      s.wins += 1;
    }
  }

  // Filter and sort
  const entries = Object.entries(userStats)
    .map(([uid, s]) => ({
      user_id: uid,
      period_profit: s.profit,
      period_trades: s.trades,
      period_wins: s.wins,
    }))
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
