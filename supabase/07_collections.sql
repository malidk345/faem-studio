-- ##############################################################################
-- 07_COLLECTIONS.SQL
-- Koleksiyon yönetimi için gerekli tablo ve izinler
-- ##############################################################################

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS AKTİF ETME
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- POLİTİKALAR
CREATE POLICY "Public Read Collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admin All Collections" ON public.collections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
