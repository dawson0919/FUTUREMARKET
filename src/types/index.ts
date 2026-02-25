export interface Instrument {
  id: number;
  symbol: string;
  name: string;
  type: "crypto" | "futures";
  icon: string;
  close_hour: number;
  close_minute: number;
  cutoff_minutes: number;
  active: boolean;
}

export interface Profile {
  id: string;
  clerk_id: string;
  username: string | null;
  avatar_url: string | null;
  chips_balance: number;
  total_profit: number;
  total_trades: number;
  wins: number;
  losses: number;
  created_at: string;
}

export interface Market {
  id: string;
  instrument_id: number;
  title: string;
  description: string | null;
  strike_price: number;
  status: "open" | "closed" | "settled";
  market_date: string;
  close_time: string;
  cutoff_time: string;
  closing_price: number | null;
  outcome: "yes" | "no" | null;
  yes_pool: number;
  no_pool: number;
  total_volume: number;
  participant_count: number;
  created_at: string;
  instrument?: Instrument;
}

export interface Position {
  id: string;
  user_id: string;
  market_id: string;
  side: "yes" | "no";
  amount: number;
  potential_payout: number;
  settled: boolean;
  payout: number | null;
  created_at: string;
  market?: Market;
}

export interface Transaction {
  id: string;
  user_id: string;
  market_id: string;
  type: "bet" | "payout" | "refund";
  side: "yes" | "no" | null;
  amount: number;
  balance_after: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string | null;
  avatar_url: string | null;
  chips_balance: number;
  total_profit: number;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent: number;
  timestamp: number;
}
