-- Migration: Add missing Telegram fields to notification_preferences
-- These fields are used in the Settings page but were missing from the table definition

ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wake_up_time VARCHAR(5) DEFAULT '06:00',
ADD COLUMN IF NOT EXISTS trading_start_time VARCHAR(5) DEFAULT '07:00',
ADD COLUMN IF NOT EXISTS trading_end_time VARCHAR(5) DEFAULT '21:00',
ADD COLUMN IF NOT EXISTS enable_hourly_checkins BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_mental_coaching BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_break_reminders BOOLEAN DEFAULT TRUE;
