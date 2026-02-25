-- Migration: Allow multiple strike prices per instrument per day
-- Run this in Supabase SQL Editor

-- Drop old unique constraint (one market per instrument per day)
ALTER TABLE markets DROP CONSTRAINT IF EXISTS markets_instrument_id_market_date_key;

-- Add new unique constraint (one market per instrument per day per strike price)
ALTER TABLE markets ADD CONSTRAINT markets_instrument_id_market_date_strike_price_key
  UNIQUE(instrument_id, market_date, strike_price);
