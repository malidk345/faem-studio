import React, { useState, useEffect } from 'react';
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
  description: string;
  images?: string[];
  sizes?: string[];
  features?: string[];
  discount_price?: string;
}

export default function Shop() {
  const { t } = useLanguage();

  useSEO({
    title: `${t('shop.title')} | Faem Studio`,
    description: t('shop.desc')
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error || !data || data.length === 0) {
          setProducts([]);
        } else {
          const mapped = data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            images: p.images || [],
            category: p.category,
            sizes: p.sizes || ['One Size'],
            description: p.description,
            features: p.features || [],
            discount_price: p.discount_price
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

  if (isLoading) return <GlobalPageLoader isLoading={true} />;

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Editorial Heading Section */}
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-16 md:mb-24">
          <p className="text-[11px] uppercase tracking-[0.45em] font-bold text-neutral-400">
            {t('shop.archive_current')}
          </p>
          <h1 className="text-[clamp(1.5rem,6vw,3.5rem)] font-serif tracking-tight leading-[1.1] text-neutral-800">
            {activeCategory === 'All' ? t('shop.title') : activeCategory}
          </h1>
          
          {/* Minimal Filter Row */}
          <div className="flex items-center gap-6 md:gap-10 mt-4 overflow-x-auto hide-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[12px] font-semibold uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 relative pb-1
                  ${activeCategory === cat
                    ? 'text-neutral-900 border-b border-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-600 border-b border-transparent'
                  }`}
              >
                {cat === 'All' ? t('shop.all_categories') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Spacious Product Grid */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-10 md:gap-y-20"
            >
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: i * 0.04,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
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
        </div>
      </div>
    </div>
  );
}
