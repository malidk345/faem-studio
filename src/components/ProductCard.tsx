import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'motion/react';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  images?: any[];
  discount_price?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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

  const galleryImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean);

  return (
    <div className="flex flex-col group">
      {/* ── Editorial Media Layer ── */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[4px] bg-neutral-100">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="embla__slide flex-[0_0_100%] min-w-0 h-full relative">
                <Link to={`/product/${product.id}`} className="block h-full w-full">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    src={typeof img === 'string' ? img : (img as any).url}
                    alt={`${product.name} - ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Progress Line (Brunello inspired) */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 h-[1px] bg-white/20 overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              initial={false}
              animate={{ width: `${((selectedIndex + 1) / galleryImages.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Subtle Sale Label */}
        {product.discount_price && (
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-white/90 text-black rounded-[2px] shadow-sm">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* ── Minimalist Info Layer ── */}
      <Link to={`/product/${product.id}`} className="mt-3 flex flex-col items-center">
        {/* Category: Small, uppercase, tracked out */}
        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-1">
          {product.category}
        </p>
        
        {/* Name: Serif font, elegant */}
        <h3 className="text-[14px] md:text-[16px] font-serif text-neutral-800 tracking-tight leading-tight mb-2 text-center px-2">
          {product.name}
        </h3>

        {/* Price: Clean and subtle */}
        <div className="flex items-center gap-2">
          {product.discount_price ? (
            <>
              <span className="text-[12px] opacity-40 line-through text-neutral-500 font-medium">{product.price}</span>
              <span className="text-[13px] text-neutral-900 font-bold">{product.discount_price}</span>
            </>
          ) : (
            <span className="text-[13px] text-neutral-900 font-medium tracking-tight">
              {product.price}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
