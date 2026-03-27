-- Price Radar: Multi-timeframe S/R proximity visualization with Telegram alerts

-- User radar settings
CREATE TABLE IF NOT EXISTS radar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  watched_pairs TEXT[] DEFAULT ARRAY['EUR_USD', 'GBP_USD', 'USD_JPY'],
  alert_zone_pips INTEGER DEFAULT 15,
  warning_zone_pips INTEGER DEFAULT 25,
  cooldown_minutes INTEGER DEFAULT 30,
  range_pips INTEGER DEFAULT 100,
  telegram_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE radar_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own radar settings" ON radar_settings FOR ALL USING (auth.uid() = user_id);

-- Alert history
CREATE TABLE IF NOT EXISTS radar_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  instrument VARCHAR(10) NOT NULL,
  alert_type VARCHAR(20) NOT NULL,
  level_price DECIMAL(12,6) NOT NULL,
  level_type VARCHAR(10) NOT NULL,
  level_timeframe VARCHAR(10) NOT NULL,
  level_label TEXT,
  price_at_alert DECIMAL(12,6) NOT NULL,
  distance_pips DECIMAL(6,1) NOT NULL,
  telegram_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE radar_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own radar alerts" ON radar_alerts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_radar_alerts_user_time ON radar_alerts(user_id, created_at DESC);
