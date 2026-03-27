-- Add Pine Script column to strategy_discoveries table
ALTER TABLE strategy_discoveries
ADD COLUMN IF NOT EXISTS pine_script TEXT;

COMMENT ON COLUMN strategy_discoveries.pine_script IS 'TradingView Pine Script v5 generated from rule_set for visual backtesting';
