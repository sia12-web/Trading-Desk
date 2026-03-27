-- Add source column to trades (app = placed via Trade Desk, external = synced from OANDA/TradingView)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'app';

-- Expand execution_log action constraint to support sync actions
ALTER TABLE execution_log DROP CONSTRAINT IF EXISTS execution_log_action_check;
ALTER TABLE execution_log ADD CONSTRAINT execution_log_action_check
  CHECK (action IN ('place_order', 'modify_trade', 'close_trade', 'cancel_order', 'sync_import', 'sync_close'));

-- Track sync history per user
CREATE TABLE IF NOT EXISTS trade_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  open_imported INTEGER DEFAULT 0,
  closed_imported INTEGER DEFAULT 0,
  closed_updated INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'
);

ALTER TABLE trade_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own sync logs" ON trade_sync_log FOR ALL USING (auth.uid() = user_id);
