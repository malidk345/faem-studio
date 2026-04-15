import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface AdminOrder {
  id: string;          // Full UUID — needed for DB operations
  shortId: string;     // Display-friendly 8-char prefix
  user: string;        // Customer name from shipping_address
  email: string;       // Customer email
  total: string;       // Formatted price string
  totalNumeric: number;// Parsed numeric value for calculations
  status: string;      // pending | processing | shipped | delivered | cancelled
  date: string;        // Localized date string
  rawDate: string;     // ISO date for sorting
  items: any[];        // Cart items array
  itemCount: number;   // Number of unique items
  shippingAddress: any; // Full shipping address object
  isGuest: boolean;    // True if order was placed without login
}

export function useAdminData() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null | 'LOGIN'>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
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

      // Orders — fetch ALL columns, join with profiles for customer name
      const { data: oData, error: oError } = await supabase
        .from('orders')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false });

      if (oError) {
        console.error('Error fetching orders:', oError);
      }

      if (oData) {
        const mapped: AdminOrder[] = oData.map(o => {
          // Parse numeric total from string like "$123.45" or "123.45 ₺" or just "123.45"
          const numericTotal = parseFloat(String(o.total).replace(/[^0-9.]/g, '')) || 0;
          
          // Get customer info from shipping_address or profiles join
          const shippingAddr = o.shipping_address || {};
          const customerName = [shippingAddr.first_name, shippingAddr.last_name]
            .filter(Boolean).join(' ') || (o.profiles as any)?.name || 'Müşteri';
          const customerEmail = shippingAddr.email || (o.profiles as any)?.email || '';

          // Parse items safely
          const items = Array.isArray(o.items) ? o.items : [];

          return {
            id: o.id,                       // FULL UUID — critical for updates
            shortId: o.id.slice(0, 8),
            user: customerName,
            email: customerEmail,
            total: o.total,
            totalNumeric: numericTotal,
            status: o.status || 'pending',
            date: new Date(o.created_at).toLocaleDateString('tr-TR', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            rawDate: o.created_at,
            items,
            itemCount: items.length,
            shippingAddress: shippingAddr,
            isGuest: !o.user_id,
          };
        });
        setOrders(mapped);
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

  // ── Realtime subscription for orders ──
  useEffect(() => {
    if (isAdmin !== true) return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (_payload) => {
          // Re-fetch all orders on any change (insert, update, delete)
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchData]);

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
    // Uses FULL UUID, not truncated shortId
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
