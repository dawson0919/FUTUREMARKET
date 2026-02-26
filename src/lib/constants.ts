export const INITIAL_CHIPS = 100000;
export const CUTOFF_MINUTES = 120; // 2 hours before close

export const INSTRUMENTS = [
  { symbol: "BTC", name: "Bitcoin", type: "crypto" as const, icon: "₿", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" as const, icon: "Ξ", color: "#627EEA" },
  { symbol: "PAXG", name: "Pax Gold", type: "crypto" as const, icon: "Au", color: "#D4AF37" },
  { symbol: "NQ", name: "Nasdaq 100", type: "futures" as const, icon: "📊", color: "#00C853" },
  { symbol: "ES", name: "S&P 500", type: "futures" as const, icon: "📈", color: "#2196F3" },
] as const;

export const INSTRUMENT_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  PAXG: "#D4AF37",
  NQ: "#00C853",
  ES: "#2196F3",
};

export function formatChips(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export function formatPrice(price: number, symbol: string): string {
  if (symbol === "BTC" || symbol === "ETH" || symbol === "PAXG") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
