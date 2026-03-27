-- Fix foreign key constraints to properly handle trade deletion
-- This prevents the "23503" foreign key violation error when deleting trades

-- 1. execution_log: Delete execution logs when trade is deleted
ALTER TABLE execution_log
DROP CONSTRAINT IF EXISTS execution_log_trade_id_fkey,
ADD CONSTRAINT execution_log_trade_id_fkey
  FOREIGN KEY (trade_id)
  REFERENCES trades(id)
  ON DELETE CASCADE;

-- 2. ai_coaching_sessions: Delete coaching sessions when trade is deleted
ALTER TABLE ai_coaching_sessions
DROP CONSTRAINT IF EXISTS ai_coaching_sessions_trade_id_fkey,
ADD CONSTRAINT ai_coaching_sessions_trade_id_fkey
  FOREIGN KEY (trade_id)
  REFERENCES trades(id)
  ON DELETE CASCADE;

-- 3. wave_analysis: Set trade_id to NULL when trade is deleted (can exist independently)
ALTER TABLE wave_analysis
DROP CONSTRAINT IF EXISTS wave_analysis_trade_id_fkey,
ADD CONSTRAINT wave_analysis_trade_id_fkey
  FOREIGN KEY (trade_id)
  REFERENCES trades(id)
  ON DELETE SET NULL;
