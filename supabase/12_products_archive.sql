-- ==============================================================================
-- 12_PRODUCTS_ARCHIVE.SQL
-- Ürünler için arşivleme (is_archived) sütununu oluşturur.
-- ==============================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
