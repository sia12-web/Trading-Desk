-- Migration 019: Add Missing Columns and Tables
-- Fixes orphan tables and missing columns identified in database audit
-- SAFE: Can run even if migration 018 hasn't been applied yet

-- ============================================
-- PART 1: Add Missing Timeframe Columns to wave_analysis
-- ============================================

-- Add Daily timeframe columns
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS daily_screenshot_path TEXT;
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS daily_wave_count JSONB;

-- Add 4-Hour timeframe columns
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS h4_screenshot_path TEXT;
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS h4_wave_count JSONB;

-- Add 1-Minute timeframe columns
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS m1_screenshot_path TEXT;
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS m1_wave_count JSONB;

COMMENT ON COLUMN wave_analysis.daily_screenshot_path IS 'Storage path for Daily timeframe screenshot';
COMMENT ON COLUMN wave_analysis.daily_wave_count IS 'Elliott Wave count for Daily timeframe';
COMMENT ON COLUMN wave_analysis.h4_screenshot_path IS 'Storage path for 4-Hour timeframe screenshot';
COMMENT ON COLUMN wave_analysis.h4_wave_count IS 'Elliott Wave count for 4-Hour timeframe';
COMMENT ON COLUMN wave_analysis.m1_screenshot_path IS 'Storage path for 1-Minute timeframe screenshot';
COMMENT ON COLUMN wave_analysis.m1_wave_count IS 'Elliott Wave count for 1-Minute timeframe';

-- ============================================
-- PART 2: Create technical_analyses Table
-- ============================================

CREATE TABLE IF NOT EXISTS technical_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Analysis metadata
    pair VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    analysis_type VARCHAR(20) NOT NULL CHECK (analysis_type IN ('macd', 'volume', 'pivot', 'institutional')),

    -- Analysis content
    structured_data JSONB NOT NULL,
    narrative TEXT NOT NULL,
    full_text TEXT NOT NULL,
    screenshot_base64 TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (without oanda_account_id for now)
CREATE INDEX IF NOT EXISTS idx_technical_analyses_user_pair ON technical_analyses(user_id, pair, analysis_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_technical_analyses_type ON technical_analyses(analysis_type, created_at DESC);

-- Enable RLS
ALTER TABLE technical_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own technical analyses" ON technical_analyses;
CREATE POLICY "Users can view own technical analyses" ON technical_analyses
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own technical analyses" ON technical_analyses;
CREATE POLICY "Users can insert own technical analyses" ON technical_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own technical analyses" ON technical_analyses;
CREATE POLICY "Users can update own technical analyses" ON technical_analyses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own technical analyses" ON technical_analyses;
CREATE POLICY "Users can delete own technical analyses" ON technical_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_technical_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_technical_analyses_updated_at ON technical_analyses;
CREATE TRIGGER trigger_update_technical_analyses_updated_at
    BEFORE UPDATE ON technical_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_technical_analyses_updated_at();

COMMENT ON TABLE technical_analyses IS 'Technical analysis results (MACD, Volume, Pivot, Institutional)';
COMMENT ON COLUMN technical_analyses.analysis_type IS 'Type of technical analysis: macd, volume, pivot, or institutional';
COMMENT ON COLUMN technical_analyses.structured_data IS 'JSON object with indicator values and signals';
COMMENT ON COLUMN technical_analyses.narrative IS 'AI-generated narrative summary of the analysis';
COMMENT ON COLUMN technical_analyses.full_text IS 'Complete analysis text including all details';



-- ============================================
-- PART 4: Add oanda_account_id to technical_analyses (if migration 018 was run)
-- ============================================

-- This section is safe even if migration 018 hasn't been run yet
DO $$
BEGIN
    -- Only add the column if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'technical_analyses'
        AND column_name = 'oanda_account_id'
    ) THEN
        ALTER TABLE technical_analyses ADD COLUMN oanda_account_id VARCHAR(50);

        -- Add index for account-based filtering
        CREATE INDEX IF NOT EXISTS idx_technical_analyses_account
            ON technical_analyses(user_id, oanda_account_id, pair, created_at DESC);

        RAISE NOTICE 'Added oanda_account_id to technical_analyses';
    ELSE
        RAISE NOTICE 'oanda_account_id already exists on technical_analyses';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify wave_analysis columns added
DO $$
DECLARE
    missing_cols TEXT[];
BEGIN
    SELECT ARRAY_AGG(col)
    INTO missing_cols
    FROM (
        SELECT unnest(ARRAY[
            'daily_screenshot_path', 'daily_wave_count',
            'h4_screenshot_path', 'h4_wave_count',
            'm1_screenshot_path', 'm1_wave_count'
        ]) AS col
    ) expected
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'wave_analysis'
        AND column_name = expected.col
    );

    IF missing_cols IS NOT NULL THEN
        RAISE WARNING 'Missing wave_analysis columns: %', array_to_string(missing_cols, ', ');
    ELSE
        RAISE NOTICE '✅ All wave_analysis columns present';
    END IF;
END $$;

-- Verify technical_analyses table created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'technical_analyses'
    ) THEN
        RAISE NOTICE '✅ technical_analyses table exists';
    ELSE
        RAISE WARNING '❌ technical_analyses table NOT created';
    END IF;
END $$;


