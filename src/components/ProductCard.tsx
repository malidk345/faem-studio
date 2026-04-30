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
  collection?: string;
  images?: any[];
  discount_price?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps'
  });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col group relative"
    >
      {/* ── Technical Media Layer (Slider Integration) ── */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[2px] bg-[#f7f6f4] border border-black/[0.03]">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="embla__slide flex-[0_0_100%] min-w-0 h-full relative">
                <Link to={`/product/${product.id}`} className="block h-full w-full">
                  <motion.img
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    src={typeof img === 'string' ? img : (img as any).url}
                    alt={`${product.name} - ${idx}`}
                    className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-1000 will-change-transform"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Label Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-10">
          {product.discount_price && (
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-[10px] font-normal uppercase tracking-[0.05em] px-1.5 py-0.5 bg-[#ddff34] text-black rounded-[1px] font-['Handjet',sans-serif] shadow-sm"
            >
              Sale
            </motion.span>
          )}
          <span className="text-[9px] font-normal uppercase tracking-[0.15em] px-2 py-0.5 glass-nav border-0 text-white/60 rounded-[1px] font-['Handjet',sans-serif] backdrop-blur-md">
            {product.collection || (product.category !== 'Genel' ? product.category : '')}
          </span>
        </div>

        {/* ── Slider Dot Indicators ── */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {galleryImages.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all duration-500 ${i === selectedIndex ? 'bg-white w-4' : 'bg-white/30'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Compact Info Layer ── */}
      <Link to={`/product/${product.id}`} className="mt-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[14px] md:text-[15px] font-bold text-black tracking-tight leading-tight group-hover:text-black/60 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 font-['Handjet',sans-serif]">
          {product.discount_price ? (
            <>
              <span className="text-[14px] opacity-20 line-through text-black font-normal">{product.price}</span>
              <span className="text-[18px] text-black font-normal tracking-wide">{product.discount_price}</span>
            </>
          ) : (
            <span className="text-[18px] text-black font-normal tracking-wide">
              {product.price}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
