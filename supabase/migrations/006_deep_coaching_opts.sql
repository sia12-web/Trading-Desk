ALTER TABLE trader_profile ADD COLUMN compact_profile TEXT;

ALTER TABLE coaching_memory ADD COLUMN is_compressed BOOLEAN DEFAULT FALSE;
ALTER TABLE coaching_memory ADD COLUMN compressed_from_count INTEGER;

ALTER TABLE behavioral_analysis ADD COLUMN compact_summary TEXT;
