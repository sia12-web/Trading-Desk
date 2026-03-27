# Fix BB Strategy Database Error

## Error: `column bb_sessions.created_at does not exist`

This means the BB Strategy migration hasn't been applied to your Supabase database yet.

---

## ✅ Fix: Apply Migration

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run Migration

Copy and paste this SQL:

```sql
-- BB Strategy (Bollinger Bands + Stochastic) for Sideways Markets
-- Migration: Create bb_sessions and bb_trades tables

-- BB Strategy Sessions
CREATE TABLE IF NOT EXISTS bb_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instrument VARCHAR(20) NOT NULL,

    -- Strategy configuration (AI-optimized)
    bb_period INTEGER NOT NULL DEFAULT 20,
    bb_std_dev DECIMAL(3,1) NOT NULL DEFAULT 2.0,
    stoch_period INTEGER NOT NULL DEFAULT 14,
    stoch_smooth INTEGER NOT NULL DEFAULT 3,
    oversold_level INTEGER NOT NULL DEFAULT 20,
    overbought_level INTEGER NOT NULL DEFAULT 80,

    -- Risk management
    capital_allocation DECIMAL(10,2) NOT NULL,
    risk_per_trade DECIMAL(5,3) NOT NULL,
    take_profit_pips DECIMAL(6,2),
    stop_loss_pips DECIMAL(6,2),

    -- Session tracking
    status VARCHAR(10) NOT NULL CHECK (status IN ('running', 'paused', 'stopped')),
    source_analysis_id UUID REFERENCES wave_analysis(id),
    started_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE,
    stop_reason TEXT,

    -- Performance metrics
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL(12,2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BB Strategy Trades
CREATE TABLE IF NOT EXISTS bb_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES bb_sessions(id) ON DELETE CASCADE,

    -- Trade details
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),
    entry_price DECIMAL(10,5) NOT NULL,
    exit_price DECIMAL(10,5),

    -- Indicator values at entry
    bb_upper DECIMAL(10,5) NOT NULL,
    bb_middle DECIMAL(10,5) NOT NULL,
    bb_lower DECIMAL(10,5) NOT NULL,
    stoch_k DECIMAL(5,2) NOT NULL,
    stoch_d DECIMAL(5,2) NOT NULL,

    -- Risk management
    stop_loss DECIMAL(10,5) NOT NULL,
    take_profit DECIMAL(10,5) NOT NULL,

    -- Outcome
    pnl DECIMAL(10,2),
    pnl_pips DECIMAL(6,2),

    -- Timing
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bb_sessions_user_status ON bb_sessions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bb_sessions_analysis ON bb_sessions(source_analysis_id);
CREATE INDEX IF NOT EXISTS idx_bb_trades_session ON bb_trades(session_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_bb_trades_open ON bb_trades(session_id) WHERE closed_at IS NULL;

-- RLS Policies
ALTER TABLE bb_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_trades ENABLE ROW LEVEL SECURITY;

-- Users can only access their own BB sessions
DROP POLICY IF EXISTS "Users can view own BB sessions" ON bb_sessions;
CREATE POLICY "Users can view own BB sessions" ON bb_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own BB sessions" ON bb_sessions;
CREATE POLICY "Users can insert own BB sessions" ON bb_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own BB sessions" ON bb_sessions;
CREATE POLICY "Users can update own BB sessions" ON bb_sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own BB sessions" ON bb_sessions;
CREATE POLICY "Users can delete own BB sessions" ON bb_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access trades from their own sessions
DROP POLICY IF EXISTS "Users can view own BB trades" ON bb_trades;
CREATE POLICY "Users can view own BB trades" ON bb_trades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bb_sessions
            WHERE bb_sessions.id = bb_trades.session_id
            AND bb_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own BB trades" ON bb_trades;
CREATE POLICY "Users can insert own BB trades" ON bb_trades
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bb_sessions
            WHERE bb_sessions.id = bb_trades.session_id
            AND bb_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own BB trades" ON bb_trades;
CREATE POLICY "Users can update own BB trades" ON bb_trades
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bb_sessions
            WHERE bb_sessions.id = bb_trades.session_id
            AND bb_sessions.user_id = auth.uid()
        )
    );

-- Update trigger for bb_sessions.updated_at
CREATE OR REPLACE FUNCTION update_bb_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bb_sessions_updated_at ON bb_sessions;
CREATE TRIGGER trigger_update_bb_sessions_updated_at
    BEFORE UPDATE ON bb_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_bb_sessions_updated_at();

-- Comments
COMMENT ON TABLE bb_sessions IS 'BB Strategy sessions (Bollinger Bands + Stochastic for ranging markets)';
COMMENT ON TABLE bb_trades IS 'Individual trades executed during BB strategy sessions';
```

### Step 3: Click "Run"

You should see: `Success. No rows returned`

### Step 4: Verify

Go to **Table Editor** → Check if `bb_sessions` and `bb_trades` tables exist.

---

## ✅ Done!

After running the migration, refresh your app and the error should be gone.
