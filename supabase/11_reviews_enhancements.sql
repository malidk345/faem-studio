-- ==============================================================================
-- 11_REVIEWS_ENHANCEMENTS.SQL
-- Yorumlara cevap (admin_reply) ve görsel (image_url) ekleme alanlarını oluşturur.
-- ==============================================================================

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Yorumlar tablosuna görsel yüklemek için storage bucket'ı oluştur (eğer yoksa)
-- Not: Storage ayarlaması dashboard üzerinden yapılmış olabilir, buraya sadece not düşüyoruz.
