-- ##############################################################################
-- 02_STORE_TABLES.SQL
-- Ürünler, Kategoriler, Siparişler ve Yorumlar
-- ##############################################################################

-- 1. KATEGORİLER
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ÜRÜNLER
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  features text[] DEFAULT '{}',
  sizes text[] DEFAULT '{"XS","S","M","L","XL"}',
  stock_count integer DEFAULT 20,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SİPARİŞLER
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total text NOT NULL,
  status text DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  shipping_address jsonb NOT NULL,
  items jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. YORUMLAR
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_verified_buyer boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STORAGE (Bucket & Policy) - Fotoğraflar için
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Storage Politikaları (storage.objects tablosuna uygulanır)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) );
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) );
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) );

-- RLS AKTİF ETME
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLİTİKALAR (Admin her şeyi yapar, halk sadece okur)
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin All Products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Orders Auth Access" ON public.orders FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviews Auth Post" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
