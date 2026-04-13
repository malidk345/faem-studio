import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Heart, User as UserIcon, LogOut, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

type Tab = 'orders' | 'wishlist' | 'profile';

export default function Account() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: `${t('account.title')} | Faem Studio`,
    description: t('account.desc')
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // Fetch Orders
      const { data: oData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (oData) setOrders(oData);

      // Fetch Wishlist
      const { data: wData } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id);
      if (wData) setWishlist(wData.map(w => w.products));

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black shadow-2xl shadow-black/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/30 mb-1">{t('account.member')}</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">{user.name}</h1>
            <p className="text-black/40 text-sm font-medium mt-1">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-red-500 transition-colors"
        >
          <LogOut size={14} /> {t('account.signout')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 flex flex-col gap-2">
          <NavBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={18} />} label={t('account.orders')} count={orders.length} />
          <NavBtn active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} icon={<Heart size={18} />} label={t('account.wishlist')} count={wishlist.length} />
          <NavBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={18} />} label={t('account.profile')} />
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 className="text-xl font-bold mb-8 flex items-center gap-2">{t('account.history')} <span className="text-[10px] text-black/20 font-bold uppercase tracking-widest">({orders.length})</span></h2>
                {loading ? (
                  <div className="py-12 text-center text-black/30 animate-pulse font-medium">{t('account.loading')}</div>
                ) : orders.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 border border-zinc-100 rounded-3xl hover:bg-zinc-50 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-[10px] uppercase font-black text-zinc-400 mb-1 tracking-widest">{t('account.order_id')}</p>
                            <p className="text-sm font-black tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                          <div className="flex gap-2">
                             <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${order.payment_status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {order.payment_status === 'success' ? 'Ödendi' : 'Ödeme Bekliyor'}
                             </div>
                             <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                {t(`account.status.${order.status}`) || order.status}
                             </div>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                              <Clock size={12} />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                              <Package size={12} />
                              <span>{(order.items as any[])?.length || 1} Parça</span>
                            </div>
                          </div>
                          <p className="font-black text-black text-xl tracking-tighter">{order.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 border-2 border-dashed border-zinc-100 rounded-3xl text-center">
                    <p className="text-zinc-300 font-bold mb-6 italic">{t('account.no_orders')}</p>
                    <Link to="/shop" className="bg-black text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest">
                       Alışverişe Başla
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-8">
                   <h2 className="text-xl font-bold">{t('account.wishlist')}</h2>
                   <Link to="/wishlist" className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5">Tümünü Gör</Link>
                </div>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
                    {wishlist.slice(0, 3).map((item) => (
                      <Link key={item.id} to={`/product/${item.id}`} className="group flex flex-col gap-3">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div>
                          <p className="text-[13px] font-black tracking-tight">{item.name}</p>
                          <p className="text-[12px] opacity-40 font-bold">{item.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 border border-dashed border-black/10 rounded-3xl text-center text-black/30 font-medium">
                    {t('account.empty_wishlist')}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 className="text-xl font-bold mb-8">{t('account.profile')}</h2>
                <div className="space-y-6">
                  <ProfileField label={t('account.full_name')} value={user.name} />
                  <ProfileField label={t('account.email')} value={user.email} />
                  <div className="pt-6 border-t border-black/5">
                    <p className="text-[10px] uppercase font-bold text-black/30 mb-4 tracking-widest">{t('account.shipping_addr')}</p>
                    <div className="flex items-start gap-4 p-5 bg-black/[0.02] rounded-2xl">
                        <MapPin size={18} className="text-black/20" />
                        <p className="text-[13px] text-black/60 font-medium leading-relaxed">{t('account.no_addr')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

function NavBtn({ active, label, icon, onClick, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${active ? 'bg-black text-white shadow-xl shadow-black/10 translate-x-1' : 'text-black/40 hover:text-black hover:bg-black/5'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-black/5'}`}>{count}</span>}
    </button>
  );
}

function ProfileField({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1.5 px-4 md:px-0">
            <span className="text-[10px] uppercase font-bold text-black/30 tracking-widest">{label}</span>
            <div className="text-[15px] font-bold border-b border-black/5 pb-3 flex items-center justify-between group">
                {value}
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>
        </div>
    );
}
