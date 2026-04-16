import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  useSEO({
    title: `Faem Studio | ${t('nav.collection')}`,
    description: t('shop.desc')
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  const HERO_SLIDES = [
    {
      id: 1,
      tag: 'Collection 001',
      headline: t('home.hero_1_title').split('\n'),
      sub: t('home.hero_1_sub'),
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    },
    {
      id: 2,
      tag: 'Collection 002',
      headline: t('home.hero_2_title').split('\n'),
      sub: t('home.hero_2_sub'),
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1600&auto=format&fit=crop',
    },
    {
      id: 3,
      tag: 'Collection 003',
      headline: t('home.hero_3_title').split('\n'),
      sub: t('home.hero_3_sub'),
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1600&auto=format&fit=crop',
    },
  ];

  const slide = HERO_SLIDES[activeSlide];

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from('products').select('*').limit(4);
      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url,
          images: p.images || [],
          category: p.category,
          discount_price: p.discount_price
        })));
      }
    };
    fetchFeatured();

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [HERO_SLIDES.length]);

  return (
    <div className="bg-background text-foreground transition-colors duration-500 font-sans">

      {/* ─── EDITORIAL HERO ─── */}
      <section className="relative h-[92vh] md:h-[95vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img
              src={slide.image}
              alt={slide.headline.join(' ')}
              className="w-full h-full object-cover"
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Subtle luxury vignette */}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content: Centered & Editorial */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '_content'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl"
            >
              <span className="text-[11px] uppercase tracking-[0.6em] font-semibold text-white/70 mb-8 block drop-shadow-sm">
                {slide.tag}
              </span>
              <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-serif italic tracking-tight leading-[0.95] text-white drop-shadow-xl mb-10">
                {slide.headline.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
              <p className="text-white/80 text-[16px] md:text-[18px] font-medium max-w-xl mx-auto drop-shadow-md mb-12">
                {slide.sub}
              </p>
              <div className="flex justify-center">
                <Link 
                  to="/shop" 
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-md text-black px-10 py-4 rounded-full text-[12px] font-bold uppercase tracking-[0.25em] transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t('home.explore')}
                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Minimal Slide Indicators */}
          <div className="absolute bottom-12 flex gap-4">
            {HERO_SLIDES.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSlide(i)} 
                className="group p-2"
              >
                <div className={`h-[2px] transition-all duration-700 ${i === activeSlide ? 'w-12 bg-white' : 'w-4 bg-white/30 group-hover:bg-white/60'}`} />
              </button>
            ))}
          </div>
        </div>
      </section>


      {/* ─── FEATURED ARCHIVE ─── */}
      <section className="py-24 md:py-36 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.5em] font-bold text-neutral-400">
              {t('home.current')}
            </span>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-serif tracking-tight text-neutral-800 leading-none">
              Featured Archive
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-bold text-neutral-400 hover:text-neutral-800 transition-colors group"
          >
            {t('home.all_pieces')} <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>


      {/* ─── STUDIO NOTES ─── */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 bg-secondary flex justify-center items-center text-center">
        <div className="max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.4em] font-bold mb-8 text-neutral-300">
            {t('home.studio_notes')}
          </p>
          <blockquote className="text-[clamp(1.5rem,4vw,2.5rem)] font-serif italic text-neutral-800 leading-[1.3] tracking-tight">
            "{t('home.quote')}"
          </blockquote>
          <div className="w-8 h-px bg-neutral-300 mx-auto mt-8 mb-4" />
          <p className="text-neutral-300 text-[9px] tracking-[0.4em] uppercase font-bold">
            Studio Narrative, 2026
          </p>
        </div>
      </section>

    </div>
  );
}
