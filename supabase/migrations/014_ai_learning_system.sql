-- AI Learning System: Track AI predictions vs outcomes and learn from mistakes

-- Link sessions back to the AI analysis that recommended them
ALTER TABLE scalp_sessions ADD COLUMN IF NOT EXISTS source_analysis_id UUID REFERENCES wave_analysis(id);

-- Store AI self-reviews and learnings from session outcomes
CREATE TABLE IF NOT EXISTS ai_session_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES scalp_sessions(id) ON DELETE CASCADE NOT NULL,
    analysis_id UUID REFERENCES wave_analysis(id) ON DELETE CASCADE,

    -- Original prediction
    predicted_outcome TEXT,
    predicted_confidence INTEGER,
    recommended_strategy VARCHAR(20),

    -- Actual outcome
    total_pnl_percent DECIMAL(6,3) NOT NULL,
    win_rate DECIMAL(5,2),
    total_trades INTEGER,
    session_duration_minutes INTEGER,
    stop_reason VARCHAR(50),

    -- AI review and learning
    review_result JSONB NOT NULL,  -- Full AI analysis of what happened
    accuracy_assessment VARCHAR(20),  -- 'correct' | 'partially_correct' | 'incorrect'
    root_cause TEXT,  -- Why it succeeded/failed
    learning TEXT NOT NULL,  -- Key takeaway rule for future
    confidence_adjustment INTEGER DEFAULT 0,  -- +/- for similar setups

    reviewed_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_confidence_adjustment CHECK (confidence_adjustment >= -50 AND confidence_adjustment <= 50)
);

-- RLS policies
ALTER TABLE ai_session_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own session reviews"
    ON ai_session_reviews
    FOR ALL
    USING (auth.uid() = user_id);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_session_reviews_user_pair
    ON ai_session_reviews(user_id, reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_reviews_analysis
    ON ai_session_reviews(analysis_id);

-- View for AI learning context (recent learnings to load in prompts)
CREATE OR REPLACE VIEW ai_recent_learnings AS
SELECT
    asr.user_id,
    wa.pair,
    asr.recommended_strategy,
    asr.accuracy_assessment,
    asr.learning,
    asr.confidence_adjustment,
    asr.total_pnl_percent,
    asr.reviewed_at
FROM ai_session_reviews asr
JOIN wave_analysis wa ON wa.id = asr.analysis_id
WHERE asr.reviewed_at >= NOW() - INTERVAL '30 days'
ORDER BY asr.reviewed_at DESC;

-- Grant access to view
GRANT SELECT ON ai_recent_learnings TO authenticated;
