-- 025: Add telegram_chat_id to trader_profile
-- Migration logic for legacy strategy_signals and strategy_engines removed (unrelated to current system)

-- Add telegram_chat_id to trader_profile
ALTER TABLE trader_profile
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

COMMENT ON COLUMN trader_profile.telegram_chat_id IS 'Telegram chat ID for receiving trading signals and notifications';
