import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  images?: any[];
}

interface ProductCardProps {
  product: Product;
  reviewCount?: number;
  rating?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  reviewCount = 0,
  rating = 4.8,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Gallery sources: support both string arrays and object arrays from Supabase
  const galleryImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean);

  return (
    <div className="block group">
      {/* ── Scrollable Media Layer ── */}
      <div className="relative w-full aspect-[1/1] overflow-hidden rounded-[6px] bg-zinc-50 border border-zinc-100">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="embla__slide flex-[0_0_100%] min-w-0 h-full relative">
                <Link to={`/product/${product.id}`} className="block h-full w-full">
                  <img
                    src={typeof img === 'string' ? img : (img as any).url}
                    alt={`${product.name} - ${idx}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ filter: 'brightness(1.15)' }}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Dots (Only if more than 1 image) */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {galleryImages.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1 h-1 rounded-full transition-all ${idx === selectedIndex ? 'bg-black w-3' : 'bg-black/20'}`}
              />
            ))}
          </div>
        )}

        {/* Price badge (Restored original style) */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.25rem',
            left: '0.25rem',
            zIndex: 10,
            backgroundColor: '#FFFFFF',
            padding: '0.25rem 0.5rem',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: '#1A1A1A',
            lineHeight: 1,
          }}
        >
          {product.price}
        </div>
      </div>

      {/* ── Info (Restored original style & typography) ── */}
      <Link
        to={`/product/${product.id}`}
        className="block mt-2"
        style={{ display: 'grid', gap: '0.25rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star
            size={16}
            style={{ color: 'hsl(30 80% 50%)', fill: 'hsl(30 80% 50%)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: 'color-mix(in lch, #1A1A1A, transparent 45%)', fontFamily: 'monospace' }}>
            {rating} | {reviewCount > 0 ? `${reviewCount.toLocaleString()} Reviews` : 'New Arrival'}
          </span>
        </div>

        <h3
          style={{
            margin: 0,
            lineHeight: 1.2,
            color: '#1A1A1A',
            fontWeight: 700,
            fontSize: '0.85rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {product.name}
        </h3>

        <p style={{ margin: 0, fontSize: 12, color: 'color-mix(in lch, #1A1A1A, transparent 45%)', fontFamily: 'monospace' }}>
          {product.category}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
