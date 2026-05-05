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
    <div className="min-h-screen bg-[#f7f6f4] pt-24 md:pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        
        {/* Editorial Header */}
        <div className="mb-8 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
          <div className="flex items-center gap-4 md:gap-10">
            <div className="relative group shrink-0">
              <div className="w-14 h-14 md:w-32 md:h-32 bg-black text-white rounded-[2px] flex items-center justify-center text-xl md:text-5xl font-black shadow-2xl overflow-hidden">
                {user.name.charAt(0)}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#ddff34] text-black text-[7px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-[1px] font-['Handjet',sans-serif] tracking-widest uppercase">
                {t('account.member')}
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl md:text-5xl font-bold tracking-tighter leading-none text-black">
                {user.name}
              </h1>
              <p className="text-black/40 text-[11px] md:text-[12px] font-medium tracking-tight">
                {user.email} — <span className="font-['Handjet',sans-serif] text-[12px] md:text-[14px] opacity-100 text-black/60 hidden sm:inline">ID: {user.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="self-start md:self-auto flex items-center gap-3 text-[12px] font-normal uppercase tracking-[0.2em] text-black/40 hover:text-black transition-all font-['Handjet',sans-serif] group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            {t('account.signout')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Sticky Navigation / Mobile Scroll */}
          <aside className="lg:col-span-3 sticky top-32 z-30">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              <NavBtn 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')} 
                icon={<Package size={18} />} 
                label={t('account.orders')} 
                count={orders.length} 
              />
              <NavBtn 
                active={activeTab === 'wishlist'} 
                onClick={() => setActiveTab('wishlist')} 
                icon={<Heart size={18} />} 
                label={t('account.wishlist')} 
                count={wishlist.length} 
              />
              <NavBtn 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={<UserIcon size={18} />} 
                label={t('account.profile')} 
              />
            </div>
            
            {/* Archive Meta (Desktop Only) */}
            <div className="hidden lg:flex flex-col gap-2 mt-12 pt-10 border-t border-black/[0.05]">
              <div className="flex justify-between items-center text-[10px] font-normal text-black/20 font-['Handjet',sans-serif] uppercase tracking-[0.2em]">
                <span>Archive Control</span>
                <span>VOL.01</span>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-black/[0.05] via-black/[0.02] to-transparent" />
              <p className="text-[10px] text-black/20 font-medium leading-relaxed italic">
                Faem Studio is a creative archive exploring the intersection of technical design and editorial aesthetic.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-[2px] border border-black/[0.03] shadow-sm overflow-hidden min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                  <motion.div 
                    key="orders" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="p-4 md:p-12"
                  >
                    <div className="flex justify-between items-end mb-8 md:mb-12">
                      <div>
                        <span className="text-[10px] md:text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-1 md:mb-2">
                          Transaction History
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">{t('account.history')}</h2>
                      </div>
                      <span className="text-[12px] md:text-[14px] font-normal text-black/60 font-['Handjet',sans-serif] border border-black/[0.08] px-2 py-0.5 md:px-3 md:py-1 rounded-[1px]">
                        {orders.length} ITEMS
                      </span>
                    </div>

                    {loading ? (
                      <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-black/5 border-t-black rounded-full animate-spin" />
                        <p className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-widest">{t('account.loading')}...</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div 
                            key={order.id} 
                            className="group p-6 md:p-8 bg-[#f7f6f4]/50 border border-black/[0.02] hover:border-black/[0.08] hover:bg-[#f7f6f4] transition-all duration-500 rounded-[2px] relative overflow-hidden"
                          >
                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-[13px] font-bold tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                                  <span className={`px-2 py-0.5 rounded-[1px] text-[10px] font-normal uppercase tracking-widest font-['Handjet',sans-serif] ${order.payment_status === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {order.payment_status === 'success' ? 'Verified' : 'Pending'}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-[1px] text-[10px] font-normal uppercase tracking-widest font-['Handjet',sans-serif] bg-black text-white">
                                    {t(`account.status.${order.status}`) || order.status}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2 text-[11px] font-medium text-black/40">
                                    <Clock size={12} />
                                    <span className="font-['Handjet',sans-serif] tracking-wider">{new Date(order.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-medium text-black/40">
                                    <Package size={12} />
                                    <span className="font-['Handjet',sans-serif] tracking-wider">{(order.items as any[])?.length || 1} ITEMS</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                <span className="text-[10px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-widest hidden md:block">Total Amount</span>
                                <p className="font-bold text-2xl md:text-3xl tracking-tighter text-black font-['Handjet',sans-serif]">{order.total}</p>
                              </div>
                            </div>
                            
                            {/* Decorative line */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-32 border-2 border-dashed border-black/[0.03] rounded-[2px] text-center bg-[#f7f6f4]/30">
                        <p className="text-black/20 font-normal mb-8 italic text-lg">{t('account.no_orders')}</p>
                        <Link to="/shop" className="group relative overflow-hidden bg-black text-white px-10 py-4 rounded-[1px] transition-all hover:bg-black/90 active:scale-95 inline-flex items-center gap-3">
                           <span className="text-[12px] font-bold uppercase tracking-[0.2em] font-['Handjet',sans-serif]">Alışverişe Başla</span>
                           <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'wishlist' && (
                  <motion.div 
                    key="wishlist" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="p-4 md:p-12"
                  >
                    <div className="flex justify-between items-end mb-12">
                      <div>
                        <span className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-2">
                          Saved Items
                        </span>
                        <h2 className="text-3xl font-bold tracking-tighter">{t('account.wishlist')}</h2>
                      </div>
                      <Link to="/wishlist" className="text-[11px] font-normal uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-black/60 transition-colors font-['Handjet',sans-serif]">
                        Tümünü Gör
                      </Link>
                    </div>

                    {wishlist.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {wishlist.slice(0, 6).map((item) => (
                          <Link key={item.id} to={`/product/${item.id}`} className="group flex flex-col gap-4">
                            <div className="aspect-[3/4] rounded-[2px] overflow-hidden bg-[#f7f6f4] border border-black/[0.03] relative">
                              <img 
                                src={item.image_url} 
                                alt={item.name} 
                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                              />
                              <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-rose-500">
                                  <Heart size={12} fill="currentColor" />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-[14px] font-bold tracking-tight text-black group-hover:text-black/60 transition-colors">{item.name}</h3>
                              <p className="text-[16px] text-black font-normal font-['Handjet',sans-serif] tracking-wider">{item.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-32 border-2 border-dashed border-black/[0.03] rounded-[2px] text-center bg-[#f7f6f4]/30">
                        <p className="text-black/20 font-normal italic text-lg">{t('account.empty_wishlist')}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div 
                    key="profile" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="p-4 md:p-12"
                  >
                    <div className="mb-12">
                      <span className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-2">
                        Member Details
                      </span>
                      <h2 className="text-3xl font-bold tracking-tighter">{t('account.profile')}</h2>
                    </div>

                    <div className="space-y-10 max-w-2xl">
                      <ProfileField label={t('account.full_name')} value={user.name} />
                      <ProfileField label={t('account.email')} value={user.email} />
                      
                      <div className="pt-10 border-t border-black/[0.05]">
                        <span className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-6">
                          {t('account.shipping_addr')}
                        </span>
                        <div className="flex items-start gap-6 p-8 bg-[#f7f6f4] border border-black/[0.02] rounded-[2px] relative group">
                            <MapPin size={20} className="text-black/20" />
                            <div className="space-y-2">
                              <p className="text-[14px] text-black/60 font-medium leading-relaxed italic">{t('account.no_addr')}</p>
                              <button className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors font-['Handjet',sans-serif]">
                                + Yeni Adres Ekle
                              </button>
                            </div>
                            <div className="absolute top-0 left-0 w-[2px] h-0 bg-black group-hover:h-full transition-all duration-500" />
                        </div>
                      </div>

                      <div className="pt-10 border-t border-black/[0.05]">
                        <span className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-6">
                          Security
                        </span>
                        <button className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white px-6 py-3 rounded-[1px] border border-black transition-all font-['Handjet',sans-serif]">
                          Şifre Değiştir
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

function NavBtn({ active, label, icon, onClick, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 md:px-6 md:py-4 rounded-[1px] text-[12px] md:text-[13px] font-bold transition-all whitespace-nowrap min-w-max lg:min-w-0 ${
        active 
          ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.02] z-10' 
          : 'text-black/40 hover:text-black hover:bg-black/5'
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <span className={`${active ? 'text-white' : 'text-black/20'} shrink-0 scale-90 md:scale-100`}>{icon}</span>
        <span className="uppercase tracking-[0.1em]">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] px-2 py-0.5 rounded-[1px] font-['Handjet',sans-serif] ml-4 ${
          active ? 'bg-white text-black' : 'bg-black/5 text-black/40'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function ProfileField({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-3 group">
            <span className="text-[10px] md:text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em]">{label}</span>
            <div className="text-[16px] md:text-2xl font-bold border-b border-black/[0.08] pb-3 md:pb-4 flex items-center justify-between transition-all group-hover:border-black/30">
                <span className="tracking-tighter">{value}</span>
                <button className="text-[11px] font-bold uppercase tracking-widest text-black/20 hover:text-black transition-all font-['Handjet',sans-serif]">
                   Düzenle
                </button>
            </div>
        </div>
    );
}
