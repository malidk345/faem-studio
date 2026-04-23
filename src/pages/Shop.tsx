import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { GlobalPageLoader } from '../components/GlobalPageLoader';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

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
          <span className="text-[10px] font-normal tracking-[0.4em] text-black/20 font-['Handjet',sans-serif]">Technical Archive</span>
          <h1 className="text-[clamp(1.5rem,5vw,2.8rem)] font-bold tracking-tighter leading-none text-black">
            {activeCollection !== 'All' ? activeCollection : (activeCategory === 'All' ? t('shop.title') : activeCategory)}
          </h1>
          
          {/* Multi-Filter Row */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-6 md:gap-10 overflow-x-auto hide-scrollbar pb-2 border-b border-zinc-50">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 shrink-0">Kategori</span>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveCollection('All'); // Reset collection when changing category? Or keep both?
                    setPage(0);
                    setIsLoading(true);
                  }}
                  className={`text-[12px] font-semibold tracking-[0.2em] whitespace-nowrap transition-all duration-300 relative pb-1
                    ${activeCategory === cat
                      ? 'text-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                >
                  {cat === 'All' ? 'TÜMÜ' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 md:gap-10 overflow-x-auto hide-scrollbar pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 shrink-0">Koleksiyon</span>
              {availableCollections.map(coll => (
                <button
                  key={coll}
                  onClick={() => {
                    setActiveCollection(coll);
                    setActiveCategory('All');
                    setPage(0);
                    setIsLoading(true);
                  }}
                  className={`text-[12px] font-semibold tracking-[0.2em] whitespace-nowrap transition-all duration-300 relative pb-1
                    ${activeCollection === coll
                      ? 'text-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                >
                  {coll === 'All' ? 'TÜMÜ' : coll}
                </button>
              ))}
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
