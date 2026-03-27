-- Elliott Wave Analysis Support
-- Stores user-labeled wave counts and AI validation results

CREATE TABLE wave_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  trade_id UUID REFERENCES trades(id),  -- nullable: can exist independently

  pair VARCHAR(10) NOT NULL,
  timeframe VARCHAR(10) NOT NULL CHECK (timeframe IN ('monthly', 'weekly')),
  screenshot_path TEXT,  -- stored in Supabase Storage

  -- User's labeled wave count
  user_wave_label TEXT NOT NULL,  -- e.g., "I think we're in Wave 3 of a larger impulse from the 2022 low"

  -- Manouk's validation result
  validation_result JSONB,
  -- {
  --   "is_valid": true/false,
  --   "violated_rules": [{"rule": "name", "explanation": "why"}],
  --   "confirmed_guidelines": [{"guideline": "name", "observation": "what you see"}],
  --   "current_wave": "Wave 3 of impulse (if valid)",
  --   "wave_character": "impulse" | "correction",
  --   "trend_direction": "bullish" | "bearish",
  --   "trading_implication": "Brief: what this means for entries",
  --   "risk_context": "Brief: what to watch out for",
  --   "alternative_count": "Brief alternative interpretation or null",
  --   "confidence": "high" | "moderate" | "low",
  --   "narrative": "3-5 sentences explaining the validation"
  -- }

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE wave_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own wave analysis"
ON wave_analysis FOR ALL
USING (auth.uid() = user_id);

-- Index for faster lookups by user and pair
CREATE INDEX idx_wave_analysis_user_pair ON wave_analysis(user_id, pair);
CREATE INDEX idx_wave_analysis_created_at ON wave_analysis(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE wave_analysis IS 'Stores Elliott Wave counts labeled by traders and validated by AI';
