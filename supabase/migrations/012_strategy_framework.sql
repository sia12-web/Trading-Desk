-- Unified Strategy Framework Support
-- Stores candle analysis results and connects strategies to analysis

CREATE TABLE candle_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  instrument VARCHAR(10) NOT NULL,
  timeframe VARCHAR(10),
  
  -- Structured analysis from Manouk
  analysis_result JSONB NOT NULL,
  
  -- Metadata
  screenshot_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE candle_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own candle analysis" ON candle_analysis FOR ALL USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_candle_analysis_user_instrument ON candle_analysis(user_id, instrument);
CREATE INDEX idx_candle_analysis_created_at ON candle_analysis(created_at DESC);
