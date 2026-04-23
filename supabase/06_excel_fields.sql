-- ##############################################################################
-- 06_EXCEL_FIELDS.SQL
-- Bu dosya, Excel'den aktarılan 'Renk' ve 'Metadata' gibi alanları
-- doğrudan tablo sütunu olarak tutmak istediğinizde çalıştırılmalıdır.
-- ##############################################################################

DO $$ 
BEGIN 
    -- 'color' sütunu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='color') THEN
        ALTER TABLE public.products ADD COLUMN color text;
    END IF;

    -- 'metadata' sütunu yoksa ekle (JSON verileri için)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='metadata') THEN
        ALTER TABLE public.products ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- 'collection' sütunu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='collection') THEN
        ALTER TABLE public.products ADD COLUMN collection text;
    END IF;
END $$;
