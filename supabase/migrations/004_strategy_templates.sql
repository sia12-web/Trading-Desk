-- Strategy templates the user defines and reuses
CREATE TABLE strategy_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(100) NOT NULL, -- e.g., "Pivot Rejection", "Breakout Retest"
  description TEXT,
  checklist_items JSONB NOT NULL DEFAULT '[]',
  -- Array of: { "id": "uuid", "label": "SMA 200 Position", "category": "indicator" }
  -- Categories: "trend", "indicator", "level", "pattern", "confirmation"
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE strategy_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own templates" ON strategy_templates FOR ALL USING (auth.uid() = user_id);

-- Add template reference and structured data to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy_template_id UUID REFERENCES strategy_templates(id);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS voice_transcript TEXT;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS parsed_strategy JSONB;
