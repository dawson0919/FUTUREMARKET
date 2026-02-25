import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getAllPrices } from "@/lib/prices";
import { calculateSettlement } from "@/lib/market-maker";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "futuremarket-cron-2024";
  if (authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getServiceSupabase();

  // Find markets that should be settled (close_time has passed, still open)
  const { data: markets } = await db
    .from("markets")
    .select("*, instrument:instruments(*)")
    .eq("status", "open")
    .lte("close_time", new Date().toISOString());

  if (!markets || markets.length === 0) {
    return NextResponse.json({ message: "No markets to settle" });
  }

  const prices = await getAllPrices();
  const settled: string[] = [];
  const errors: string[] = [];

  for (const market of markets) {
    const inst = Array.isArray(market.instrument)
      ? market.instrument[0]
      : market.instrument;
    if (!inst) continue;

    const priceData = prices[inst.symbol];
    if (!priceData) {
      errors.push(`${inst.symbol}: no price data`);
      continue;
    }

    const closingPrice = priceData.price;

    // Determine outcome
    let outcome: "yes" | "no";
    const isUpdown = market.strike_price === 0.01;
    if (isUpdown) {
      // Up/down market: compare to reference price in description
      const refMatch = market.description?.match(/ref:([\d.]+)/);
      const refPrice = refMatch ? parseFloat(refMatch[1]) : 0;
      outcome = closingPrice > refPrice ? "yes" : "no";
    } else {
      outcome = closingPrice > market.strike_price ? "yes" : "no";
    }

    // Update market status and outcome
    await db
      .from("markets")
      .update({
        status: "settled",
        closing_price: closingPrice,
        outcome,
      })
      .eq("id", market.id);

    // Get all unsettled positions for this market
    const { data: positions } = await db
      .from("positions")
      .select("*, profile:profiles(*)")
      .eq("market_id", market.id)
      .eq("settled", false);

    if (!positions || positions.length === 0) {
      settled.push(`${inst.symbol} @${market.strike_price} → ${outcome} (no positions)`);
      continue;
    }

    for (const pos of positions) {
      const payout = calculateSettlement(
        pos.amount,
        pos.side,
        outcome,
        market.yes_pool,
        market.no_pool
      );

      const profile = Array.isArray(pos.profile)
        ? pos.profile[0]
        : pos.profile;
      if (!profile) continue;

      const profit = payout - pos.amount;
      const isWin = payout > 0;

      // Update position
      await db
        .from("positions")
        .update({ settled: true, payout })
        .eq("id", pos.id);

      // Update user balance and stats
      await db
        .from("profiles")
        .update({
          chips_balance: profile.chips_balance + payout,
          total_profit: profile.total_profit + profit,
          total_trades: profile.total_trades + 1,
          wins: isWin ? profile.wins + 1 : profile.wins,
          losses: !isWin ? profile.losses + 1 : profile.losses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      // Record payout transaction
      if (payout > 0) {
        await db.from("transactions").insert({
          user_id: profile.id,
          market_id: market.id,
          type: "payout",
          side: pos.side,
          amount: payout,
          balance_after: profile.chips_balance + payout,
        });
      }
    }

    settled.push(`${inst.symbol} @${market.strike_price} → ${outcome} (${positions.length} positions)`);
  }

  return NextResponse.json({ settled, errors, settledCount: settled.length });
}
