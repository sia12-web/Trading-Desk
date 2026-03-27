-- Increase character limits for wave_analysis columns to prevent 'value too long for type character varying(10)' errors
-- The app explicitly saves 'unified_auto' (12 chars) or 'unified_manual' (14 chars) into analysis_type
ALTER TABLE "public"."wave_analysis" ALTER COLUMN "analysis_type" SET DATA TYPE character varying(50);

-- Provide buffer for confidence as well
ALTER TABLE "public"."wave_analysis" ALTER COLUMN "confidence" SET DATA TYPE character varying(50);

-- Temporarily drop the view that depends on 'pair', alter the column, and recreate the view
DROP VIEW IF EXISTS ai_recent_learnings;

ALTER TABLE "public"."wave_analysis" ALTER COLUMN "pair" SET DATA TYPE character varying(50);

CREATE VIEW ai_recent_learnings AS
 SELECT asr.user_id,
    wa.pair,
    asr.recommended_strategy,
    asr.accuracy_assessment,
    asr.learning,
    asr.confidence_adjustment,
    asr.total_pnl_percent,
    asr.reviewed_at
   FROM ai_session_reviews asr
     JOIN wave_analysis wa ON wa.id = asr.analysis_id
  WHERE asr.reviewed_at >= (now() - '30 days'::interval)
  ORDER BY asr.reviewed_at DESC;
