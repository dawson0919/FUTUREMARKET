import type { PriceData } from "@/types";

const CRYPTO_COM_API = "https://api.crypto.com/exchange/v1/public";
const BINANCE_API = "https://api.binance.com/api/v3";

interface CryptoComTicker {
  i: string; // instrument name
  h: string; // highest 24h
  l: string; // lowest 24h
  a: string; // last trade price
  v: string; // volume 24h
  c: string; // price change 24h
  t: number; // timestamp
}

const CRYPTO_INSTRUMENTS: Record<string, string> = {
  BTC: "BTC_USDT",
  ETH: "ETH_USDT",
};

// Binance symbols for tokens that use Binance as price source
const BINANCE_INSTRUMENTS: Record<string, string> = {
  PAXG: "PAXGUSDT",
};

export async function getCryptoPrice(symbol: string): Promise<PriceData | null> {
  try {
    const instrument = CRYPTO_INSTRUMENTS[symbol];
    if (!instrument) return null;

    const res = await fetch(
      `${CRYPTO_COM_API}/get-tickers?instrument_name=${instrument}`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json();

    if (data.result?.data?.[0]) {
      const ticker: CryptoComTicker = data.result.data[0];
      const price = parseFloat(ticker.a);
      const change = parseFloat(ticker.c);
      return {
        symbol,
        price,
        change24h: change,
        changePercent: price > 0 ? (change / (price - change)) * 100 : 0,
        timestamp: ticker.t,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getBinancePrice(symbol: string): Promise<PriceData | null> {
  try {
    const binanceSymbol = BINANCE_INSTRUMENTS[symbol];
    if (!binanceSymbol) return null;

    const res = await fetch(
      `${BINANCE_API}/ticker/24hr?symbol=${binanceSymbol}`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json();

    if (data.lastPrice) {
      const price = parseFloat(data.lastPrice);
      const change = parseFloat(data.priceChange);
      const changePercent = parseFloat(data.priceChangePercent);
      return {
        symbol,
        price,
        change24h: change,
        changePercent,
        timestamp: Date.now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getFuturesPrice(symbol: string): Promise<PriceData | null> {
  try {
    const yahooSymbol = symbol === "NQ" ? "NQ=F" : "ES=F";
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`,
      {
        next: { revalidate: 30 },
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );
    const data = await res.json();
    const result = data.chart?.result?.[0];

    if (result) {
      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose;
      const change = price - prevClose;
      return {
        symbol,
        price,
        change24h: change,
        changePercent: prevClose > 0 ? (change / prevClose) * 100 : 0,
        timestamp: Date.now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getPrice(symbol: string): Promise<PriceData | null> {
  if (BINANCE_INSTRUMENTS[symbol]) {
    return getBinancePrice(symbol);
  }
  if (CRYPTO_INSTRUMENTS[symbol]) {
    return getCryptoPrice(symbol);
  }
  return getFuturesPrice(symbol);
}

export async function getAllPrices(): Promise<Record<string, PriceData>> {
  const symbols = ["BTC", "ETH", "PAXG", "NQ", "ES"];
  const results = await Promise.allSettled(symbols.map((s) => getPrice(s)));
  const prices: Record<string, PriceData> = {};

  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      prices[symbols[i]] = r.value;
    }
  });

  return prices;
}
