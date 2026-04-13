import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { GlobalPageLoader } from '../components/GlobalPageLoader';
import { Heart, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function Wishlist() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: `Wishlist | Faem Studio`,
    description: "Your curated selection of archival pieces."
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('*, products(*)')
          .eq('user_id', user.id);

        if (data) {
          // Map to match ProductCard expectations
          const mappedProducts = data.filter(item => item.products).map(item => ({
             ...item.products,
             image: item.products.image_url // Match frontend naming
          }));
          setItems(mappedProducts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  if (loading) return <GlobalPageLoader isLoading={true} />;

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300 border border-zinc-100 mb-8">
           <Heart size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-4">Giriş Yapılmadı</h1>
        <p className="text-zinc-500 mb-8 max-w-xs font-medium">Favorilerinizle ilgilenmek için önce oturum açmalısınız.</p>
        <button 
          onClick={() => navigate('/signin')}
          className="bg-black text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-95"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-16 border-b border-black/5 pb-8">
         <Link to="/shop" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-4 text-[10px] font-black uppercase tracking-widest leading-none">
            <ChevronLeft size={14} /> Shop'a Dön
         </Link>
         <div className="flex items-center justify-between">
            <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter leading-none text-black uppercase">
              Seçkilerim
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl">
               <Heart size={14} className="fill-rose-500 text-rose-500" />
               <span className="text-[11px] font-black text-black">{items.length} Parça</span>
            </div>
         </div>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
             <p className="text-zinc-400 text-sm font-medium mb-6">Listeniz şu an sessiz ve boş.</p>
             <Link to="/shop" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b border-black pb-1 hover:text-zinc-500 transition-colors">
                 Yeni Parçalar Keşfet <ArrowRight size={14} />
             </Link>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16"
          >
            {items.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
