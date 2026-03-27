-- Add auto_execute field to strategy_discoveries
-- When enabled, signals are automatically executed without manual approval

ALTER TABLE strategy_discoveries
ADD COLUMN auto_execute BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN strategy_discoveries.auto_execute IS 'When true, signals from this strategy are automatically executed to OANDA without manual approval';
