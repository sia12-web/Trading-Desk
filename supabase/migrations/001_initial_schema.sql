-- Trades table: core record for each trade
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pair VARCHAR(10) NOT NULL, -- e.g., 'EUR/USD', 'GBP/JPY'
  direction VARCHAR(4) NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(10,5),
  exit_price DECIMAL(10,5),
  stop_loss DECIMAL(10,5),
  take_profit DECIMAL(10,5),
  lot_size DECIMAL(10,4),
  status VARCHAR(10) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'open', 'closed', 'cancelled')),
  oanda_trade_id VARCHAR(50),
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screenshots linked to trades
CREATE TABLE trade_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  storage_path TEXT NOT NULL,
  label VARCHAR(50), -- e.g., 'entry_setup', 'exit', 'analysis'
  notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy notes per trade
CREATE TABLE trade_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  step_number INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- P&L records
CREATE TABLE trade_pnl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pnl_amount DECIMAL(12,2) NOT NULL, -- in account currency
  pnl_pips DECIMAL(8,1),
  fees DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk management rules
CREATE TABLE risk_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('max_position_size', 'max_daily_loss', 'max_open_trades', 'max_risk_per_trade', 'custom')),
  value JSONB NOT NULL, -- flexible: {"max_lots": 0.5} or {"max_percent": 2}
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI coaching log
CREATE TABLE ai_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('review', 'pre_trade', 'general')),
  prompt_summary TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_pnl ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coaching_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies: user can only access their own data
CREATE POLICY "Users access own trades" ON trades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own screenshots" ON trade_screenshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own strategies" ON trade_strategies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own pnl" ON trade_pnl FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own rules" ON risk_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own coaching" ON ai_coaching_sessions FOR ALL USING (auth.uid() = user_id);
