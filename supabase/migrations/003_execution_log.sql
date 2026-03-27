CREATE TABLE execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('place_order', 'modify_trade', 'close_trade', 'cancel_order')),
  trade_id UUID REFERENCES trades(id),
  oanda_trade_id VARCHAR(50),
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  risk_validation JSONB, -- snapshot of risk checks at time of execution
  status VARCHAR(10) NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE execution_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own logs" ON execution_log FOR ALL USING (auth.uid() = user_id);
