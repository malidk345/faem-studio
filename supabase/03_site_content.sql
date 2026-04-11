-- ##############################################################################
-- 03_SITE_CONTENT.SQL
-- Hero Slides (Ana Sayfa), İndirimler ve Kampanya Yönetimi
-- ##############################################################################

-- 1. SİTE İÇERİK TABLOSU (Hero Slides)
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL DEFAULT 'hero_slide', -- 'hero_slide', 'announcement', 'about_text'
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link_url text DEFAULT '/shop',
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. PROMOSYONLAR VE İNDİRİMLER
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  code text UNIQUE, -- 'YAZSLS26' gibi
  discount_percent integer CHECK (discount_percent > 0 AND discount_percent <= 100),
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. GÜVENLİK (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- POLİTİKALAR
CREATE POLICY "Public Read Site Content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admin All Site Content" ON public.site_content FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public Read Promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Admin All Promotions" ON public.promotions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. BAŞLANGIÇ VERİSİ (Default Hero Slides)
INSERT INTO public.site_content (title, subtitle, image_url, priority) VALUES 
('The Silk Narrative', 'Summer 26 — Woven from silence and light.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop', 1),
('Structured Precision', 'Modern / Minimal — Architecture in cloth.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1600&auto=format&fit=crop', 2),
('Essential Luxe', 'Cashmere Staples — The warmth of restraint.', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1600&auto=format&fit=crop', 3)
ON CONFLICT DO NOTHING;
