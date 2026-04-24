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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadProducts = async (pageNum: number, category: string, collection: string, isInitial = false) => {
    try {
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('id, name, price, image_url, category, collection, discount_price, description, images, features, sizes', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (category !== 'All') {
        query = query.eq('category', category);
      }
      if (collection !== 'All') {
        query = query.eq('collection', collection);
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
    window.scrollTo(0, 0);
    loadProducts(0, activeCategory, activeCollection, true);
  }, [activeCategory, activeCollection]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, activeCategory, activeCollection);
  };

  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);
  const [availableCollections, setAvailableCollections] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchMeta = async () => {
      const [catRes, collRes] = await Promise.all([
        supabase.from('categories').select('name'),
        supabase.from('collections').select('name')
      ]);
      if (catRes.data) setAvailableCategories(['All', ...catRes.data.map(c => c.name)]);
      if (collRes.data) setAvailableCollections(['All', ...collRes.data.map(c => c.name)]);
    };
    fetchMeta();
  }, []);

  if (isLoading && products.length === 0) return <GlobalPageLoader isLoading={true} />;

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Editorial Heading Section */}
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-16 md:mb-24">
          <span className="text-[10px] font-normal tracking-[0.4em] text-black/20 font-['Handjet',sans-serif]">Faem Studio Collection</span>
          {/* Filter Trigger Button */}
          <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-8">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Arşiv Filtresi</span>
              <p className="text-[11px] text-zinc-500">
                {activeCollection !== 'All' ? activeCollection : (activeCategory === 'All' ? 'Tüm Parçalar' : activeCategory)}
              </p>
            </div>
            
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors rounded-full group"
            >
              <SlidersHorizontal size={14} className="text-zinc-400 group-hover:text-black transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Filtrele</span>
            </button>
          </div>

          {/* Filter Drawer / Sidebar Overlay */}
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
                      {availableCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setActiveCollection('All');
                            setPage(0);
                            setIsLoading(true);
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
                      {availableCollections.map(coll => (
                        <button
                          key={coll}
                          onClick={() => {
                            setActiveCollection(coll);
                            setActiveCategory('All');
                            setPage(0);
                            setIsLoading(true);
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
        </div>

        {/* Spacious Product Grid */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-10 md:gap-y-20"
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
