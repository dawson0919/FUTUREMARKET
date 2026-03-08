-- Competition champions table: records the winner of each competition
CREATE TABLE IF NOT EXISTS competition_champions (
  id SERIAL PRIMARY KEY,
  edition INTEGER NOT NULL UNIQUE,          -- 1, 2, 3...
  title TEXT NOT NULL,                      -- e.g. "第一屆 刀神的海期教室"
  prize TEXT NOT NULL,                      -- e.g. "1,000 USDT"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  champion_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  champion_username TEXT,
  champion_avatar_url TEXT,
  final_chips BIGINT NOT NULL,              -- chips_balance at competition end
  total_trades INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  settled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
