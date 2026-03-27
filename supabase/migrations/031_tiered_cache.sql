-- Tiered Analysis Cache for Multi-Day Efficiency
-- Monthly/Weekly: 7 days cache
-- Daily: 24 hours cache
-- H4/H1: No cache (always fresh)

CREATE TABLE IF NOT EXISTS structural_analysis_cache_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  timeframe_group TEXT NOT NULL CHECK (timeframe_group IN ('m_w', 'd', 'h4_h1')),

  -- Cached structural data from Gemini/DeepSeek
  structural_data JSONB NOT NULL,

  -- Cache metadata
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cache_source TEXT NOT NULL DEFAULT 'tri_model_v2', -- which pipeline generated this

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one cache entry per user+pair+TF group
  UNIQUE(user_id, pair, timeframe_group)
);

-- Index for fast lookups
CREATE INDEX idx_structural_cache_v2_lookup
  ON structural_analysis_cache_v2(user_id, pair, timeframe_group);

-- Index for expiry cleanup
CREATE INDEX idx_structural_cache_v2_expiry
  ON structural_analysis_cache_v2(expires_at);

-- RLS policies
ALTER TABLE structural_analysis_cache_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cache"
  ON structural_analysis_cache_v2
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cache"
  ON structural_analysis_cache_v2
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cache"
  ON structural_analysis_cache_v2
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cache"
  ON structural_analysis_cache_v2
  FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_structural_cache_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_structural_cache_v2_timestamp
  BEFORE UPDATE ON structural_analysis_cache_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_structural_cache_v2_updated_at();

-- Cleanup function for expired cache entries (call from cron)
CREATE OR REPLACE FUNCTION cleanup_expired_structural_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM structural_analysis_cache_v2
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add column to wave_analysis to track which cache was used
ALTER TABLE wave_analysis
  ADD COLUMN IF NOT EXISTS cache_metadata JSONB DEFAULT NULL;

COMMENT ON TABLE structural_analysis_cache_v2 IS 'Tiered cache for structural analysis - M/W cached 7 days, D cached 24h, H4/H1 never cached';
COMMENT ON COLUMN structural_analysis_cache_v2.timeframe_group IS 'm_w (Monthly+Weekly), d (Daily), h4_h1 (4H+1H - not typically cached)';
COMMENT ON COLUMN structural_analysis_cache_v2.structural_data IS 'Contains Gemini structural map + DeepSeek phase 1 output for the timeframe group';
COMMENT ON COLUMN wave_analysis.cache_metadata IS 'Tracks which TF groups were from cache vs fresh analysis';
