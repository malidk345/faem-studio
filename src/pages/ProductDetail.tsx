import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ProductSelectionCard from '../components/ProductSelectionCard';
import ProductInfoSections from '../components/ProductInfoSections';
import ReviewList from '../components/ReviewList';
import { ChevronLeft, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';

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

const ACCENT = '#000000';
const BG = '#FFFFFF';

// ─── IMAGE GALLERY ────────────────────────────────────────────────────────────
// Accepts images from product.images (Medusa ProductImage[])
// Falls back to [{ id: 'thumb', url: product.image }] if array is empty
interface GalleryProps {
  images: ProductImage[];
  productName: string;
}

function ImageGallery({ images, productName }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Reset gallery when product changes (images prop changes)
  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [images]);

  // Sync scroll position → active index
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    if (offsetWidth <= 0) return; // Prevent division by zero
    const idx = Math.round(scrollLeft / offsetWidth);
    if (!isNaN(idx)) {
      setActiveIndex(idx);
    }
  };

  // Programmatic scroll to index
  const scrollTo = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: idx * scrollRef.current.offsetWidth,
      behavior: 'smooth',
    });
    setActiveIndex(idx);
    // Scroll thumbnail into view
    const thumb = thumbsRef.current?.children[idx] as HTMLElement;
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < images.length - 1;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Main scrollable image strip ── */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              className="flex-shrink-0 w-full snap-center"
            >
              {/* Padding-bottom trick: reliable cross-browser aspect ratio 3:4 */}
              <div className="w-full relative" style={{ paddingBottom: '133.33%', backgroundColor: '#E8E5E0' }}>
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

        {/* Prev / Next arrow buttons */}
        {canPrev && (
          <button
            onClick={() => scrollTo(activeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(245,244,240,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)' }}
            aria-label="Previous image"
          >
            <ChevronLeft size={18} style={{ color: '#1A1A1A' }} />
          </button>
        )}
        {canNext && (
          <button
            onClick={() => scrollTo(activeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(245,244,240,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)' }}
            aria-label="Next image"
          >
            <ChevronRight size={18} style={{ color: '#1A1A1A' }} />
          </button>
        )}

        {/* Image counter */}
        <div
          className="absolute bottom-4 right-4 text-[11px] font-bold px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'rgba(245,244,240,0.9)', backdropFilter: 'blur(8px)', color: '#1A1A1A' }}
        >
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-1"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollTo(i)}
              className="flex-shrink-0 transition-all duration-200"
              style={{
                width: 64,
                aspectRatio: '3/4',
                borderRadius: 10,
                overflow: 'hidden',
                outline: i === activeIndex
                  ? `2px solid ${ACCENT}`
                  : '2px solid transparent',
                outlineOffset: 2,
                opacity: i === activeIndex ? 1 : 0.45,
              }}
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
          features: Array.isArray(data.features) ? data.features : []
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

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
        <div className="flex flex-col items-center gap-1">
          <p className="font-black text-[10px] uppercase tracking-[0.4em]">Establishing Link</p>
          <span className="text-[9px] text-zinc-400 font-mono">ID: {id}</span>
        </div>
      </div>
    );
  }

  if (!product || product.error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-white">
        <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-rose-500 border border-zinc-100 shadow-sm">
           <span className="text-xl font-black">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Access Restricted</h2>
          <p className="text-zinc-500 max-w-sm text-[13px] leading-relaxed font-medium">
             {product?.error || "The requested item could not be retrieved from the studio vault."}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
            Retry Connection
          </button>
          <button onClick={() => navigate('/')} className="text-zinc-400 px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:text-black transition-all">
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  useSEO({
    title: product?.name ? `${product.name} | Faem Studio` : 'Product Details',
    description: product?.description || 'Faem Studio collection Item'
  });

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
    <div style={{ backgroundColor: BG }}>

      {/* ─── GALLERY + INFO LAYOUT ─── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 pt-32 md:pt-40 pb-16">
        
        {/* Wishlist Toggle (Floating Corner) */}
        <div className="flex justify-start mb-8">
            <button 
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/[0.02] hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
            >
              {wishlistLoading ? (
                 <Loader2 size={18} className="animate-spin text-black/20 group-hover:text-white/20" />
              ) : (
                 <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500 group-hover:fill-white group-hover:text-white' : 'text-black/30 group-hover:text-white'} />
              )}
              <span className="text-[10px] uppercase font-black tracking-widest leading-none">
                {isWishlisted ? 'Saved to Collection' : 'Add to Selection'}
              </span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

          {/* LEFT: Image Gallery */}
          <div className="w-full">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <ImageGallery images={galleryImages} productName={product.name} />
            </motion.div>
          </div>

          {/* RIGHT: Product Info (sticky on desktop) */}
          <div className="flex flex-col gap-8" style={{ position: 'sticky', top: '120px', alignSelf: 'start' }}>
            <motion.div
              key={product.id + '_info'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              {/* Category */}
              <p className="text-[10px] uppercase tracking-[0.5em] font-bold" style={{ color: ACCENT }}>
                {product.category}
              </p>

              {/* Name + Price */}
              <div className="flex flex-col gap-3">
                <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-black tracking-[-0.03em] text-black leading-[1.05]">
                  {product.name}
                </h1>
                <p className="text-[22px] font-black tracking-tight" style={{ color: ACCENT }}>
                  {product.price}
                </p>
              </div>

              {/* Description */}
              <p className="text-[14px] leading-[1.8] font-light" style={{ color: 'rgba(0,0,0,0.5)' }}>
                {product.description}
              </p>

              {/* Features */}
              {product.features && (
                <div className="grid grid-cols-1 gap-2">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT }} />
                      <span className="text-[13px]" style={{ color: 'rgba(0,0,0,0.45)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── INFO SECTIONS ─── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 pb-16">
        <ProductInfoSections />
      </div>

      {/* ─── REVIEWS ─── */}
      <div className="max-w-[900px] mx-auto px-6 md:px-16 pb-24">
        <ReviewList productId={product.id} reviews={reviews} />
      </div>

      {/* ─── RELATED ─── */}
      <div
        className="px-6 md:px-16 py-20 border-t"
        style={{ borderColor: 'rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: ACCENT }}>
            You May Also Like
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {related.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group flex flex-col items-center gap-3 text-left"
              >
                <div
                  className="w-full overflow-hidden"
                  style={{ aspectRatio: '3/4', backgroundColor: '#E8E5E0' }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h4
                    className="text-[13px] font-normal tracking-tight group-hover:opacity-50 transition-opacity"
                    style={{ color: '#1A1A1A' }}
                  >
                    {p.name}
                  </h4>
                  <p className="text-[13px] font-normal" style={{ color: ACCENT }}>
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
