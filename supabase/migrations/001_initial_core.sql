-- ==============================================================
-- 001_initial_core: Consolidated Trade Desk Core Schema
-- Support for: Journal, AI Story, Indicator Optimizations, Risk Rules
-- ==============================================================

-- CLEANUP: Remove legacy tables and prepare for clean core start
DROP TABLE IF EXISTS trades, trade_screenshots, trade_strategies, trade_pnl, trade_sync_log, execution_log CASCADE;
DROP TABLE IF EXISTS trader_profile, indicator_optimizations, story_agent_reports CASCADE;
DROP TABLE IF EXISTS pair_subscriptions, story_episodes, story_scenarios CASCADE;
DROP TABLE IF EXISTS risk_rules, strategy_templates, notification_preferences, push_subscriptions CASCADE;

-- LEGACY PURGE: Ensure no trace of abandoned features
DROP TABLE IF EXISTS wave_analysis, ai_coaching_sessions, coaching_memory, behavioral_analysis CASCADE;
DROP TABLE IF EXISTS scalp_sessions, scalp_trades, bb_sessions, bb_trades CASCADE;
DROP TABLE IF EXISTS strategy_signals, strategy_engines, technical_analyses, candle_analysis CASCADE;
DROP TABLE IF EXISTS daily_tasks, daily_plans, radar_settings, radar_alerts CASCADE;
DROP TABLE IF EXISTS strategy_discoveries, lab_signals, lab_settings, lab_performance_snapshots, lab_scan_history CASCADE;
DROP TABLE IF EXISTS structural_analysis_cache_v2, ai_usage_tracking, notification_preferences_v1 CASCADE;

-- 1. Trader Profile (One per user+account)
CREATE TABLE trader_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    oanda_account_id VARCHAR(50),
    
    -- Self-assessment
    trading_style VARCHAR(20) CHECK (trading_style IN ('scalper', 'day_trader', 'swing_trader', 'position_trader')),
    risk_personality VARCHAR(20) CHECK (risk_personality IN ('aggressive', 'moderate', 'conservative')),
    experience_months INTEGER,
    primary_pairs TEXT[],
    trading_goals TEXT,
    
    -- AI-observed traits
    observed_strengths JSONB DEFAULT '[]', 
    observed_weaknesses JSONB DEFAULT '[]',
    emotional_triggers JSONB DEFAULT '[]',
    current_focus TEXT,
    personality_notes TEXT,
    compact_profile TEXT,
    
    -- Sync stats
    last_demo_reset_at TIMESTAMPTZ,
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, oanda_account_id)
);

ALTER TABLE trader_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own profile" ON trader_profile FOR ALL USING (auth.uid() = user_id);

-- 2. Risk Rules (Terminal Enforcement)
CREATE TABLE risk_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('max_position_size', 'max_daily_loss', 'max_open_trades', 'max_risk_per_trade', 'min_reward_risk', 'custom')),
    value JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own risk rules" ON risk_rules FOR ALL USING (auth.uid() = user_id);

-- 3. Strategy Templates (Journal helper)
CREATE TABLE strategy_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    checklist_items JSONB NOT NULL DEFAULT '[]',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE strategy_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own strategy templates" ON strategy_templates FOR ALL USING (auth.uid() = user_id);

-- 4. Trades (Journal Core)
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    pair VARCHAR(15) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),
    
    -- Levels
    entry_price DECIMAL(10,5),
    exit_price DECIMAL(10,5),
    stop_loss DECIMAL(10,5),
    take_profit DECIMAL(10,5),
    lot_size DECIMAL(10,4),
    
    -- Status / ID
    status VARCHAR(15) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'open', 'closed', 'cancelled')),
    oanda_trade_id VARCHAR(50),
    oanda_account_id VARCHAR(50),
    strategy_template_id UUID REFERENCES strategy_templates(id),
    
    -- AI / Context
    voice_transcript TEXT,
    parsed_strategy JSONB,
    tags TEXT[],
    source VARCHAR(20) DEFAULT 'app',
    
    -- Human Context
    name VARCHAR(200),
    strategy_explanation TEXT,
    trade_reasoning JSONB, 
    
    -- Timestamps
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own trades" ON trades FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_trades_user_pair ON trades (user_id, pair);
CREATE INDEX idx_trades_status ON trades (status);

-- 5. Trade Details (Screenshots, Strategies, PnL)
CREATE TABLE trade_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    storage_path TEXT NOT NULL,
    label VARCHAR(50), 
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trade_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    step_number INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trade_pnl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    pnl_amount DECIMAL(12,2) NOT NULL,
    pnl_pips DECIMAL(8,1),
    fees DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_pnl ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own screenshots" ON trade_screenshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own strategies" ON trade_strategies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own pnl" ON trade_pnl FOR ALL USING (auth.uid() = user_id);

