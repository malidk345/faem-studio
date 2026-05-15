import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  isLoading: boolean;
  addWishlist: (productId: string) => Promise<void>;
  removeWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setWishlistIds([]);
      setIsLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', user.id);

        if (!error && data && mounted) {
          setWishlistIds(data.map(item => item.product_id));
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWishlist();

    return () => {
      mounted = false;
    };
  }, [user]);

  const addWishlist = useCallback(async (productId: string) => {
    if (!user) return;

    // Optimistic UI update
    setWishlistIds(prev => [...prev, productId]);

    try {
      const { error } = await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      if (error) {
        console.error('Error adding to wishlist', error);
        // Revert optimistic update
        setWishlistIds(prev => prev.filter(id => id !== productId));
      }
    } catch (e) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
    }
  }, [user]);

  const removeWishlist = useCallback(async (productId: string) => {
    if (!user) return;

    // Optimistic UI update
    setWishlistIds(prev => prev.filter(id => id !== productId));

    try {
      const { error } = await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      if (error) {
        console.error('Error removing from wishlist', error);
        // Revert optimistic update
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (e) {
      setWishlistIds(prev => [...prev, productId]);
    }
  }, [user]);

  const isWishlisted = useCallback((productId: string) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoading, addWishlist, removeWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
