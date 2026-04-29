-- ==============================================================================
-- 10_REVIEWS_AUTHOR_NAME.SQL
-- Adminlerin "fake yorum" girebilmesi için reviews tablosuna author_name ekler.
-- ==============================================================================

-- 1. 'reviews' tablosuna author_name sütunu ekle (varsa hata vermemesi için doğrulama ile eklenebilir, fakat basitçe alter table kullanıyoruz)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Not: author_name NULL olabilir. Eğer NULL ise sistem kullanıcının gerçek adını profilden veya auth.users'tan alır.
-- Eğer doluysa (admin tarafından yazılmışsa) bu isim gösterilir.
