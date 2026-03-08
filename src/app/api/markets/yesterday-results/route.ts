import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: markets } = await supabase
    .from("markets")
    .select("id, question, result, yes_pool, no_pool, total_volume, instrument:instruments(symbol, name, icon)")
    .eq("market_date", yesterdayStr)
    .eq("status", "settled")
    .neq("strike_price", 0.01)
    .order("created_at");

  const formatted = (markets || []).map((m) => {
    const inst = Array.isArray(m.instrument) ? m.instrument[0] : m.instrument;
    const total = m.yes_pool + m.no_pool;
    const yes_pct = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50;
    return {
      id: m.id,
      question: m.question,
      result: m.result,
      yes_pct,
      no_pct: 100 - yes_pct,
      total_volume: m.total_volume,
      symbol: inst?.symbol || "",
      icon: inst?.icon || "",
    };
  });

  return NextResponse.json({ markets: formatted, date: yesterdayStr });
}
