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
  const [slides, setSlides] = useState<any[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);

  const fallbackSlides = [
    {
      id: 1,
      tag: 'ARCHIVE_001 // CORE',
      headline: t('home.hero_1_title').split('\n'),
      sub: t('home.hero_1_sub'),
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      link: '/shop'
    }
  ];

  const currentSlides = slides.length > 0 ? slides : fallbackSlides;
  const slide = currentSlides[activeSlide] || fallbackSlides[0];

  useEffect(() => {
    const fetchContent = async () => {
      // Fetch Products
      const { data: pData } = await supabase.from('products').select('*').limit(4);
      if (pData) {
        setProducts(pData.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url,
          images: p.images || [],
          category: p.category,
          discount_price: p.discount_price
        })));
      }

      // Fetch Hero Slides from CMS
      const { data: sData } = await supabase
        .from('site_content')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
        
      if (sData && sData.length > 0) {
        setSlides(sData.map(s => ({
          id: s.id,
          tag: s.subtitle || 'FAEM STUDIO',
          headline: (s.title || '').split('\n'),
          sub: s.subtitle,
          image: s.image_url,
          link: s.button_link === 'all' || !s.button_link ? '/shop' : `/shop?category=${s.button_link}`,
          buttonText: s.button_text || 'ARŞİVİ KEŞFET'
        })));
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
  }, [currentSlides.length]);

  return (
    <div className="bg-white text-foreground transition-colors duration-500 overflow-x-hidden">

      {/* ─── SINEMATIK HERO ─── */}
      <section className="relative h-screen overflow-hidden">
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
              className="w-full h-full object-cover grayscale-[0.1]"
              style={{ willChange: "transform" }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content: Editorial & Technical */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <AnimatePresence mode="wait">
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
                {slide.headline.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>

              <div className="flex justify-center mt-12">
                <Link 
                  to={slide.link} 
                  className="group relative overflow-hidden bg-white/95 backdrop-blur-xl text-black px-12 py-5 rounded-[2px] transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-6">
                    <span className="text-[20px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">{slide.buttonText || 'ARŞİVİ KEŞFET'}</span>
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform opacity-40 group-hover:opacity-100" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 hidden md:flex">
            {currentSlides.length > 1 && currentSlides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSlide(i)} 
                className="group flex flex-col items-center gap-2"
              >
                <span className={`text-[12px] font-normal font-['Handjet',sans-serif] transition-all ${i === activeSlide ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>0{i + 1}</span>
                <div className={`h-[40px] w-[1px] transition-all duration-700 ${i === activeSlide ? 'bg-white h-[60px]' : 'bg-white/10 group-hover:bg-white/30'}`} />
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


      {/* ─── FEATURED ARCHIVE ─── */}
      <section className="py-32 md:py-48 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
          <div className="flex flex-col gap-4">
            <span className="text-[14px] font-normal uppercase tracking-[0.4em] text-black/20 font-['Handjet',sans-serif]">
              {t('home.current')}
            </span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tighter text-black leading-none">
              Öne Çıkan Arşiv
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-4 text-[18px] font-normal uppercase tracking-[0.05em] text-black/30 hover:text-black transition-all group font-['Handjet',sans-serif]"
          >
            TÜM KOLEKSİYON <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-24">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
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
