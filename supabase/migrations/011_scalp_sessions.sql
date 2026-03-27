-- Rapid Fire Scalping Sessions
-- Stores full session state for client-driven polling architecture.
-- Each tick reads/writes a single row.

CREATE TABLE scalp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Config (set at session creation, immutable during session)
  instrument VARCHAR(10) NOT NULL,
  sar_params JSONB NOT NULL DEFAULT '{"afStart": 0.02, "afStep": 0.02, "afMax": 0.20}'::JSONB,
  risk_per_scalp DECIMAL(4,2) NOT NULL DEFAULT 0.5,
  session_loss_limit DECIMAL(4,2) NOT NULL DEFAULT 1.5,
  max_trades INTEGER NOT NULL DEFAULT 10,
  max_hold_minutes INTEGER NOT NULL DEFAULT 15,
  starting_balance DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Live state (updated every tick)
  status VARCHAR(15) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'paused', 'stopped', 'completed')),
  trend_direction VARCHAR(5),
  trend_score INTEGER,
  adx_value DECIMAL(6,2),
  current_sar DECIMAL(12,5),

  -- Active trade tracking
  active_oanda_trade_id VARCHAR(50),
  active_trade_direction VARCHAR(5),
  active_trade_entry DECIMAL(12,5),
  active_trade_sl DECIMAL(12,5),
  active_trade_units INTEGER,
  active_trade_opened_at TIMESTAMPTZ,

  -- Session counters
  trades_taken INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  session_pnl DECIMAL(12,2) NOT NULL DEFAULT 0,
  session_pnl_pips DECIMAL(8,1) NOT NULL DEFAULT 0,
  consecutive_errors INTEGER NOT NULL DEFAULT 0,

  -- Trade log (array of completed scalps, max ~10)
  trade_log JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Timing
  last_trend_check_at TIMESTAMPTZ,
  last_tick_at TIMESTAMPTZ,
  stop_reason TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scalp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own scalp sessions"
  ON scalp_sessions FOR ALL USING (auth.uid() = user_id);

-- Index for finding active sessions quickly
CREATE INDEX idx_scalp_sessions_active
  ON scalp_sessions(user_id, status)
  WHERE status IN ('pending', 'running', 'paused');
