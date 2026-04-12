-- ##############################################################################
-- 04_PRODUCTION_READY_FIXES.SQL
-- Wishlist, Adresler ve Gelişmiş Güvenlik Politikaları
-- ##############################################################################

-- 1. PROFİLLER TABLOSUNA EK ALANLAR
-- (Eğer tablo zaten varsa bu alanları ekler)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
END $$;

-- 2. WISH-LIST (FAVORİLER) TABLOSU
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 3. ADRESLER TABLOSU (Kullanıcıların kayıtlı adresleri için)
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Evim', -- 'Ev', 'İş' vb.
  first_name text NOT NULL,
  last_name text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text,
  postal_code text NOT NULL,
  country text DEFAULT 'TR',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GÜVENLİK (RLS) AKTİFLEŞTİRME
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 5. POLİTİKALAR

-- Wishlist Politikaları
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Adres Politikaları
CREATE POLICY "Users can manage their own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- 6. OTOMATİK PROFİL GÜNCELLEME (Handle email)
-- 01_admin_setup.sql içindeki fonksiyonu email içerecek şekilde güncelliyoruz
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    CASE 
      WHEN new.email IN ('dursunkayamustafa@gmail.com', 'fatihduymus21@gmail.com') THEN 'admin' 
      ELSE 'customer' 
    END
  );
  RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. SİPARİŞLER (HARDENING)
-- Siparişler tablosuna ödeme takip alanı ekleme (Opsiyonel)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_intent_id') THEN
        ALTER TABLE public.orders ADD COLUMN payment_intent_id text;
    END IF;
END $$;

-- 8. PERFORMANS İNDEKSLERİ (Üretim sürümü için hız sağlar)
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
-- Fix: Ensure discount_price can store formatted strings (e.g. '500 ₺')
ALTER TABLE products ALTER COLUMN discount_price TYPE TEXT;
