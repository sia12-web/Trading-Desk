-- Background tasks tracking table
CREATE TABLE IF NOT EXISTS background_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL, -- 'daily_plan', 'unified_analysis', 'strategy_discovery', etc.
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    context JSONB, -- task-specific data (pair, mode, options, etc.)
    result JSONB, -- task result when completed
    error TEXT, -- error message if failed
    progress_percent INTEGER DEFAULT 0, -- 0-100 for progress tracking
    progress_message TEXT, -- human-readable progress message
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE background_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON background_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON background_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON background_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON background_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX idx_background_tasks_user_status ON background_tasks(user_id, status);
CREATE INDEX idx_background_tasks_type ON background_tasks(task_type);
CREATE INDEX idx_background_tasks_created ON background_tasks(created_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_background_tasks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER background_tasks_updated_at
    BEFORE UPDATE ON background_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_background_tasks_timestamp();

-- Cleanup old completed tasks (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_background_tasks()
RETURNS void AS $$
BEGIN
    DELETE FROM background_tasks
    WHERE status IN ('completed', 'failed')
    AND completed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
