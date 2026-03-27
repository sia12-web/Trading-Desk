-- Extend strategy_signals table for signal-based manual trading
-- Adds status tracking, signal data, expiry, and Telegram notification tracking

ALTER TABLE strategy_signals
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'executed', 'dismissed', 'expired')),
ADD COLUMN IF NOT EXISTS signal_data JSONB,
ADD COLUMN IF NOT EXISTS expiry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS telegram_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS entry_price DECIMAL(12,5),
ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(12,5),
ADD COLUMN IF NOT EXISTS take_profit DECIMAL(12,5),
ADD COLUMN IF NOT EXISTS timeframe VARCHAR(10);

-- Add index for active signal queries
CREATE INDEX IF NOT EXISTS idx_strategy_signals_status ON strategy_signals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_signals_user_status ON strategy_signals(user_id, status);

-- Add strategy_engines table to track which strategies have signal generation enabled
CREATE TABLE IF NOT EXISTS strategy_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strategy_id VARCHAR(50) NOT NULL,
  instrument VARCHAR(10) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,

  -- Engine status
  is_active BOOLEAN DEFAULT FALSE,

  -- Configuration from optimizer
  indicator_params JSONB NOT NULL,

  -- Metadata
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  last_check_at TIMESTAMPTZ,
  signals_generated INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one engine per user/strategy/instrument/timeframe
  UNIQUE(user_id, strategy_id, instrument, timeframe)
);

ALTER TABLE strategy_engines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own strategy engines" ON strategy_engines FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_strategy_engines_active ON strategy_engines(user_id, is_active);
CREATE INDEX idx_strategy_engines_user_strategy ON strategy_engines(user_id, strategy_id);

-- Add telegram_chat_id to trader_profile
ALTER TABLE trader_profile
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

COMMENT ON COLUMN trader_profile.telegram_chat_id IS 'Telegram chat ID for receiving trading signals and notifications';
