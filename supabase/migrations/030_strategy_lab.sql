-- ═══════════════════════════════════════════════════════════════
-- Strategy Lab: AI-Powered Strategy Discovery & Execution System
-- ═══════════════════════════════════════════════════════════════

-- 1. Strategy discoveries (AI-found patterns and generated rules)
CREATE TABLE IF NOT EXISTS strategy_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    oanda_account_id TEXT,
    instrument TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rule_set JSONB NOT NULL,
    discovery_reasoning TEXT,
    gemini_hypothesis JSONB,
    deepseek_validation JSONB,
    claude_architecture JSONB,
    origin_model TEXT NOT NULL DEFAULT 'trio',
    ai_confidence REAL DEFAULT 0,
    backtest_result JSONB,
    walk_forward_result JSONB,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','backtesting','validated','active','monitoring','retired')),
    live_performance JSONB,
    source_analysis_id UUID,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discoveries_user ON strategy_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_status ON strategy_discoveries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_discoveries_instrument ON strategy_discoveries(user_id, instrument);

ALTER TABLE strategy_discoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own discoveries" ON strategy_discoveries
    FOR ALL USING (auth.uid() = user_id);

-- 2. Strategy Lab signals
CREATE TABLE IF NOT EXISTS lab_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    oanda_account_id TEXT,
    strategy_id UUID NOT NULL REFERENCES strategy_discoveries(id) ON DELETE CASCADE,
    instrument TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('long','short')),
    entry_price REAL NOT NULL,
    stop_loss REAL NOT NULL,
    take_profit REAL,
    trailing_stop_distance REAL,
    units INTEGER,
    confidence REAL DEFAULT 0,
    rule_name TEXT,
    triggered_conditions JSONB,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected','executed','expired')),
    trade_id UUID,
    oanda_trade_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    result_pips REAL,
    result_status TEXT CHECK (result_status IN ('win','loss','breakeven','open'))
);

CREATE INDEX IF NOT EXISTS idx_lab_signals_user ON lab_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_signals_strategy ON lab_signals(strategy_id);
CREATE INDEX IF NOT EXISTS idx_lab_signals_pending ON lab_signals(user_id, status) WHERE status = 'pending';

ALTER TABLE lab_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON lab_signals
    FOR ALL USING (auth.uid() = user_id);

-- 3. Discovery scan history
CREATE TABLE IF NOT EXISTS lab_scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    oanda_account_id TEXT,
    instrument TEXT NOT NULL,
    patterns_found INTEGER DEFAULT 0,
    strategies_created INTEGER DEFAULT 0,
    scan_duration_ms INTEGER,
    gemini_status TEXT,
    deepseek_status TEXT,
    claude_status TEXT,
    pipeline_errors JSONB,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user ON lab_scan_history(user_id);

ALTER TABLE lab_scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own scans" ON lab_scan_history
    FOR ALL USING (auth.uid() = user_id);

-- 4. Strategy Lab settings
CREATE TABLE IF NOT EXISTS lab_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    oanda_account_id TEXT,
    watched_pairs JSONB NOT NULL DEFAULT '["EUR_USD"]',
    scan_enabled BOOLEAN DEFAULT false,
    scan_frequency TEXT DEFAULT 'daily' CHECK (scan_frequency IN ('hourly','daily','weekly')),
    notify_discoveries BOOLEAN DEFAULT true,
    notify_signals BOOLEAN DEFAULT true,
    telegram_enabled BOOLEAN DEFAULT false,
    auto_backtest BOOLEAN DEFAULT true,
    max_risk_per_signal REAL DEFAULT 1.0,
    max_active_strategies INTEGER DEFAULT 5,
    min_win_rate REAL DEFAULT 55.0,
    min_profit_factor REAL DEFAULT 1.5,
    min_sharpe REAL DEFAULT 0.5,
    min_trades INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lab_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON lab_settings
    FOR ALL USING (auth.uid() = user_id);

-- 5. Strategy Lab performance snapshots
CREATE TABLE IF NOT EXISTS lab_performance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES strategy_discoveries(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    signals_count INTEGER DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_pips REAL DEFAULT 0,
    cumulative_pips REAL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perf_snapshots ON lab_performance_snapshots(strategy_id, snapshot_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_perf_unique ON lab_performance_snapshots(strategy_id, snapshot_date);

ALTER TABLE lab_performance_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own snapshots" ON lab_performance_snapshots
    FOR ALL USING (auth.uid() = user_id);
