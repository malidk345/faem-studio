-- ##############################################################################
-- 05_CMS_FIXES.SQL
-- site_content tablosuna eksik olan kolonları ekler.
-- ##############################################################################

DO $$ 
BEGIN 
    -- button_text kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_content' AND column_name='button_text') THEN
        ALTER TABLE public.site_content ADD COLUMN button_text text DEFAULT 'Keşfet';
    END IF;

    -- button_link kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_content' AND column_name='button_link') THEN
        ALTER TABLE public.site_content ADD COLUMN button_link text DEFAULT 'all';
    END IF;
END $$;
