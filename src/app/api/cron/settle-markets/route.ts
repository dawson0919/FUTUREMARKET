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

    // Aggregate updates per user to avoid stale-data race condition
    const userUpdates = new Map<string, {
      totalPayout: number;
      totalProfit: number;
      trades: number;
      wins: number;
      losses: number;
      payoutTxns: { side: string; amount: number }[];
    }>();

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

      // Aggregate per user
      const existing = userUpdates.get(profile.id);
      if (existing) {
        existing.totalPayout += payout;
        existing.totalProfit += profit;
        existing.trades += 1;
        existing.wins += isWin ? 1 : 0;
        existing.losses += !isWin ? 1 : 0;
        if (payout > 0) {
          existing.payoutTxns.push({ side: pos.side, amount: payout });
        }
      } else {
        userUpdates.set(profile.id, {
          totalPayout: payout,
          totalProfit: profit,
          trades: 1,
          wins: isWin ? 1 : 0,
          losses: !isWin ? 1 : 0,
          payoutTxns: payout > 0 ? [{ side: pos.side, amount: payout }] : [],
        });
      }
    }

    // Apply aggregated updates per user (one DB call per user per market)
    for (const [userId, agg] of userUpdates) {
      // Re-fetch fresh profile to avoid stale-data overwrites
      const { data: freshProfile } = await db
        .from("profiles")
        .select("chips_balance, total_profit, total_trades, wins, losses")
        .eq("id", userId)
        .single();

      if (!freshProfile) continue;

      await db
        .from("profiles")
        .update({
          chips_balance: freshProfile.chips_balance + agg.totalPayout,
          total_profit: freshProfile.total_profit + agg.totalProfit,
          total_trades: freshProfile.total_trades + agg.trades,
          wins: freshProfile.wins + agg.wins,
          losses: freshProfile.losses + agg.losses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Record payout transactions
      for (const txn of agg.payoutTxns) {
        await db.from("transactions").insert({
          user_id: userId,
          market_id: market.id,
          type: "payout",
          side: txn.side,
          amount: txn.amount,
          balance_after: freshProfile.chips_balance + agg.totalPayout,
        });
      }
    }

    settled.push(`${inst.symbol} @${market.strike_price} → ${outcome} (${positions.length} positions)`);
  }

  return NextResponse.json({ settled, errors, settledCount: settled.length });
}
