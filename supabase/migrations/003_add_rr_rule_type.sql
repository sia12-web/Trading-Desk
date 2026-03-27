ALTER TABLE public.risk_rules DROP CONSTRAINT IF EXISTS risk_rules_rule_type_check;
ALTER TABLE public.risk_rules ADD CONSTRAINT risk_rules_rule_type_check 
  CHECK (rule_type IN ('max_position_size', 'max_daily_loss', 'max_open_trades', 'max_risk_per_trade', 'max_correlated_exposure', 'min_reward_risk', 'custom'));
