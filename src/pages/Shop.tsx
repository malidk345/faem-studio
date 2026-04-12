import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { Skeleton } from '../components/ui/Skeleton';
interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  images?: string[];
  sizes?: string[];
  features?: string[];
}
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

export default function Shop() {
  const { t } = useLanguage();

  useSEO({
    title: `${t('shop.title')} | Faem Studio`,
    description: t('shop.desc')
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from Supabase (fallback to seeded offline products if no connection)
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error || !data || data.length === 0) {
          setProducts([]);
        } else {
          // Map DB columns to our Product interface
          const mapped = data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            images: p.images || [],
            category: p.category,
            sizes: p.sizes || ['One Size'],
            description: p.description,
            features: p.features || []
          }));
          setProducts(mapped);
        }
      } catch {
         setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-black/5 pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/50">
            {t('shop.archive_current')}
          </p>
          <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter leading-none text-black">
            {t('shop.title')}
          </h1>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-black/5 text-black hover:bg-black/10'
              }`}
            >
              {cat === 'All' ? t('shop.all_categories') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/3 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16"
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}

            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center text-black/40 text-sm font-medium"
              >
                {t('shop.no_items')}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

    </div>
  );
}
