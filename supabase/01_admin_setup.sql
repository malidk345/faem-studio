-- ##############################################################################
-- 01_ADMIN_SETUP.SQL
-- Profiller, Roller ve Otomatik Admin Atama Sistemi
-- ##############################################################################

-- 1. PROFİLLER TABLOSU
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. OTOMATİK ADMİN ATAMA FONKSİYONU
-- Bu fonksiyon, yeni bir kullanıcı kayıt olduğunda çalışır.
-- Eğer e-posta aşağıdaki listede varsa, rolü otomatik 'admin' olur.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    CASE 
      WHEN new.email IN ('dursunkayamustafa@gmail.com', 'fatihduymus21@gmail.com') THEN 'admin' 
      ELSE 'customer' 
    END
  );
  RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER (TETİKLEYİCİ) KURULUMU
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. GÜVENLİK (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
