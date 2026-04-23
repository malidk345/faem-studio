import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ProductSelectionCard from '../components/ProductSelectionCard';
import ProductInfoSections from '../components/ProductInfoSections';
import { GlobalPageLoader } from '../components/GlobalPageLoader';
import ReviewList from '../components/ReviewList';
import { ChevronLeft, ChevronRight, Heart, Loader2, Share2, MessageSquare, Ruler, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AnimatePresence } from 'motion/react';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductImage {
  id: string;
  url: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// When Medusa is connected, swap PRODUCTS.find() with the API call:
//
//   const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 })
//   const { product } = await medusa.products.retrieve(id)
//
//   Then map:
//     product.thumbnail   →  product.image
//     product.images      →  product.images (already ProductImage[])
//     product.variants    →  product.sizes
// ─────────────────────────────────────────────────────────────────────────────

// ─── IMAGE GALLERY ────────────────────────────────────────────────────────────
interface GalleryProps {
  images: ProductImage[];
  productName: string;
}

function ImageGallery({ images, productName }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [images]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    if (offsetWidth <= 0) return;
    const idx = Math.round(scrollLeft / offsetWidth);
    if (!isNaN(idx)) setActiveIndex(idx);
  };

  const scrollTo = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: idx * scrollRef.current.offsetWidth,
      behavior: 'smooth',
    });
    setActiveIndex(idx);
    const thumb = thumbsRef.current?.children[idx] as HTMLElement;
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < images.length - 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((img, i) => (
            <div key={img.id} className="flex-shrink-0 w-full snap-center">
              <div className="w-full relative rounded-lg overflow-hidden" style={{ paddingBottom: '133.33%', backgroundColor: '#FFFFFF' }}>
                <img
                  src={img.url}
                  alt={`${productName} — view ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </div>

        {canPrev && (
          <button
            onClick={() => scrollTo(activeIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl glass-nav active:scale-95 transition-transform"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canNext && (
          <button
            onClick={() => scrollTo(activeIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl glass-nav active:scale-95 transition-transform"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <div className="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg glass-nav">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div
          ref={thumbsRef}
          className="flex items-center justify-center gap-3 overflow-x-auto hide-scrollbar py-3 px-2"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollTo(i)}
              className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${i === activeIndex
                ? 'ring-2 ring-zinc-900 ring-offset-2 opacity-100 scale-105'
                : 'ring-1 ring-zinc-200 opacity-50 hover:opacity-100 hover:ring-zinc-300'
                }`}
              style={{ width: 56, aspectRatio: '3/4' }}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const { t } = useLanguage();

  useSEO({
    title: product?.name ? `${product.name} | Faem Studio` : t('product.details'),
    description: product?.description || t('shop.desc')
  });
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('S');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Size Recommender State
  const [showRecommender, setShowRecommender] = useState(false);
  const [userHeight, setUserHeight] = useState('');
  const [userWeight, setUserWeight] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const currentId = id || '';
    console.log("🔍 [ProductDetail] Initializing with ID:", currentId);

    if (!currentId) {
      console.warn("❌ [ProductDetail] No ID provided in URL.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      console.log("🛰️ [ProductDetail] Starting Supabase fetch...");
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase.from('products').select('*').eq('id', currentId).single();

        if (fetchError) {
          console.error("📋 [ProductDetail] Supabase Error:", fetchError);
          setProduct({ error: `Connection Error: ${fetchError.message} (${fetchError.details || 'No details'})` });
          return;
        }

        if (!data) {
          console.warn("⚠️ [ProductDetail] Product not found for ID:", currentId);
          setProduct({ error: "Archive Asset not found in database." });
          return;
        }

        console.log("✅ [ProductDetail] Data retrieved:", data.name);

        let galleryImages: ProductImage[] = [];
        const rawImages = Array.isArray(data.images) ? data.images : [];
        galleryImages = rawImages.map((img: any, idx: number) => {
          if (typeof img === 'string') return { id: `img-${idx}`, url: img };
          if (img && typeof img === 'object' && img.url) return { id: img.id || `img-${idx}`, url: img.url };
          return { id: `img-${idx}`, url: data.image_url || '' };
        });

        if (galleryImages.length === 0 && data.image_url) {
          galleryImages = [{ id: 'main', url: data.image_url }];
        }

        setProduct({
          id: data.id,
          name: data.name || 'Faem Piece',
          price: data.price || 'Price on request',
          image: data.image_url || '',
          images: galleryImages,
          category: data.category || 'Archive',
          collection: data.collection || '',
          sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['S', 'M', 'L'],
          description: data.description || 'Minimalist design from Faem studio.',
          features: Array.isArray(data.features) ? data.features : [],
          discount_price: data.discount_price || null
        });

        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (e: any) {
        console.error("🔥 [ProductDetail] Critical Component Crash:", e);
        setProduct({ error: `System Crash: ${e.message || 'Unknown Error'}` });
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlistStatus = async () => {
      if (!user || !id) return;
      try {
        const { data } = await supabase.from('wishlist').select('id').eq('user_id', user.id).eq('product_id', id).maybeSingle();
        setIsWishlisted(!!data);
      } catch (e) {
        console.error("📋 [ProductDetail] Wishlist Check Error:", e);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false });
        if (data) setReviews(data);
      } catch (e) {
        console.error("📋 [ProductDetail] Reviews Error:", e);
      }
    };

    fetchProduct();
    fetchWishlistStatus();
    fetchReviews();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', id);
        setIsWishlisted(false);
      } else {
        await supabase.from('wishlist').insert({ user_id: user.id, product_id: id });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Faem Studio',
      text: product?.description || 'Check out this piece from Faem Studio',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Sharing failed', err);
        // Fallback for failed share attempt
        navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const calculateSize = () => {
    const h = parseInt(userHeight);
    const w = parseInt(userWeight);
    if (!h || !w) return;

    let size = 'M';
    if (h < 165) {
      size = w < 60 ? 'S' : 'M';
    } else if (h < 178) {
      size = w < 75 ? 'M' : 'L';
    } else if (h < 188) {
      size = w < 88 ? 'L' : 'XL';
    } else {
      size = 'XL';
    }
    
    setRecommendedSize(size);
    if (product?.sizes?.includes(size)) {
      setSelectedSize(size);
    }
  };

  if (loading) return <GlobalPageLoader isLoading={true} />;

  if (!product || product.error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-background">
        <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-200">
          <span className="text-lg font-bold">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">{t('product.access_restricted')}</h2>
          <p className="text-neutral-400 max-w-sm text-[13px] leading-relaxed">
            {product?.error || t('product.error_desc')}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[220px]">
          <button onClick={() => window.location.reload()} className="bg-neutral-800 text-white px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-all">
            {t('product.retry')}
          </button>
          <button onClick={() => navigate('/shop')} className="text-neutral-400 px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:text-neutral-800 transition-all">
            {t('product.back_to_gallery')}
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      if (!product) return;

      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity,
      });
      setIsExpanded(false);
      setQuantity(1);
    } catch (err) {
      console.error("Add to Cart Error:", err);
    }
  };

  // Gallery images: use product.images if available, fallback to thumbnail
  // Medusa: replace with product.images from API response
  const galleryImages: ProductImage[] =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: 'thumb', url: product.image }];

  const related: any[] = []; // We'll handle related products via query later

  return (
    <div className="bg-white min-h-screen">

      {/* ─── GALLERY + INFO LAYOUT ─── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-24 md:pt-28 pb-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* LEFT: Image Gallery */}
          <div className="w-full">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <ImageGallery images={galleryImages} productName={product.name} />
            </motion.div>
          </div>

          {/* RIGHT: Product Info (sticky on desktop) */}
          <div className="flex flex-col gap-6" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
            <motion.div
              key={product.id + '_info'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Category / Collection */}
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                  {product.collection || 'ARCHIVE'}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
                  REF. {product.id?.substring(0, 6).toUpperCase()}
                </span>
              </div>

              {/* Name + Price */}
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  {product.discount_price ? (
                    <>
                      <p className="text-lg font-bold tracking-tight line-through text-zinc-400">
                        {product.price}
                      </p>
                      <p className="text-2xl font-black tracking-tight text-rose-600">
                        {product.discount_price}
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-black tracking-tight text-zinc-900">
                      {product.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Utility Grid - Refined Layout */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { icon: Heart, label: 'Kaydet', action: toggleWishlist, loading: wishlistLoading, active: isWishlisted },
                  { icon: Share2, label: 'Paylaş', action: handleShare },
                  { icon: MessageSquare, label: 'Yorum', action: () => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' }) },
                  { icon: Ruler, label: 'Beden', action: () => setShowRecommender(true) }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    disabled={item.loading}
                    className={`h-14 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all border
                      ${item.active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900'}`}
                  >
                    {item.loading ? <Loader2 size={16} className="animate-spin" /> : <item.icon size={16} className={item.active ? 'fill-current' : ''} />}
                    <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Description & Technical Specs — Flat & Compact Style */}
              <div className="flex flex-col gap-8 mt-10">
                <div className="relative">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block mb-4 border-b border-zinc-50 pb-2">Ürün Açıklaması</span>
                  <p className="text-[13px] leading-relaxed text-zinc-600 font-medium whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="relative">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 block mb-4 border-b border-zinc-50 pb-2">Teknik Detaylar</span>
                    <div className="grid grid-cols-1 gap-y-3">
                      {product.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-zinc-200" />
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── REVIEWS ─── */}
      <div id="reviews-section" className="max-w-[800px] mx-auto px-4 md:px-10 pb-16">
        <ReviewList productId={product.id} reviews={reviews} />
      </div>

      {/* ─── INFO SECTIONS ─── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pb-20">
        <ProductInfoSections />
      </div>

      {/* ─── RELATED ─── */}
      <div className="px-4 md:px-10 py-16">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
            {t('product.also_like')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group flex flex-col gap-3 text-left apple-card p-2 border-transparent hover:border-zinc-200 transition-all"
              >
                <div
                  className="w-full overflow-hidden rounded-xl bg-zinc-50"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="px-2 pb-2">
                  <h4 className="text-sm font-bold tracking-tight text-zinc-900 line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-xs font-bold text-zinc-500 mt-1">
                    {p.price}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed floating selection card */}
      <ProductSelectionCard
        product={product}
        quantity={quantity}
        selectedSize={selectedSize}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        setSelectedSize={setSelectedSize}
        handleDecrease={() => setQuantity(q => Math.max(1, q - 1))}
        handleIncrease={() => setQuantity(q => q + 1)}
        handleAddToCart={handleAddToCart}
      />

      {/* Size Recommender Modal — Compact & Mobile Optimized */}
      <AnimatePresence>
        {showRecommender && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecommender(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed bottom-0 left-0 right-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto w-full md:max-w-[360px] bg-white z-[201] p-6 md:p-8 rounded-t-[32px] md:rounded-[32px] shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-tighter uppercase">Beden Önerisi</h3>
                  </div>
                  <button onClick={() => setShowRecommender(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 ml-1">Boy (cm)</label>
                    <input 
                      type="number"
                      inputMode="numeric"
                      placeholder="180"
                      value={userHeight}
                      onChange={(e) => setUserHeight(e.target.value)}
                      className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[16px] font-bold focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 ml-1">Kilo (kg)</label>
                    <input 
                      type="number"
                      inputMode="numeric"
                      placeholder="75"
                      value={userWeight}
                      onChange={(e) => setUserWeight(e.target.value)}
                      className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[16px] font-bold focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                {recommendedSize && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 bg-zinc-900 rounded-xl text-center"
                  >
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em]">Önerilen</span>
                    <p className="text-2xl font-black text-white mt-1 tracking-tighter">{recommendedSize}</p>
                  </motion.div>
                )}

                <Button 
                  onClick={calculateSize}
                  className="w-full h-12 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Hesapla
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl z-[300] backdrop-blur-xl"
          >
            Bağlantı Panoya Kopyalandı
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
