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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

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
    loadProducts(0, searchQuery, true);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, searchQuery);
  };



  if (isLoading && products.length === 0) return <GlobalPageLoader isLoading={true} />;

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Editorial Heading Section */}
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-16 md:mb-24">
          <span className="text-[10px] font-normal tracking-[0.4em] text-black/20 font-['Handjet',sans-serif]">Faem Studio Collection</span>
          {/* Search Box */}
          <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
            <div className="w-full relative">
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
          </div>
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
