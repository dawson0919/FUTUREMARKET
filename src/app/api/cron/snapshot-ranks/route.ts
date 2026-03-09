import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "futuremarket-cron-2024";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceSupabase();
  const today = new Date().toISOString().split("T")[0];

  // Get all profiles ordered by chips_balance (competition ranking)
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, chips_balance")
    .order("chips_balance", { ascending: false });

  if (error || !profiles) {
    return NextResponse.json({ error: error?.message || "No profiles" }, { status: 500 });
  }

  const snapshots = profiles.map((p, i) => ({
    snapshot_date: today,
    user_id: p.id,
    rank: i + 1,
    chips_balance: p.chips_balance,
  }));

  const { error: upsertError } = await db
    .from("rank_snapshots")
    .upsert(snapshots, { onConflict: "snapshot_date,user_id" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ saved: snapshots.length, date: today });
}
