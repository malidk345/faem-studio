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

const ITEMS_PER_PAGE = 12;

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

export default function Shop() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialCollection = searchParams.get('collection') || 'All';

  useSEO({
    title: `${t('shop.title')} | Faem Studio`,
    description: t('shop.desc')
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
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
        const mappedData = data.map(mapProduct);
        if (isInitial) {
          setProducts(mappedData);
        } else {
          setProducts(prev => [...prev, ...mappedData]);
        }
        
        const currentTotal = from + data.length;
        setHasMore(count ? currentTotal < count : data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, collRes] = await Promise.all([
          supabase.from('categories').select('name'),
          supabase.from('collections').select('name')
        ]);
        if (catRes.data) setAvailableCats(['All', ...catRes.data.map(c => c.name)]);
        if (collRes.data) setAvailableColls(['All', ...collRes.data.map(c => c.name)]);
      } catch (err) {
        console.error("Meta fetch error:", err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(0);
    setIsLoading(true);
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
                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-full px-6 text-[13px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
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
              className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold tracking-tighter uppercase">Filtrele</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto px-6 py-4 flex flex-col gap-8">
                  {/* Categories Filter */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Kategoriler</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableCats.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border
                            ${activeCategory === cat 
                              ? 'bg-black text-white border-black shadow-md' 
                              : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-200'}`}
                        >
                          {cat === 'All' ? 'TÜMÜ' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collections Filter */}
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Koleksiyonlar</h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {availableColls.map(coll => (
                        <button
                          key={coll}
                          onClick={() => setActiveCollection(coll)}
                          className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all border
                            ${activeCollection === coll 
                              ? 'bg-zinc-50 border-zinc-900 text-zinc-900' 
                              : 'bg-white border-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">{coll === 'All' ? 'TÜM KOLEKSİYONLAR' : coll}</span>
                          <div className={`w-1 h-1 rounded-full ${activeCollection === coll ? 'bg-black' : 'bg-transparent'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-2">
                  <Button 
                    onClick={() => {
                      setActiveCategory('All');
                      setActiveCollection('All');
                      setIsFilterOpen(false);
                    }}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-zinc-200 text-[9px] font-black uppercase tracking-[0.2em] bg-white"
                  >
                    Sıfırla
                  </Button>
                  <Button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-[2] h-12 rounded-xl bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 hover:bg-zinc-900"
                  >
                    Uygula
                  </Button>
                </div>
              </motion.div>
            </div>
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
