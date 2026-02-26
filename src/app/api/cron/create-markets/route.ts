import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getAllPrices } from "@/lib/prices";

// Sentinel strike_price for up/down markets (will never collide with real strikes)
const UPDOWN_STRIKE = 0.01;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "futuremarket-cron-2024";
  if (authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getServiceSupabase();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const { data: instruments } = await db
    .from("instruments")
    .select("*")
    .eq("active", true);

  if (!instruments || instruments.length === 0) {
    return NextResponse.json({ error: "No instruments found" }, { status: 404 });
  }

  const prices = await getAllPrices();

  const created: Record<string, number[]> = {};
  const createdUpdown: string[] = [];
  const skipped: string[] = [];

  for (const inst of instruments) {
    // Weekend: only crypto markets
    if (isWeekend && inst.type === "futures") {
      skipped.push(`${inst.symbol} (weekend)`);
      continue;
    }

    const priceData = prices[inst.symbol];
    if (!priceData) {
      skipped.push(inst.symbol);
      continue;
    }

    // Calculate close/cutoff times
    const closeTime = new Date();
    closeTime.setUTCHours(inst.close_hour, inst.close_minute, 0, 0);
    if (closeTime <= new Date()) {
      closeTime.setDate(closeTime.getDate() + 1);
    }
    const cutoffTime = new Date(closeTime.getTime() - inst.cutoff_minutes * 60 * 1000);

    // === 1. Create Up/Down market ===
    const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日`;
    const updownMarket = {
      instrument_id: inst.id,
      title: `${inst.symbol} 今日漲還是跌？`,
      description: `type:updown|ref:${priceData.price}|${inst.name} ${dateLabel} 漲跌預測`,
      strike_price: UPDOWN_STRIKE,
      status: "open" as const,
      market_date: today,
      close_time: closeTime.toISOString(),
      cutoff_time: cutoffTime.toISOString(),
    };

    const { error: updownError } = await db.from("markets").upsert([updownMarket], {
      onConflict: "instrument_id,market_date,strike_price",
      ignoreDuplicates: true,
    });

    if (!updownError) {
      createdUpdown.push(inst.symbol);
    }

    // === 2. Create strike price level markets with fair initial odds ===
    const strikePrices = generateStrikeLevels(priceData.price, inst.symbol);
    const config = STRIKE_CONFIG[inst.symbol] || { step: 100, count: 5 };
    const basePrice = roundToStep(priceData.price, config.step);

    const marketsToInsert = strikePrices.map((strike) => {
      // Calculate initial probability based on distance from current price
      // Steps above current → lower yes probability, steps below → higher
      const stepsFromCenter = (strike - basePrice) / config.step;
      const yesProb = Math.max(0.05, Math.min(0.95, 0.5 - stepsFromCenter * 0.09));
      const SEED = 10000;

      return {
        instrument_id: inst.id,
        title: `${inst.symbol} 收盤價高於 ${formatStrikePrice(strike, inst.symbol)}？`,
        description: `預測 ${inst.name} 是否會在收盤時高於 ${formatStrikePrice(strike, inst.symbol)}`,
        strike_price: strike,
        yes_pool: Math.round(SEED * yesProb),
        no_pool: Math.round(SEED * (1 - yesProb)),
        status: "open" as const,
        market_date: today,
        close_time: closeTime.toISOString(),
        cutoff_time: cutoffTime.toISOString(),
      };
    });

    const { error } = await db.from("markets").upsert(marketsToInsert, {
      onConflict: "instrument_id,market_date,strike_price",
      ignoreDuplicates: true,
    });

    if (!error) {
      created[inst.symbol] = strikePrices;
    }
  }

  return NextResponse.json({ created, createdUpdown, skipped, date: today, isWeekend });
}

function generateStrikeLevels(currentPrice: number, symbol: string): number[] {
  const config = STRIKE_CONFIG[symbol] || { step: 100, count: 5 };
  const basePrice = roundToStep(currentPrice, config.step);
  const levels: number[] = [];

  for (let i = -config.count; i <= config.count; i++) {
    const level = basePrice + i * config.step;
    if (level > 0) levels.push(level);
  }

  return levels;
}

const STRIKE_CONFIG: Record<string, { step: number; count: number }> = {
  BTC: { step: 2000, count: 5 },
  ETH: { step: 50, count: 5 },
  PAXG: { step: 50, count: 5 },
  NQ: { step: 200, count: 5 },
  ES: { step: 50, count: 5 },
};

function roundToStep(price: number, step: number): number {
  return Math.round(price / step) * step;
}

function formatStrikePrice(price: number, symbol: string): string {
  if (["BTC", "ETH", "PAXG"].includes(symbol)) {
    return `$${price.toLocaleString()}`;
  }
  return price.toLocaleString();
}
