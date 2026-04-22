-- ##############################################################################
-- 04_SETTINGS.SQL
-- Mağaza Ayarları ve Konfigürasyon (Sadece Admin Erişimi)
-- ##############################################################################

CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name text DEFAULT 'FAEM Studio' NOT NULL,
  contact_email text DEFAULT 'admin@faem.studio' NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  tax_rate numeric DEFAULT 18 NOT NULL,
  shipping_fee numeric DEFAULT 25.00 NOT NULL,
  free_shipping_threshold numeric DEFAULT 500.00 NOT NULL,
  stripe_public_key text,
  stripe_secret_key text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Varsayılan tek bir satır ekleyelim
INSERT INTO public.store_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- RLS AKTİF ETME
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- POLİTİKALAR
-- Sadece Adminlerin okuma ve yazma izni var
CREATE POLICY "Admin All Settings" ON public.store_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Açık veri okuma (Sadece public_key gibi şeyler için gerekirse eklenebilir, şimdilik sadece admin okusun)
