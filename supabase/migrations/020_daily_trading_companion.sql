-- ============================================================
-- Daily Trading Companion: Tables for daily plans, tasks,
-- and push notification subscriptions
-- ============================================================

-- Daily Plans: one per user per day per account
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oanda_account_id VARCHAR(50),
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_briefing TEXT,
  market_context JSONB,
  manouk_advice TEXT,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  skipped_tasks INTEGER DEFAULT 0,
  completion_percent DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT daily_plans_unique_day UNIQUE (user_id, oanda_account_id, plan_date)
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own daily plans" ON daily_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_daily_plans_user_date ON daily_plans (user_id, oanda_account_id, plan_date DESC);

-- Daily Tasks: individual checkable items within a plan
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oanda_account_id VARCHAR(50),
  title TEXT NOT NULL,
  description TEXT,
  session_window VARCHAR(30) NOT NULL CHECK (session_window IN (
    'pre_market', 'london_session', 'us_session', 'post_market', 'anytime'
  )),
  sort_order INTEGER DEFAULT 0,
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  task_type VARCHAR(20) DEFAULT 'action' CHECK (task_type IN (
    'action', 'check', 'research', 'review', 'journal', 'homework'
  )),
  time_start_utc INTEGER,
  time_end_utc INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  completion_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own daily tasks" ON daily_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_daily_tasks_plan ON daily_tasks (plan_id, sort_order);
CREATE INDEX idx_daily_tasks_user_status ON daily_tasks (user_id, status);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  device_label VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Notification schedule preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  timezone VARCHAR(100) DEFAULT 'UTC',
  morning_briefing BOOLEAN DEFAULT TRUE,
  session_transitions BOOLEAN DEFAULT TRUE,
  task_reminders BOOLEAN DEFAULT TRUE,
  market_alerts BOOLEAN DEFAULT TRUE,
  morning_time VARCHAR(5) DEFAULT '07:00',
  quiet_start VARCHAR(5) DEFAULT '22:00',
  quiet_end VARCHAR(5) DEFAULT '06:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own notification prefs" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);
