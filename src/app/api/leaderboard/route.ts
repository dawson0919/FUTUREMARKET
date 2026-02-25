import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, chips_balance, total_profit, total_trades, wins, losses")
    .order("total_profit", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaderboard = (data || []).map((p) => ({
    ...p,
    win_rate: p.total_trades > 0 ? Math.round((p.wins / p.total_trades) * 100) : 0,
  }));

  return NextResponse.json({ leaderboard });
}
