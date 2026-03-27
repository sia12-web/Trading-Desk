-- RUN THIS IN SUPABASE SQL EDITOR TO RESOLVE SECURITY WARNING
-- This changes the ai_recent_learnings view from SECURITY DEFINER to SECURITY INVOKER

CREATE OR REPLACE VIEW ai_recent_learnings 
WITH (security_invoker = true)
AS
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

COMMENT ON VIEW ai_recent_learnings IS 'Recent AI learnings with security_invoker = true to respect RLS.';
