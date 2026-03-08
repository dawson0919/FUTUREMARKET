import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, chips_balance")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Count users ranked above (more chips)
  const { count: higherCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("chips_balance", profile.chips_balance);

  const { count: totalCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const rank = (higherCount || 0) + 1;
  const total = totalCount || 0;

  // Gap from #1
  const { data: top1 } = await supabase
    .from("profiles")
    .select("chips_balance")
    .order("chips_balance", { ascending: false })
    .limit(1)
    .single();

  const gap_from_top = (top1?.chips_balance || 0) - profile.chips_balance;

  // Gap to next rank
  let gap_to_next = 0;
  if (rank > 1) {
    const { data: nextUp } = await supabase
      .from("profiles")
      .select("chips_balance")
      .gt("chips_balance", profile.chips_balance)
      .order("chips_balance", { ascending: true })
      .limit(1)
      .single();
    gap_to_next = (nextUp?.chips_balance || 0) - profile.chips_balance;
  }

  // Yesterday's rank snapshot
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { data: snapshot } = await supabase
    .from("rank_snapshots")
    .select("rank")
    .eq("snapshot_date", yesterday.toISOString().split("T")[0])
    .eq("user_id", profile.id)
    .single();

  const rank_change = snapshot ? snapshot.rank - rank : null;

  return NextResponse.json({ rank, total, gap_from_top, gap_to_next, rank_change });
}
