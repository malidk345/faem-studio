import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import ProductSelectionCard from '../components/ProductSelectionCard';
import ProductInfoSections from '../components/ProductInfoSections';
import ReviewList from '../components/ReviewList';
import { PRODUCTS, REVIEWS, ProductImage } from '../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

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
    const idx = Math.round(scrollLeft / offsetWidth);
    setActiveIndex(idx);
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
  const product = PRODUCTS.find(p => String(p.id) === String(id)) || PRODUCTS[0];
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  useSEO({
    title: product ? `${product.name} | Faem Studio` : 'Product Not Found | Faem Studio',
    description: product ? product.description : 'Product details page for Faem Studio.'
  });

  useEffect(() => {
    setSelectedSize(product.sizes[0]);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  // Gallery images: use product.images if available, fallback to thumbnail
  // Medusa: replace with product.images from API response
  const galleryImages: ProductImage[] =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: 'thumb', url: product.image }];

  const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div style={{ backgroundColor: BG }}>

      {/* ─── GALLERY + INFO LAYOUT ─── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 pt-32 md:pt-40 pb-16">
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
        <ReviewList reviews={REVIEWS} />
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
