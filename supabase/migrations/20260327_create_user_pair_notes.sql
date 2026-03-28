-- 20260327_create_user_pair_notes.sql
-- New table for private "My Story" notes for each pair.
-- AI/System will not have access to this table.

CREATE TABLE IF NOT EXISTS user_pair_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(15) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pair)
);

-- Enable RLS
ALTER TABLE user_pair_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users access own pair notes
CREATE POLICY "Users access own pair notes" 
ON user_pair_notes 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_pair_notes_updated_at 
BEFORE UPDATE ON user_pair_notes 
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp_column();
