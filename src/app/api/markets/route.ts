import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "open";
  const type = searchParams.get("type");

  let query = supabase
    .from("markets")
    .select("*, instrument:instruments(*)")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let markets = (data || []).map((m) => ({
    ...m,
    instrument: Array.isArray(m.instrument) ? m.instrument[0] : m.instrument,
  }));

  if (type && type !== "all") {
    markets = markets.filter((m) => m.instrument?.type === type);
  }

  return NextResponse.json({ markets });
}
