-- 1. Pair subscriptions (which pairs user follows "for life")
CREATE TABLE pair_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(10) NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    UNIQUE(user_id, pair)
);
ALTER TABLE pair_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own subscriptions" ON pair_subscriptions FOR ALL USING (auth.uid() = user_id);

-- 2. Story episodes (each analysis = one episode)
CREATE TABLE story_episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(10) NOT NULL,
    episode_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    narrative TEXT NOT NULL,
    characters JSONB NOT NULL,
    current_phase VARCHAR(20) NOT NULL,
    key_levels JSONB,
    raw_ai_output JSONB,
    gemini_output JSONB,
    deepseek_output JSONB,
    news_context JSONB,
    confidence NUMERIC(3,2),
    next_episode_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE story_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own episodes" ON story_episodes FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_story_episodes_user_pair ON story_episodes(user_id, pair, created_at DESC);

-- 3. Scenarios (binary decision trees branching from episodes)
CREATE TABLE story_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_id UUID NOT NULL REFERENCES story_episodes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    direction VARCHAR(10) NOT NULL,
    probability NUMERIC(3,2),
    trigger_conditions TEXT NOT NULL,
    invalidation TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    outcome_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE story_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own scenarios" ON story_scenarios FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_story_scenarios_episode ON story_scenarios(episode_id);
CREATE INDEX idx_story_scenarios_active ON story_scenarios(user_id, pair, status) WHERE status = 'active';

-- Timestamp trigger for episodes
CREATE OR REPLACE FUNCTION update_story_episodes_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER story_episodes_updated_at
    BEFORE UPDATE ON story_episodes
    FOR EACH ROW EXECUTE FUNCTION update_story_episodes_timestamp();
