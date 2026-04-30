import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { GlobalPageLoader } from '../components/GlobalPageLoader';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';
import { X, SlidersHorizontal, ChevronRight, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  collection?: string;
  description: string;
  images?: string[];
  sizes?: string[];
  features?: string[];
  discount_price?: string;
}

export default function Shop() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialCollection = searchParams.get('collection') || 'All';

  useSEO({
    title: `${t('shop.title')} | Faem Studio`,
    description: t('shop.desc')
  });

  const ITEMS_PER_PAGE = 12;
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeCollection, setActiveCollection] = useState<string>(initialCollection);
  const [availableCats, setAvailableCats] = useState<string[]>(['All']);
  const [availableColls, setAvailableColls] = useState<string[]>(['All']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadProducts = async (pageNum: number, search: string, isInitial = false) => {
    try {
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('id, name, price, image_url, category, collection, discount_price, description, images, features, sizes', { count: 'exact' })
        .or('is_archived.is.null,is_archived.eq.false')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search.trim() !== '') {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }
      if (activeCollection !== 'All') {
        query = query.eq('collection', activeCollection);
      }

      const { data, error, count } = await query;

      if (error || !data) {
        if (isInitial) setProducts([]);
        setHasMore(false);
      } else {
        if (isInitial) {
          setProducts(data.map(mapProduct));
        } else {
          setProducts(prev => [...prev, ...data.map(mapProduct)]);
        }
        
        setHasMore(count ? (from + data.length < count) : data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image_url,
    images: p.images || [],
    category: p.category,
    collection: p.collection,
    sizes: p.sizes || ['One Size'],
    description: p.description,
    features: p.features || [],
    discount_price: p.discount_price
  });

  useEffect(() => {
    const fetchMeta = async () => {
      const [catRes, collRes] = await Promise.all([
        supabase.from('categories').select('name'),
        supabase.from('collections').select('name')
      ]);
      if (catRes.data) setAvailableCats(['All', ...catRes.data.map(c => c.name)]);
      if (collRes.data) setAvailableColls(['All', ...collRes.data.map(c => c.name)]);
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(0);
    loadProducts(0, searchQuery, true);
  }, [searchQuery, activeCategory, activeCollection]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, searchQuery);
  };

  if (isLoading && products.length === 0) return <GlobalPageLoader isLoading={true} />;

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        {/* Editorial Heading Section */}
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-16 md:mb-24">
          <span className="text-[10px] font-normal tracking-[0.4em] text-black/20 font-['Handjet',sans-serif]">Faem Studio Collection</span>
          {/* Search & Filter Box */}
          <div className="flex items-center gap-4 w-full max-w-xl mx-auto">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Ürün Ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-full px-6 text-[13px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <X size={14} className="text-zinc-500" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="w-14 h-14 flex items-center justify-center bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Filter Drawer Overlay */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-white z-[101] shadow-2xl overflow-y-auto p-10 flex flex-col gap-12"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tighter uppercase">Filtreler</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Kategoriler</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {availableCats.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsFilterOpen(false);
                        }}
                        className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all border
                          ${activeCategory === cat 
                            ? 'bg-black text-white border-black' 
                            : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'}`}
                      >
                        {cat === 'All' ? 'TÜMÜ' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collections Filter */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Koleksiyonlar</h4>
                  <div className="flex flex-col gap-2">
                    {availableColls.map(coll => (
                      <button
                        key={coll}
                        onClick={() => {
                          setActiveCollection(coll);
                          setIsFilterOpen(false);
                        }}
                        className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all border
                          ${activeCollection === coll 
                            ? 'bg-zinc-50 border-zinc-900 text-zinc-900' 
                            : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest">{coll === 'All' ? 'TÜM KOLEKSİYONLAR' : coll}</span>
                        <ChevronRight size={14} className={activeCollection === coll ? 'opacity-100' : 'opacity-20'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-10 border-t border-zinc-100 flex flex-col gap-4">
                  <Button 
                    onClick={() => {
                      setActiveCategory('All');
                      setActiveCollection('All');
                      setIsFilterOpen(false);
                    }}
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    Sıfırla
                  </Button>
                  <Button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full h-14 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    Sonuçları Gör
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Spacious Product Grid */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8"
            >
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (i % ITEMS_PER_PAGE) * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}

              {products.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-40 text-center text-neutral-400 text-[13px] font-medium tracking-widest uppercase italic"
                >
                  {t('shop.no_items')}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-24">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="group relative overflow-hidden bg-black text-white px-12 py-4 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <span className="relative z-10 text-[12px] font-black uppercase tracking-[0.2em]">
                  {isLoading ? 'Yükleniyor...' : 'Daha Fazla Keşfet'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
