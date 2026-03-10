import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Get all profiles sorted by chips_balance (competition ranking)
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, chips_balance, total_trades, wins, losses")
    .order("chips_balance", { ascending: false })
    .limit(50);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  const userIds = profiles.map((p) => p.id);

  // Yesterday's rank snapshot
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const { data: snapshots } = await supabase
    .from("rank_snapshots")
    .select("user_id, rank")
    .eq("snapshot_date", yesterdayStr)
    .in("user_id", userIds);
  const snapshotMap = new Map((snapshots || []).map((s) => [s.user_id, s.rank]));

  const leaderboard = profiles.map((p, i) => {
    const todayRank = i + 1;
    const yesterdayRank = snapshotMap.get(p.id) ?? null;
    const rank_change = yesterdayRank ? yesterdayRank - todayRank : null;
    const totalTrades = p.total_trades || 0;
    const wins = p.wins || 0;
    return {
      id: p.id,
      username: p.username,
      avatar_url: p.avatar_url,
      chips_balance: p.chips_balance,
      total_trades: totalTrades,
      wins,
      win_rate: totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0,
      rank_change,
    };
  });

  return NextResponse.json({ leaderboard });
}
