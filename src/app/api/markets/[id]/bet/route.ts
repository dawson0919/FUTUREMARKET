import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import { calculatePotentialPayout, isMarketBettable } from "@/lib/market-maker";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "請先登入再下注" }, { status: 401 });
  }

  const { id: marketId } = await params;
  const { side, amount } = await request.json();

  if (!side || !["yes", "no"].includes(side)) {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const db = getServiceSupabase();

  // Get user profile
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (!profile || profileError) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.chips_balance < amount) {
    return NextResponse.json({ error: "Insufficient chips" }, { status: 400 });
  }

  // Get market
  const { data: market, error: marketError } = await db
    .from("markets")
    .select("*")
    .eq("id", marketId)
    .single();

  if (!market || marketError) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  if (market.status !== "open") {
    return NextResponse.json({ error: "Market is not open" }, { status: 400 });
  }

  if (!isMarketBettable(market.cutoff_time)) {
    return NextResponse.json(
      { error: "Betting is closed for this market" },
      { status: 400 }
    );
  }

  const potentialPayout = calculatePotentialPayout(
    amount,
    side,
    market.yes_pool,
    market.no_pool
  );

  const newBalance = profile.chips_balance - amount;

  // Update user balance
  const { error: balanceError } = await db
    .from("profiles")
    .update({
      chips_balance: newBalance,
      total_trades: profile.total_trades + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (balanceError) {
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }

  // Update market pools
  const poolUpdate =
    side === "yes"
      ? { yes_pool: market.yes_pool + amount }
      : { no_pool: market.no_pool + amount };

  // Check if user already has a position in this market on this side
  const { data: existingPosition } = await db
    .from("positions")
    .select("*")
    .eq("user_id", profile.id)
    .eq("market_id", marketId)
    .eq("side", side)
    .single();

  let participantIncrement = 0;

  if (existingPosition) {
    // Update existing position
    await db
      .from("positions")
      .update({
        amount: existingPosition.amount + amount,
        potential_payout: existingPosition.potential_payout + potentialPayout,
      })
      .eq("id", existingPosition.id);
  } else {
    // Check if user has ANY position in this market
    const { data: anyPosition } = await db
      .from("positions")
      .select("id")
      .eq("user_id", profile.id)
      .eq("market_id", marketId)
      .limit(1);

    if (!anyPosition || anyPosition.length === 0) {
      participantIncrement = 1;
    }

    // Create new position
    await db.from("positions").insert({
      user_id: profile.id,
      market_id: marketId,
      side,
      amount,
      potential_payout: potentialPayout,
    });
  }

  await db
    .from("markets")
    .update({
      ...poolUpdate,
      total_volume: market.total_volume + amount,
      participant_count: market.participant_count + participantIncrement,
    })
    .eq("id", marketId);

  // Record transaction
  await db.from("transactions").insert({
    user_id: profile.id,
    market_id: marketId,
    type: "bet",
    side,
    amount,
    balance_after: newBalance,
  });

  return NextResponse.json({
    success: true,
    balance: newBalance,
    potential_payout: potentialPayout,
  });
}
