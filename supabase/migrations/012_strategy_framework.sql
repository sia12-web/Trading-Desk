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

-- Add strategy_signals table for future use in scanner if we want to persist them
CREATE TABLE strategy_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  strategy_id VARCHAR(50) NOT NULL,
  instrument VARCHAR(10) NOT NULL,
  direction VARCHAR(5) NOT NULL,
  trigger_price DECIMAL(12,5) NOT NULL,
  trigger_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  confidence INTEGER,
  pipeline_alignment INTEGER,
  pipeline_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE strategy_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own strategy signals" ON strategy_signals FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_strategy_signals_user_instrument ON strategy_signals(user_id, instrument);
CREATE INDEX idx_strategy_signals_created_at ON strategy_signals(created_at DESC);
