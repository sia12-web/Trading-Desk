-- Auto-analysis columns for wave_analysis table
-- Supports the autonomous AI trading brain feature

ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS analysis_type VARCHAR(10) DEFAULT 'manual';
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS data_payload JSONB;
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS strategy_config JSONB;

-- Index for quick lookup of auto analyses
CREATE INDEX IF NOT EXISTS idx_wave_analysis_type ON wave_analysis(user_id, analysis_type, created_at DESC);
