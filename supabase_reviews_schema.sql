-- REVIEWS TABLE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    is_verified_buyer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Set up RLS Policies

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews (Optional)
CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can update/delete any review (If you have a role-based system)
-- CREATE POLICY "Admins have full access" ON public.reviews ...

-- 4. Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- 5. Link profiles to reviews (If you want to display names)
-- Ensure your 'profiles' table has 'id' and 'name' columns
-- The frontend joins reviews with profiles(name)
