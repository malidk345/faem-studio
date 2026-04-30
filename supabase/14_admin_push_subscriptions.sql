-- ==============================================================================
-- 14_ADMIN_PUSH_SUBSCRIPTIONS.SQL
-- Yönetici bildirimleri için push aboneliklerini saklar.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, subscription)
);

-- RLS
ALTER TABLE public.admin_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politikalar
CREATE POLICY "Admins can manage their own subscriptions" 
ON public.admin_subscriptions 
FOR ALL 
USING (auth.uid() = user_id AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_admin_subscriptions_user ON public.admin_subscriptions(user_id);
