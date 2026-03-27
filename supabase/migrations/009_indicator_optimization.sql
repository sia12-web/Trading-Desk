-- Indicator optimization results storage
CREATE TABLE IF NOT EXISTS indicator_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pair VARCHAR(10) NOT NULL,
  timeframe VARCHAR(5) NOT NULL,
  indicator VARCHAR(30) NOT NULL,
  
  -- Best consistent setting
  optimized_params JSONB NOT NULL,
  consistency_score DECIMAL(6,3),
  periods_positive INTEGER,
  total_periods INTEGER,
  win_rate DECIMAL(5,2),
  profit_factor DECIMAL(6,3),
  total_trades INTEGER,
  
  -- Default comparison
  default_params JSONB NOT NULL,
  default_win_rate DECIMAL(5,2),
  default_profit_factor DECIMAL(6,3),
  improvement_percent DECIMAL(5,2),
  
  -- Recommendation
  recommendation VARCHAR(20) NOT NULL,
  reasoning TEXT,
  
  optimized_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

ALTER TABLE indicator_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own optimizations"
  ON indicator_optimizations
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_indicator_opt_user_pair
  ON indicator_optimizations(user_id, pair, indicator);
