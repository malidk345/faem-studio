import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
  videoUrl?: string;
  reviewCount?: number;
  rating?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  videoUrl,
  reviewCount = 12,
  rating = 4.8,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Gallery sources: start with main image, then add others
  const galleryImages = [
    { id: 'master', url: product.image },
    ...(Array.isArray(product.images) ? product.images : [])
  ];

  return (
    <div 
      className="group relative flex flex-col gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Media Carousel ── */}
      <div className="relative aspect-[1/1] overflow-hidden rounded-[4px] bg-zinc-50 border border-zinc-100">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {galleryImages.map((img, idx) => (
              <div key={img.id || idx} className="embla__slide flex-[0_0_100%] min-w-0 relative h-full">
                <Link to={`/product/${product.id}`} className="block h-full w-full">
                  <img
                    src={img.url}
                    alt={`${product.name} - View ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-2 left-2 z-10 bg-white px-2 py-1 rounded-[4px] shadow-sm">
           <span className="text-[11px] font-black tracking-tight text-black">{product.price}</span>
        </div>

        {/* Status Indicators (Dots) */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {scrollSnaps.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${idx === selectedIndex ? 'bg-black w-3' : 'bg-black/20'}`}
              />
            ))}
          </div>
        )}

        {/* Floating Quick Action (Desktop) */}
        <div className="absolute inset-x-2 bottom-10 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button 
            onClick={(e) => { e.preventDefault(); emblaApi?.scrollPrev(); }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg pointer-events-auto active:scale-90 transition-all border border-zinc-100"
          >
             <ChevronLeft size={14} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); emblaApi?.scrollNext(); }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg pointer-events-auto active:scale-90 transition-all border border-zinc-100"
          >
             <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Product Info ── */}
      <Link to={`/product/${product.id}`} className="flex flex-col gap-1.5 px-1 py-1">
        <div className="flex items-center gap-1">
          <Star size={10} className="fill-black text-black" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            {rating} <span className="mx-1">/</span> {reviewCount} Reviews
          </span>
        </div>

        <h3 className="text-[14px] font-black tracking-tight text-black leading-tight -mt-0.5">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{product.category}</span>
           <div className="w-1 h-1 rounded-full bg-zinc-200" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">In Stock</span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
