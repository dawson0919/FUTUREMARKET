import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

// Competition config — update per edition
const COMPETITION = {
  edition: 1,
  title: "第一屆 刀神的海期教室",
  prize: "500 USDT",
  start_date: "2026-03-10",
  end_date: "2026-04-10",
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "futuremarket-cron-2024";
  if (authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getServiceSupabase();

  // Check if this edition was already settled
  const { data: existing } = await db
    .from("competition_champions")
    .select("id")
    .eq("edition", COMPETITION.edition)
    .single();

  if (existing) {
    return NextResponse.json({ message: `Edition ${COMPETITION.edition} already settled` });
  }

  // Rank all users by chips_balance (all started at 100,000)
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, username, avatar_url, chips_balance, total_trades, wins")
    .order("chips_balance", { ascending: false })
    .limit(1);

  if (error || !profiles || profiles.length === 0) {
    return NextResponse.json({ error: "No profiles found" }, { status: 500 });
  }

  const champion = profiles[0];

  const { error: insertError } = await db.from("competition_champions").insert({
    edition: COMPETITION.edition,
    title: COMPETITION.title,
    prize: COMPETITION.prize,
    start_date: COMPETITION.start_date,
    end_date: COMPETITION.end_date,
    champion_user_id: champion.id,
    champion_username: champion.username,
    champion_avatar_url: champion.avatar_url,
    final_chips: champion.chips_balance,
    total_trades: champion.total_trades,
    wins: champion.wins,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    edition: COMPETITION.edition,
    champion: {
      username: champion.username,
      final_chips: champion.chips_balance,
    },
  });
}
