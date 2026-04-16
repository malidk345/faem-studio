import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ProductSelectionCard from '../components/ProductSelectionCard';
import ProductInfoSections from '../components/ProductInfoSections';
import { GlobalPageLoader } from '../components/GlobalPageLoader';
import ReviewList from '../components/ReviewList';
import { ChevronLeft, ChevronRight, Heart, Loader2, Share2, MessageSquare, Ruler } from 'lucide-react';
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
              <div className="w-full relative rounded-lg overflow-hidden" style={{ paddingBottom: '133.33%', backgroundColor: '#E8E5E0' }}>
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
          className="flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar py-1 px-2"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollTo(i)}
              className={`flex-shrink-0 rounded-lg overflow-hidden border transition-all duration-300 ${
                i === activeIndex
                  ? 'border-neutral-800 opacity-100 scale-105'
                  : 'border-transparent opacity-30 hover:opacity-50'
              }`}
              style={{ width: 48, aspectRatio: '3/4' }}
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
    <div className="bg-background min-h-screen">

      {/* ─── GALLERY + INFO LAYOUT ─── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-24 md:pt-28 pb-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* LEFT: Image Gallery */}
          <div className="w-full">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <ImageGallery images={galleryImages} productName={product.name} />
            </motion.div>
          </div>

          {/* RIGHT: Product Info (sticky on desktop) */}
          <div className="flex flex-col gap-6" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
            <motion.div
              key={product.id + '_info'}
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Category */}
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">
                {product.category}
              </p>

              {/* Name + Price */}
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[clamp(1.4rem,4vw,2.2rem)] font-bold tracking-[-0.04em] text-neutral-800 leading-[0.95]">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  {product.discount_price ? (
                    <>
                      <p className="text-[15px] font-bold tracking-tighter line-through text-neutral-300">
                        {product.price}
                      </p>
                      <p className="text-[20px] font-bold tracking-tighter text-rose-600">
                        {product.discount_price}
                      </p>
                    </>
                  ) : (
                    <p className="text-[16px] font-bold tracking-tighter text-neutral-800">
                      {product.price}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Quick Actions Panel ── */}
              <div className="flex items-center gap-0 rounded-2xl border border-neutral-300 bg-neutral-50 overflow-hidden">
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${
                    isWishlisted 
                      ? 'bg-neutral-800 text-white' 
                      : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700'
                  }`}
                >
                  {wishlistLoading 
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Heart size={12} className={isWishlisted ? 'fill-current' : ''} />
                  }
                  {isWishlisted ? 'Kaydedildi' : 'Kaydet'}
                </button>

                <div className="w-px h-7 bg-neutral-200" />

                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                >
                  <Share2 size={12} />
                  Paylaş
                </button>

                <div className="w-px h-6 bg-neutral-200" />

                <button
                  onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                >
                  <MessageSquare size={12} />
                  Yorum
                </button>

                <div className="w-px h-6 bg-neutral-200" />

                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                >
                  <Ruler size={12} />
                  Beden
                </button>
              </div>

              {/* Description & Technical Specs — Compact */}
              <div className="flex flex-col gap-2.5 mt-4">
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 block mb-2.5">Açıklama</span>
                  <p className="text-[13px] leading-relaxed text-neutral-500">
                    {product.description}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 block mb-2.5">Özellikler</span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {product.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="text-[12px] font-medium text-neutral-500 tracking-tight">{f}</span>
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
      <div className="px-4 md:px-10 py-16 border-t border-neutral-200">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">
            {t('product.also_like')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
            {related.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group flex flex-col items-center gap-2.5 text-left"
              >
                <div
                  className="w-full overflow-hidden rounded-lg"
                  style={{ aspectRatio: '3/4', backgroundColor: '#E8E5E0' }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <h4 className="text-[13px] font-medium tracking-tight text-neutral-600 group-hover:text-neutral-800 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-[13px] font-bold text-neutral-800">
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
    </div>
  );
}
