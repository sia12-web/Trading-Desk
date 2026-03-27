-- Big to Small: Macro-to-Execution Analysis Framework
-- Stores top-down analysis results with highlighted zones and time projections

CREATE TABLE IF NOT EXISTS big_picture_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    oanda_account_id TEXT,
    pair TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('elliott', 'price_action')),
    current_price NUMERIC,
    analysis_result JSONB NOT NULL,
    highlighted_zones JSONB DEFAULT '[]'::jsonb,
    macro_verdict TEXT NOT NULL CHECK (macro_verdict IN ('bullish', 'bearish', 'neutral')),
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    monthly_screenshot_base64 TEXT,
    weekly_screenshot_base64 TEXT,
    daily_screenshot_base64 TEXT,
    h4_screenshot_base64 TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user and pair
CREATE INDEX IF NOT EXISTS idx_big_picture_user_pair ON big_picture_analysis(user_id, pair);
CREATE INDEX IF NOT EXISTS idx_big_picture_created ON big_picture_analysis(created_at DESC);

-- Enable RLS
ALTER TABLE big_picture_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own big picture analyses"
    ON big_picture_analysis FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own big picture analyses"
    ON big_picture_analysis FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own big picture analyses"
    ON big_picture_analysis FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own big picture analyses"
    ON big_picture_analysis FOR DELETE
    USING (auth.uid() = user_id);
