-- 20260328_create_trading_guru_notes.sql
-- New table for private "Trading Gurus" notes.
-- AI/System will not have access to this table.

CREATE TABLE IF NOT EXISTS trading_guru_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guru_name VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, guru_name, topic)
);

-- Enable RLS
ALTER TABLE trading_guru_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users access own guru notes
CREATE POLICY "Users access own guru notes" 
ON trading_guru_notes 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trading_guru_notes_updated_at ON trading_guru_notes;
CREATE TRIGGER update_trading_guru_notes_updated_at 
BEFORE UPDATE ON trading_guru_notes 
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp_column();
