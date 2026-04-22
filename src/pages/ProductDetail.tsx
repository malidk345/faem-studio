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
        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5">
          <span className="text-lg font-bold">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{t('product.access_restricted')}</h2>
          <p className="text-zinc-500 max-w-sm text-[13px] leading-relaxed">
            {product?.error || t('product.error_desc')}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[220px]">
          <button onClick={() => window.location.reload()} className="bg-foreground text-background px-6 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-all">
            {t('product.retry')}
          </button>
          <button onClick={() => navigate('/shop')} className="text-zinc-500 px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:text-foreground transition-all">
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
              {/* Category */}
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">
                    {product.category} — {product.id?.substring(0,6).toUpperCase()}
                 </span>
              </div>

              {/* Name */}
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mt-1">
                {product.discount_price ? (
                  <>
                    <p className="text-xl font-bold tracking-tight text-rose-500">
                      {product.discount_price}
                    </p>
                    <p className="text-lg font-medium tracking-tight line-through text-zinc-600">
                      {product.price}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-black tracking-tight text-foreground">
                    {product.price}
                  </p>
                )}
              </div>

              {/* BUYING UI INTEGRATED */}
              <div className="flex flex-col gap-6 mt-8 pt-8 border-t border-white/5">
                {/* Size Selection Swatches */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">BEDEN SEÇ</span>
                    <button className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-foreground transition-colors">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 min-w-[60px] px-4 rounded-xl font-black text-xs transition-all border
                          ${selectedSize === size 
                            ? 'bg-foreground text-background border-foreground' 
                            : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20 hover:text-foreground'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  className="w-full h-16 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  Sepete Ekle
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={toggleWishlist} className="h-12 flex items-center justify-center gap-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                      <Heart size={14} className={isWishlisted ? 'fill-foreground text-foreground' : 'text-zinc-500'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Favorilere Ekle</span>
                   </button>
                   <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="h-12 flex items-center justify-center gap-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                      <Share2 size={14} className="text-zinc-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Paylaş</span>
                   </button>
                </div>
              </div>

              {/* Description & Technical Specs — Minimalist */}
              <div className="flex flex-col gap-8 mt-12">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ürün Açıklaması</span>
                  <p className="text-sm leading-relaxed text-zinc-400 font-medium">
                    {product.description}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Teknik Detaylar</span>
                    <div className="grid grid-cols-1 gap-y-3">
                      {product.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
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
      <div className="px-4 md:px-10 py-16 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {t('product.also_like')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group flex flex-col gap-3 text-left apple-card p-2 border-transparent hover:border-white/10 transition-all"
              >
                <div
                  className="w-full overflow-hidden rounded-xl bg-white/5"
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
                  <h4 className="text-sm font-bold tracking-tight text-foreground line-clamp-1">
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

      {/* Floating selection card hidden on desktop as it's integrated above */}
      <div className="md:hidden">
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
    </div>
  );
}
