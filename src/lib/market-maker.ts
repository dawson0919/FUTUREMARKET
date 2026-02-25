// CPMM-style market maker (Polymarket model)
// Yes¢ + No¢ = 100¢
// Price in cents = implied probability

/**
 * Calculate Yes/No prices in cents. Yes¢ + No¢ = 100¢
 */
export function calculatePrices(yesPool: number, noPool: number): {
  yesCents: number;
  noCents: number;
  yesPercent: number;
  noPercent: number;
} {
  const total = yesPool + noPool;
  if (total === 0) {
    return { yesCents: 50, noCents: 50, yesPercent: 50, noPercent: 50 };
  }

  const yesCents = Math.max(0.1, Math.min(99.9, +((yesPool / total) * 100).toFixed(1)));
  const noCents = Math.max(0.1, Math.min(99.9, +((noPool / total) * 100).toFixed(1)));
  const yesPercent = Math.round(yesCents);
  const noPercent = 100 - yesPercent;

  return { yesCents, noCents, yesPercent, noPercent };
}

export function calculateOdds(yesPool: number, noPool: number) {
  const { yesPercent, noPercent } = calculatePrices(yesPool, noPool);
  return { yesPercent, noPercent };
}

export function formatCents(cents: number): string {
  if (cents < 1) return `${cents.toFixed(1)}¢`;
  if (cents >= 99.5) return `${cents.toFixed(1)}¢`;
  if (Number.isInteger(cents)) return `${cents}¢`;
  return `${cents.toFixed(1)}¢`;
}

export function calculatePotentialPayout(
  betAmount: number,
  side: "yes" | "no",
  yesPool: number,
  noPool: number
): number {
  const totalPool = yesPool + noPool + betAmount;
  const sidePool = side === "yes" ? yesPool + betAmount : noPool + betAmount;
  if (sidePool === 0) return 0;
  const shareRatio = betAmount / sidePool;
  return Math.floor(shareRatio * totalPool);
}

export function calculateSettlement(
  betAmount: number,
  side: "yes" | "no",
  outcome: "yes" | "no",
  yesPool: number,
  noPool: number
): number {
  if (side !== outcome) return 0;
  const totalPool = yesPool + noPool;
  const winningPool = outcome === "yes" ? yesPool : noPool;
  if (winningPool === 0) return 0;
  const shareRatio = betAmount / winningPool;
  return Math.floor(shareRatio * totalPool);
}

export function isMarketBettable(cutoffTime: string): boolean {
  return new Date(cutoffTime) > new Date();
}

export function getTimeRemaining(targetTime: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
} {
  const diff = new Date(targetTime).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff,
    expired: false,
  };
}
