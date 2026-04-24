-- ─────────────────────────────────────────────────
-- 09_admin_features.sql
-- Sipariş: tracking_number, admin_note
-- İndirim Kodları: promotions tablosu
-- ─────────────────────────────────────────────────

-- Siparişe kargo takip no ve admin notu ekleme
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT DEFAULT NULL;

-- İndirim kodları tablosu
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  percent INT NOT NULL DEFAULT 10,
  min_amount NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (checkout'ta doğrulama için)
CREATE POLICY "Promotions are viewable by everyone"
  ON promotions FOR SELECT
  USING (true);

-- Sadece admin insert/update/delete yapabilir
CREATE POLICY "Admins can manage promotions"
  ON promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
