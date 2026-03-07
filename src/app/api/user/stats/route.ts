import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, checkin_streak")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Get all settled positions ordered by created_at desc
  const { data: positions } = await supabase
    .from("positions")
    .select("amount, payout, settled, market:markets(instrument_id, instrument:instruments(symbol))")
    .eq("user_id", profile.id)
    .eq("settled", true)
    .order("created_at", { ascending: false });

  if (!positions || positions.length === 0) {
    return NextResponse.json({
      stats: {
        best_trade: 0,
        worst_trade: 0,
        current_streak: 0,
        best_streak: 0,
        checkin_streak: profile.checkin_streak || 0,
        favorite_instrument: null,
      },
    });
  }

  let bestTrade = 0;
  let worstTrade = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let countedCurrent = false;
  const instrumentCounts: Record<string, number> = {};

  for (const pos of positions) {
    const profit = (pos.payout || 0) - pos.amount;

    if (profit > bestTrade) bestTrade = profit;
    if (profit < worstTrade) worstTrade = profit;

    // Streak calculation (positions are desc by created_at)
    const won = (pos.payout || 0) > 0;
    if (!countedCurrent) {
      if (won) {
        currentStreak++;
        tempStreak++;
      } else {
        countedCurrent = true;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
      }
    } else {
      if (won) {
        tempStreak++;
      } else {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    // Favorite instrument
    const market = Array.isArray(pos.market) ? pos.market[0] : pos.market;
    const inst = market
      ? Array.isArray(market.instrument) ? market.instrument[0] : market.instrument
      : null;
    if (inst?.symbol) {
      instrumentCounts[inst.symbol] = (instrumentCounts[inst.symbol] || 0) + 1;
    }
  }

  // Final streak check
  if (tempStreak > bestStreak) bestStreak = tempStreak;
  if (!countedCurrent && currentStreak > bestStreak) bestStreak = currentStreak;

  // Find favorite instrument
  let favoriteInstrument: string | null = null;
  let maxCount = 0;
  for (const [symbol, count] of Object.entries(instrumentCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteInstrument = symbol;
    }
  }

  return NextResponse.json({
    stats: {
      best_trade: bestTrade,
      worst_trade: worstTrade,
      current_streak: currentStreak,
      best_streak: bestStreak,
      checkin_streak: profile.checkin_streak || 0,
      favorite_instrument: favoriteInstrument,
    },
  });
}
