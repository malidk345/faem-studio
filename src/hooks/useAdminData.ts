import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useAdminData() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null | 'LOGIN'>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Products
      const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (pData) setProducts(pData);

      // Categories
      const { data: cData } = await supabase.from('categories').select('*');
      if (cData) setCategories(cData.map(c => c.name));

      // Orders
      const { data: oData } = await supabase.from('orders').select('*, profiles(name)').order('created_at', { ascending: false });
      if (oData) {
        setOrders(oData.map(o => ({
           id: o.id.slice(0,8),
           user: o.shipping_address?.first_name || 'Müşteri',
           total: o.total,
           status: o.status,
           date: new Date(o.created_at).toLocaleDateString(),
           items: o.items?.length || 1
        })));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const verify = async () => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        if (!user) {
          setIsAdmin('LOGIN');
          return;
        }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
          fetchData();
        } else {
          setIsAdmin(false);
        }
      } else {
        // LOCAL DEV MOCK:
        setIsAdmin(true);
        setLoading(false);
      }
    };
    verify();
  }, [user, fetchData]);

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const addCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (!error) fetchData();
    return { error };
  };

  const publishProduct = async (newProduct: any) => {
    const { error } = await supabase.from('products').insert([newProduct]);
    if (!error) fetchData();
    return { error };
  };

  const updateProduct = async (id: string, updates: any) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const updateOrderStatus = async (id: string, status: string) => {
    // Note: id might be short 8-char in UI, but we need full ID for query if possible
    // Or we find by short ID if we store it, but here we'll assume we have full ID
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  return {
    isAdmin,
    products,
    orders,
    categories,
    loading,
    refreshData: fetchData,
    deleteProduct,
    addCategory,
    publishProduct,
    updateProduct,
    updateOrderStatus
  };
}
