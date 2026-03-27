-- Fix VARCHAR(5) columns that are too short for "bullish"/"bearish"/"neutral"

-- trend_direction: was VARCHAR(5), needs VARCHAR(10) for "bullish"/"bearish"/"neutral"
ALTER TABLE scalp_sessions ALTER COLUMN trend_direction TYPE VARCHAR(10);

-- active_trade_direction: was VARCHAR(5), extend to VARCHAR(10) for consistency
ALTER TABLE scalp_sessions ALTER COLUMN active_trade_direction TYPE VARCHAR(10);

-- Also check status column is correct (should be VARCHAR(15))
-- Already correct, but ensuring it's set properly
ALTER TABLE scalp_sessions ALTER COLUMN status TYPE VARCHAR(15);
