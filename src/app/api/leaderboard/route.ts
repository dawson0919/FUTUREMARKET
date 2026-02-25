import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Compute stats from settled positions for accuracy
  const { data: positions, error } = await supabase
    .from("positions")
    .select("user_id, amount, payout")
    .eq("settled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!positions || positions.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  // Aggregate per user from settled positions only
  const userStats: Record<
    string,
    { total_profit: number; total_trades: number; wins: number; losses: number }
  > = {};

  for (const pos of positions) {
    if (!userStats[pos.user_id]) {
      userStats[pos.user_id] = { total_profit: 0, total_trades: 0, wins: 0, losses: 0 };
    }
    const s = userStats[pos.user_id];
    const profit = (pos.payout || 0) - pos.amount;
    s.total_profit += profit;
    s.total_trades += 1;
    if ((pos.payout || 0) > 0) {
      s.wins += 1;
    } else {
      s.losses += 1;
    }
  }

  // Fetch profiles for display info
  const userIds = Object.keys(userStats);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, chips_balance")
    .in("id", userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  const leaderboard = userIds
    .map((uid) => {
      const s = userStats[uid];
      const profile = profileMap.get(uid);
      return {
        id: uid,
        username: profile?.username || null,
        avatar_url: profile?.avatar_url || null,
        chips_balance: profile?.chips_balance || 0,
        total_profit: s.total_profit,
        total_trades: s.total_trades,
        wins: s.wins,
        losses: s.losses,
        win_rate: s.total_trades > 0 ? Math.round((s.wins / s.total_trades) * 100) : 0,
      };
    })
    .sort((a, b) => b.total_profit - a.total_profit)
    .slice(0, 100);

  return NextResponse.json({ leaderboard });
}
