-- AI Usage Tracking
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    model_id VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    feature VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own usage logs"
    ON ai_usage_logs
    FOR ALL
    USING (auth.uid() = user_id);

-- Analytics view for charts
CREATE OR REPLACE VIEW ai_usage_stats AS
SELECT
    user_id,
    provider,
    model_id,
    SUM(prompt_tokens) as total_prompt_tokens,
    SUM(completion_tokens) as total_completion_tokens,
    SUM(total_tokens) as total_tokens,
    COUNT(*) as total_calls,
    DATE_TRUNC('day', created_at) as usage_date
FROM ai_usage_logs
GROUP BY user_id, provider, model_id, usage_date;

GRANT SELECT ON ai_usage_stats TO authenticated;
