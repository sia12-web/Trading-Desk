-- Add screenshot attachment to understanding notes (one per note per timeframe)
ALTER TABLE market_understanding ADD COLUMN screenshot_path TEXT DEFAULT NULL;
