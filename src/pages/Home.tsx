import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'Collection 001',
    headline: ['The Silk', 'Narrative'],
    sub: 'Summer 26 — Woven from silence and light.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 2,
    tag: 'Collection 002',
    headline: ['Structured', 'Precision'],
    sub: 'Modern / Minimal — Architecture in cloth.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 3,
    tag: 'Collection 003',
    headline: ['Essential', 'Luxe'],
    sub: 'Cashmere Staples — The warmth of restraint.',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1600&auto=format&fit=crop',
  },
];

const MARQUEE_ITEMS = [
  'Free Global Shipping', '·', 'Handcrafted Precision', '·',
  'Sustainable Materials', '·', '30-Day Returns', '·',
  'Two-Year Warranty', '·', 'Studio-Grade Quality', '·',
];

// Accent warm brown
const ACCENT = '#000000';

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
  const BG = '#FFFFFF';
  const ACCENT = '#000000';

  React.useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from('products').select('*').limit(4);
      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url,
          category: p.category
        })));
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div style={{ backgroundColor: BG }}>

      {/* ─── HERO ─── */}
      <section className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <motion.img
              src={slide.image}
              alt={slide.headline.join(' ')}
              className="w-full h-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: 'easeOut' }}
            />
            {/* Gradient fades to cream at bottom */}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 0%, ${BG}55 20%, transparent 60%)` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG}99 0%, transparent 50%)` }} />
            {/* Top dark tint for text readability */}
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 px-6 md:px-16 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '_c'}
              className="flex flex-col gap-5 max-w-3xl"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[10px] uppercase tracking-[0.5em] font-bold" style={{ color: ACCENT }}>
                {slide.tag}
              </span>
              <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-black tracking-[-0.04em] leading-[0.88] text-white drop-shadow-lg">
                {slide.headline.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
              <p className="text-white/60 text-[15px] md:text-[17px] font-light max-w-md drop-shadow">
                {slide.sub}
              </p>
              <div className="flex items-center gap-5 mt-2">
                <Link to="/shop" className="group flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.2em] bg-white text-black rounded-xl px-7 py-3.5 hover:bg-black hover:text-white transition-all shadow-lg active:scale-95">
                  {t('home.explore')}
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide controls */}
          <div className="absolute right-8 md:right-16 bottom-20 md:bottom-28 flex flex-col items-end gap-4">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setActiveSlide(i)} className="flex items-center gap-3 group">
                <span className={`text-[10px] font-bold tracking-widest transition-colors ${i === activeSlide ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={`h-[1px] transition-all ${i === activeSlide ? 'w-10 bg-white' : 'w-4 bg-white/30 group-hover:w-6'}`} />
              </button>
            ))}
          </div>
        </div>
      </section>


      {/* ─── PRODUCT GRID — immediately after hero ─── */}
      <section className="px-4 md:px-12 lg:px-20 pt-12 pb-20 max-w-[1600px] mx-auto">

        {/* Section label */}
        <div className="flex items-center justify-between mb-8 pb-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: ACCENT }}>
              {t('home.current')}
            </p>
            <h2 className="text-[22px] md:text-[28px] font-black tracking-[-0.03em] text-black leading-none">
              {t('shop.title')}
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-bold text-black/30 hover:text-black transition-colors group"
          >
            {t('home.all_pieces')} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              rating={4.8}
              reviewCount={1800}
            />
          ))}
        </div>
      </section>


      {/* ─── BRAND STATEMENT ─── */}
      <section className="relative overflow-hidden py-40 px-6 md:px-16 bg-white border-y" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <p className="text-[10px] uppercase tracking-[0.5em] font-bold mb-12" style={{ color: ACCENT }}>
            {t('home.studio_notes')}
          </p>
          <blockquote className="text-[clamp(1.75rem,4.5vw,4rem)] font-light text-black/55 leading-[1.3] tracking-[-0.02em] max-w-5xl italic">
            {t('home.quote')}
          </blockquote>
          <p className="text-black/20 text-[12px] tracking-[0.3em] uppercase font-bold mt-10">
            — Faem Studio, 2026
          </p>
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <footer className="border-t px-6 md:px-16 pt-24 pb-16 max-w-[1400px] mx-auto" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-24">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.04em] text-black">{t('footer.newsletter_title')}</h2>
              <p className="text-black/40 text-[15px] mt-3 font-light max-w-sm leading-relaxed">
                {t('footer.newsletter_desc')}
              </p>
            </div>
            <div className="flex gap-3 max-w-sm">
              <input
                type="email"
                placeholder={t('footer.newsletter_placeholder')}
                className="flex-1 bg-white border px-5 py-4 rounded-xl text-black text-sm placeholder:text-black/25 focus:outline-none transition-all font-light"
                style={{ borderColor: 'rgba(0,0,0,0.10)' }}
              />
              <button className="px-6 py-4 rounded-xl text-[13px] font-bold tracking-wide transition-all active:scale-95 text-white bg-black hover:bg-zinc-800">
                {t('footer.newsletter_button')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 md:pt-4">
            {[
              { label: t('footer.studio'), links: [
                { label: t('footer.story'), path: '#' },
                { label: t('footer.process'), path: '#' },
                { label: t('footer.sustainability'), path: '#' },
                { label: t('footer.locations'), path: '#' }
              ]},
              { label: t('footer.support'), links: [
                { label: t('footer.shipping_info'), path: '#' },
                { label: t('footer.returns_info'), path: '#' },
                { label: t('footer.care'), path: '#' },
                { label: t('nav.contact_us'), path: '#' }
              ]},
            ].map(col => (
              <div key={col.label} className="flex flex-col gap-5">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: 'rgba(0,0,0,0.25)' }}>
                  {col.label}
                </span>
                <nav className="flex flex-col gap-3">
                  {col.links.map(link => (
                    <a key={link.label} href={link.path} className="text-[14px] text-black/40 hover:text-black transition-colors font-light">{link.label}</a>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t flex justify-between items-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <span className="text-[11px] text-black/20 uppercase tracking-[0.3em] font-bold">© 2026 Faem Studio</span>
          <div className="flex gap-8">
            <a href="#" className="text-[11px] text-black/20 hover:text-black/60 uppercase tracking-[0.25em] font-bold transition-colors">Instagram</a>
            <a href="#" className="text-[11px] text-black/20 hover:text-black/60 uppercase tracking-[0.25em] font-bold transition-colors">{t('footer.terms')}</a>
            <a href="#" className="text-[11px] text-black/20 hover:text-black/60 uppercase tracking-[0.25em] font-bold transition-colors">{t('footer.privacy')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
