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
  isGuest: boolean;    // True if order was placed without login
  userId: string | null; // Profile UUID if registered
  shippingAddress: any; // Full address object
}

export function useAdminData() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null | 'LOGIN'>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Run queries in parallel for maximum speed
      const [
        { data: pData },
        { data: cData },
        { data: collData },
        { data: mData },
        { data: custData },
        { data: setData },
        { data: oData, error: oError }
      ] = await Promise.all([
        // Only fetch necessary columns for products list to reduce payload size
        supabase.from('products')
          .select('id, name, price, category, collection, image_url, stock_count, created_at, description, images, features, discount_price')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('collections').select('*'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').limit(1).single(),
        supabase.from('orders').select('*, profiles(name, email)').order('created_at', { ascending: false })
      ]);

      if (pData) setProducts(pData);
      if (cData) setCategories(cData.map(c => c.name));
      if (collData) setCollections(collData.map(c => c.name));
      if (mData) setMessages(mData);
      if (custData) setCustomers(custData);
      if (setData) setSettings(setData);

      if (oError) {
        console.error('Error fetching orders:', oError);
      }

      if (oData) {
        const mapped: AdminOrder[] = oData.map(o => {
          const numericTotal = parseFloat(String(o.total).replace(/[^0-9.]/g, '')) || 0;
          const shippingAddr = o.shipping_address || {};
          const customerName = [shippingAddr.first_name, shippingAddr.last_name]
            .filter(Boolean).join(' ') || (o.profiles as any)?.name || 'Müşteri';
          const customerEmail = shippingAddr.email || (o.profiles as any)?.email || '';
          const items = Array.isArray(o.items) ? o.items : [];

          return {
            id: o.id,
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
            userId: o.user_id || null,
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

    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
      .subscribe();

    const messagesChannel = supabase
      .channel('admin-messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [isAdmin, fetchData]);

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const deleteCategory = async (name: string) => {
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (!error) fetchData();
    return { error };
  };

  const addCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (!error) fetchData();
    return { error };
  };

  const deleteCollection = async (name: string) => {
    const { error } = await supabase.from('collections').delete().eq('name', name);
    if (!error) fetchData();
    return { error };
  };

  const addCollection = async (name: string) => {
    const { error } = await supabase.from('collections').insert([{ name }]);
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

  const toggleMessageRead = async (id: string, isRead: boolean) => {
    const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const updateSettings = async (updates: any) => {
    if (!settings?.id) return { error: new Error("No settings record found") };
    const { error } = await supabase.from('store_settings').update(updates).eq('id', settings.id);
    if (!error) fetchData();
    return { error };
  };

  const clearAllProducts = async () => {
    const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) fetchData();
    return { error };
  };

  return {
    isAdmin,
    products,
    orders,
    categories,
    collections,
    messages,
    customers,
    settings,
    loading,
    refreshData: fetchData,
    deleteProduct,
    clearAllProducts,
    addCategory,
    deleteCategory,
    addCollection,
    deleteCollection,
    publishProduct,
    updateProduct,
    updateOrderStatus,
    toggleMessageRead,
    deleteMessage,
    updateSettings
  };
}
