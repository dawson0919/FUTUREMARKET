import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ results: [] });
  }

  // Get unseen settled positions with market info
  const { data: positions } = await supabase
    .from("positions")
    .select("id, side, amount, payout, market:markets(title, instrument:instruments(symbol, icon))")
    .eq("user_id", profile.id)
    .eq("settled", true)
    .eq("result_seen", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const results = (positions || []).map((p) => {
    const market = Array.isArray(p.market) ? p.market[0] : p.market;
    const instrument = market
      ? Array.isArray(market.instrument) ? market.instrument[0] : market.instrument
      : null;
    const profit = (p.payout || 0) - p.amount;
    return {
      id: p.id,
      symbol: instrument?.symbol || "",
      icon: instrument?.icon || "",
      title: market?.title || "",
      side: p.side,
      amount: p.amount,
      payout: p.payout || 0,
      profit,
      won: profit > 0,
    };
  });

  return NextResponse.json({ results });
}
