-- ─────────────────────────────────────────────────
-- 08_stock_management.sql
-- Stok yönetimi: Sipariş sonrası stok düşürme
-- ─────────────────────────────────────────────────

-- Stok düşürme fonksiyonu
-- Sipariş tamamlandığında her ürün için çağrılır.
-- stock_count asla 0'ın altına düşmez.
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_amount INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock_count = GREATEST(stock_count - p_amount, 0)
  WHERE id = p_product_id;
END;
$$;

-- RPC fonksiyonuna anon/authenticated erişim izni
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO anon, authenticated;
