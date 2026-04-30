-- 13_promotions_rpc.sql

CREATE OR REPLACE FUNCTION increment_promo_usage(p_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promotions
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE code = p_code AND active = true;
END;
$$;
