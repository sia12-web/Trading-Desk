-- Archived coaching chat sessions with full message history
CREATE TABLE coaching_chat_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Session metadata
  session_name TEXT NOT NULL, -- AI-generated topic or user-renamed
  is_renamed BOOLEAN DEFAULT FALSE, -- true if user customized the name
  ai_generated_name TEXT, -- original AI-suggested name

  -- Full chat history
  messages JSONB NOT NULL DEFAULT '[]', -- Array of {role: 'user' | 'assistant', content: string}
  message_count INTEGER DEFAULT 0,

  -- Session context
  session_type VARCHAR(20), -- 'review', 'pre_trade', 'general'
  trade_id UUID, -- if reviewing specific trade
  institutional_mode BOOLEAN DEFAULT FALSE,
  manual_position TEXT, -- manually selected trading position (e.g., "long EUR/USD at 1.0850")

  -- Timestamps
  session_started_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coaching_chat_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own archived chats" ON coaching_chat_archive FOR ALL USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_coaching_archive_user_archived ON coaching_chat_archive(user_id, archived_at DESC);