-- 6. OANDA Sync & Execution Logs
CREATE TABLE execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    oanda_account_id VARCHAR(50),
    action VARCHAR(30) NOT NULL CHECK (action IN ('place_order', 'modify_trade', 'close_trade', 'cancel_order', 'sync_import', 'sync_close')),
    trade_id UUID REFERENCES trades(id),
    oanda_trade_id VARCHAR(50),
    request_payload JSONB NOT NULL,
    response_payload JSONB,
    risk_validation JSONB,
    status VARCHAR(15) NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trade_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    oanda_account_id VARCHAR(50),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    open_imported INTEGER DEFAULT 0,
    closed_imported INTEGER DEFAULT 0,
    closed_updated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'
);

ALTER TABLE execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own execution logs" ON execution_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own sync logs" ON trade_sync_log FOR ALL USING (auth.uid() = user_id);

-- 7. Indicator Optimizations (Dashboard feature)
CREATE TABLE indicator_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    oanda_account_id VARCHAR(50),
    pair VARCHAR(15) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    indicator VARCHAR(50) NOT NULL,
    
    -- Params & Metrics
    optimized_params JSONB NOT NULL,
    default_params JSONB,
    consistency_score DECIMAL(5,2),
    win_rate DECIMAL(5,2),
    profit_factor DECIMAL(5,2),
    total_trades INTEGER,
    
    -- Comparison
    default_win_rate DECIMAL(5,2),
    default_profit_factor DECIMAL(5,2),
    improvement_percent DECIMAL(8,2), -- (new_pf - old_pf) / old_pf * 100
    
    -- AI Context
    recommendation TEXT,
    reasoning TEXT,
    
    optimized_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    
    UNIQUE(user_id, pair, timeframe, indicator)
);

ALTER TABLE indicator_optimizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own optimizations" ON indicator_optimizations FOR ALL USING (auth.uid() = user_id);

-- 8. AI Story Feature
CREATE TABLE pair_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(15) NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    UNIQUE(user_id, pair)
);

CREATE TABLE story_episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(15) NOT NULL,
    episode_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    narrative TEXT NOT NULL,
    characters JSONB NOT NULL,
    current_phase VARCHAR(50) NOT NULL,
    key_levels JSONB,
    raw_ai_output JSONB,
    gemini_output JSONB,
    deepseek_output JSONB,
    news_context JSONB,
    confidence NUMERIC(3,2),
    next_episode_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE story_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id UUID NOT NULL REFERENCES story_episodes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(15) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    direction VARCHAR(10) NOT NULL,
    probability NUMERIC(3,2),
    trigger_conditions TEXT NOT NULL,
    invalidation TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    outcome_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE story_agent_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pair VARCHAR(15) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    report JSONB NOT NULL DEFAULT '{}',
    raw_ai_output TEXT,
    model_used VARCHAR(50),
    duration_ms INTEGER,
    status VARCHAR(20) DEFAULT 'completed',
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pair, agent_type, report_date)
);

ALTER TABLE pair_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_agent_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own subscriptions" ON pair_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own episodes" ON story_episodes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own scenarios" ON story_scenarios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own agent reports" ON story_agent_reports FOR ALL USING (auth.uid() = user_id);

-- 9. Notification Preferences (App Core)
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    morning_briefing BOOLEAN DEFAULT TRUE,
    session_transitions BOOLEAN DEFAULT TRUE,
    task_reminders BOOLEAN DEFAULT TRUE,
    market_alerts BOOLEAN DEFAULT TRUE,
    morning_time TIME DEFAULT '07:00',
    quiet_start TIME DEFAULT '22:00',
    quiet_end TIME DEFAULT '06:00',
    telegram_chat_id TEXT,
    telegram_enabled BOOLEAN DEFAULT FALSE,
    wake_up_time TIME DEFAULT '06:00',
    trading_start_time TIME DEFAULT '07:00',
    trading_end_time TIME DEFAULT '21:00',
    enable_hourly_checkins BOOLEAN DEFAULT TRUE,
    enable_mental_coaching BOOLEAN DEFAULT TRUE,
    enable_break_reminders BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    device_label TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own push subs" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_trader_profile_updated_at BEFORE UPDATE ON trader_profile FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_story_episodes_updated_at BEFORE UPDATE ON story_episodes FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_strategy_templates_updated_at BEFORE UPDATE ON strategy_templates FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
