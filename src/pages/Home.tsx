import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight, X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';
import { GlobalPageLoader } from '../components/GlobalPageLoader';

export default function Home() {
  const { t } = useLanguage();

  useSEO({
    title: `Faem Studio | ${t('nav.collection')}`,
    description: t('shop.desc')
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCollection, setActiveCollection] = useState('All');
  const [availableCats, setAvailableCats] = useState<string[]>(['All']);
  const [availableColls, setAvailableColls] = useState<string[]>(['All']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const currentSlides = slides;
  const slide = currentSlides[activeSlide] || null;

  useEffect(() => {
    const fetchContent = async () => {
      // Fetch Products with selective columns for performance
      let query = supabase
        .from('products')
        .select('id, name, price, image_url, category, collection, discount_price, description, images, features, sizes')
        .limit(20)
        .order('created_at', { ascending: false });

      const { data: pData } = await query;
      if (pData) {
        setProducts(pData.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url,
          images: p.images || [],
          category: p.category,
          collection: p.collection,
          discount_price: p.discount_price
        })));
      }

      // Fetch Meta for Filter
      const [catRes, collRes] = await Promise.all([
        supabase.from('categories').select('name'),
        supabase.from('collections').select('name')
      ]);
      if (catRes.data) setAvailableCats(['All', ...catRes.data.map(c => c.name)]);
      if (collRes.data) setAvailableColls(['All', ...collRes.data.map(c => c.name)]);

      // Fetch Hero Slides from CMS
      const { data: sData } = await supabase
        .from('site_content')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
        
      if (sData && sData.length > 0) {
        const mappedSlides = sData.map(s => ({
          id: s.id,
          tag: s.subtitle || 'FAEM STUDIO',
          headline: (s.title || '').split('\n'),
          sub: s.subtitle,
          image: s.image_url,
          link: s.button_link === 'all' || !s.button_link ? '/shop' : `/shop?collection=${s.button_link}`,
          buttonText: s.button_text || 'ARŞİVİ KEŞFET'
        }));
        setSlides(mappedSlides);

        // ── Preload First Image Before Dismissing Loader ──
        if (mappedSlides.length > 0) {
          const firstImg = new Image();
          firstImg.src = mappedSlides[0].image;
          await new Promise((resolve) => {
            firstImg.onload = resolve;
            firstImg.onerror = resolve;
          });
        }

        // Preload others in background
        mappedSlides.slice(1).forEach((s: any) => {
          const img = new Image();
          img.src = s.image;
        });
      }
      setLoadingSlides(false);
    };
    fetchContent();

    const interval = setInterval(() => {
      if (currentSlides.length > 1) {
        setActiveSlide((prev) => (prev + 1) % currentSlides.length);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [currentSlides.length, activeCategory, activeCollection]);

  if (loadingSlides && slides.length === 0) {
    return <GlobalPageLoader isLoading={true} />;
  }

  return (
    <div className="bg-white text-foreground transition-colors duration-500 overflow-x-hidden">

      {/* ─── SINEMATIK HERO ─── */}
      <section className="relative h-screen overflow-hidden bg-zinc-950">
        <AnimatePresence initial={false}>
          {slide && (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <motion.img
                src={slide.image}
                alt={slide.headline.join(' ')}
                className="w-full h-full object-cover grayscale-[0.05]"
                style={{ willChange: "transform" }}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Content: Editorial & Technical */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <AnimatePresence mode="wait">
            {slide && (
              <motion.div
                key={slide.id + '_content'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-5xl"
              >
                <div className="flex flex-col items-center gap-6 mb-10">
                  <span className="text-[14px] font-normal uppercase tracking-[0.4em] text-white/50 font-['Handjet',sans-serif] drop-shadow-sm">
                    {slide.tag}
                  </span>
                  <div className="w-[1px] h-12 bg-white/20" />
                </div>

                <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-bold tracking-tighter leading-[0.9] text-white drop-shadow-2xl mb-12">
                  {slide.headline.map((line: string, i: number) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </h1>

                <div className="flex justify-center mt-12">
                  <Link 
                    to={slide.link} 
                    className="group relative overflow-hidden bg-transparent border border-white/40 text-white px-10 py-3.5 rounded-[4px] transition-all hover:bg-white hover:text-black hover:border-white active:scale-95 shadow-xl"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em]">{slide.buttonText || 'Keşfet'}</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── INDICATORS (Mobile: Horizontal Bottom, Desktop: Vertical Right) ─── */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 md:hidden">
            {currentSlides.length > 1 && currentSlides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSlide(i)}
                className={`transition-all duration-500 ease-in-out ${
                  i === activeSlide ? 'w-10 h-1 bg-white rounded-none' : 'w-2 h-2 bg-white/20 rounded-none'
                }`}
              />
            ))}
          </div>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 hidden md:flex z-20">
            {currentSlides.length > 1 && currentSlides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSlide(i)} 
                className="group flex flex-col items-center gap-2"
              >
                <span className={`text-[10px] font-bold transition-all ${i === activeSlide ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>0{i + 1}</span>
                <div className={`w-[1px] transition-all duration-700 ${i === activeSlide ? 'bg-white h-[60px]' : 'bg-white/10 group-hover:bg-white/30 h-[30px]'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Hero Bottom Info (Handjet Style) */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-1 hidden md:flex">
           <span className="text-[12px] font-normal text-white/40 font-['Handjet',sans-serif] uppercase tracking-widest">Global Archive Control</span>
           <span className="text-[12px] font-normal text-white/20 font-['Handjet',sans-serif] uppercase tracking-widest leading-none">Status: // ONLINE</span>
        </div>
      </section>


      {/* ─── LATEST PRODUCTS SECTION ─── */}
      <section className="pt-20 pb-32 px-4 lg:px-8 max-w-[1500px] mx-auto">
        <div className="flex justify-center mb-12">
          <div className="relative">
            <span className="relative z-10 text-[32px] md:text-[42px] font-bold uppercase tracking-[0.05em] text-black font-['Handjet',sans-serif] leading-none">
              LATEST PRODUCTS
            </span>
            {/* Masterful Asymmetric Blue Stripe */}
            <motion.div 
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="absolute -left-12 -right-8 top-1/2 -translate-y-1/2 h-[20px] bg-blue-600/10 -skew-x-[20deg] origin-left z-0"
            />
            <div className="absolute -left-16 -right-12 top-1/2 -translate-y-1/2 h-[1px] bg-blue-400/20 -skew-x-[20deg] z-0" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center mt-24">
          <Link
            to="/shop"
            className="flex items-center gap-4 text-[18px] font-normal uppercase tracking-[0.05em] text-black/30 hover:text-black transition-all group font-['Handjet',sans-serif]"
          >
            TÜM KOLEKSİYON <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>


      {/* ─── STUDIO QUOTE ─── */}
      <section className="relative overflow-hidden py-32 md:py-48 px-6 bg-[#f7f6f4] flex justify-center items-center text-center">
        <div className="max-w-4xl flex flex-col items-center">
          <span className="text-[12px] font-normal uppercase tracking-[0.4em] mb-12 text-black/20 font-['Handjet',sans-serif]">
            {t('home.studio_notes')} // VOL.01
          </span>
          <blockquote className="text-[clamp(1.4rem,3vw,2.5rem)] font-bold text-black leading-[1.2] tracking-tighter mb-16">
            "{t('home.quote')}"
          </blockquote>
          <div className="w-12 h-[1px] bg-black/10 mb-6" />
          <p className="text-black/30 text-[12px] tracking-[0.4em] uppercase font-normal font-['Handjet',sans-serif]">
            Faem Studio Narrative // 2026
          </p>
        </div>
      </section>

    </div>
  );
}
