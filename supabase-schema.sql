-- FutureMarket Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tlqaxggsjcggmvgvhoqm/sql

-- 1. Instruments table
CREATE TABLE instruments (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crypto', 'futures')),
  icon TEXT DEFAULT '📈',
  close_hour INTEGER NOT NULL DEFAULT 0,
  close_minute INTEGER NOT NULL DEFAULT 0,
  cutoff_minutes INTEGER NOT NULL DEFAULT 120,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles table (linked to Clerk users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  chips_balance BIGINT NOT NULL DEFAULT 100000,
  total_profit BIGINT NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Markets table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id INTEGER NOT NULL REFERENCES instruments(id),
  title TEXT NOT NULL,
  description TEXT,
  strike_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'settled')),
  market_date DATE NOT NULL,
  close_time TIMESTAMPTZ NOT NULL,
  cutoff_time TIMESTAMPTZ NOT NULL,
  closing_price NUMERIC,
  outcome TEXT CHECK (outcome IN ('yes', 'no')),
  yes_pool NUMERIC NOT NULL DEFAULT 0,
  no_pool NUMERIC NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(instrument_id, market_date, strike_price)
);

-- 4. Positions table
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  side TEXT NOT NULL CHECK (side IN ('yes', 'no')),
  amount NUMERIC NOT NULL,
  potential_payout NUMERIC NOT NULL DEFAULT 0,
  settled BOOLEAN NOT NULL DEFAULT false,
  payout NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  type TEXT NOT NULL CHECK (type IN ('bet', 'payout', 'refund')),
  side TEXT CHECK (side IN ('yes', 'no')),
  amount NUMERIC NOT NULL,
  balance_after BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_date ON markets(market_date);
CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_market ON positions(market_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_profiles_clerk ON profiles(clerk_id);

-- Seed instruments
INSERT INTO instruments (symbol, name, type, icon, close_hour, close_minute, cutoff_minutes) VALUES
  ('BTC', 'Bitcoin', 'crypto', '₿', 0, 0, 120),
  ('ETH', 'Ethereum', 'crypto', 'Ξ', 0, 0, 120),
  ('NQ', 'Nasdaq 100 Futures', 'futures', '📊', 21, 0, 120),
  ('ES', 'S&P 500 Futures', 'futures', '📈', 21, 0, 120);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read markets" ON markets FOR SELECT USING (true);
CREATE POLICY "Service insert markets" ON markets FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update markets" ON markets FOR UPDATE USING (true);

CREATE POLICY "Public read positions" ON positions FOR SELECT USING (true);
CREATE POLICY "Allow insert positions" ON positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update positions" ON positions FOR UPDATE USING (true);

CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow insert transactions" ON transactions FOR INSERT WITH CHECK (true);
