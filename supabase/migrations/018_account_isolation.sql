-- Account isolation: add oanda_account_id to all account-specific tables
-- so demo and live data are completely separated.

-- Core trade tables
ALTER TABLE trades ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);
ALTER TABLE execution_log ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);
ALTER TABLE trade_sync_log ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);

-- Analysis tables
ALTER TABLE indicator_optimizations ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);
ALTER TABLE wave_analysis ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);

-- AI coaching tables
ALTER TABLE ai_coaching_sessions ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);
ALTER TABLE coaching_memory ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);
ALTER TABLE behavioral_analysis ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);

-- Trader profile: change from one-per-user to one-per-account
ALTER TABLE trader_profile ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);
ALTER TABLE trader_profile DROP CONSTRAINT IF EXISTS trader_profile_user_id_key;
ALTER TABLE trader_profile ADD CONSTRAINT trader_profile_user_account_unique UNIQUE (user_id, oanda_account_id);

-- Scalp sessions
ALTER TABLE scalp_sessions ADD COLUMN IF NOT EXISTS oanda_account_id VARCHAR(50);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_trades_account ON trades (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_execution_log_account ON execution_log (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_indicator_optimizations_account ON indicator_optimizations (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_wave_analysis_account ON wave_analysis (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_account ON ai_coaching_sessions (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_coaching_memory_account ON coaching_memory (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_analysis_account ON behavioral_analysis (user_id, oanda_account_id);
CREATE INDEX IF NOT EXISTS idx_scalp_sessions_account ON scalp_sessions (user_id, oanda_account_id);
