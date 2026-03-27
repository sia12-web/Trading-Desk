-- Add cache_metadata column to wave_analysis if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'wave_analysis'
        AND column_name = 'cache_metadata'
    ) THEN
        ALTER TABLE public.wave_analysis ADD COLUMN cache_metadata JSONB DEFAULT NULL;
    END IF;
END $$;
