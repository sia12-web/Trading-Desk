DROP TABLE IF EXISTS wave_analysis CASCADE;

CREATE TABLE wave_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  
  pair VARCHAR(10) NOT NULL,
  
  -- Monthly analysis
  monthly_screenshot_path TEXT,
  monthly_wave_count JSONB,
  
  -- Weekly analysis  
  weekly_screenshot_path TEXT,
  weekly_wave_count JSONB,
  
  -- Full analysis result from Manouk
  analysis_result JSONB NOT NULL,
  
  -- Trade setup
  trade_setup JSONB,
  
  -- TradingView drawing instructions
  drawing_instructions JSONB,
  
  is_valid BOOLEAN NOT NULL,
  confidence VARCHAR(10),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wave_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own wave analysis" ON wave_analysis FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_wave_analysis_user_pair ON wave_analysis(user_id, pair);
CREATE INDEX idx_wave_analysis_created_at ON wave_analysis(created_at DESC);
