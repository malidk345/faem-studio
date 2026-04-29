import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronDown, ChevronUp, X, Check } from 'lucide-react';

// Smooth easing curve — no spring bouncing, just fluid deceleration
const smoothTransition = { duration: 0.45, ease: [0.25, 1, 0.5, 1] };
const fastTransition = { duration: 0.3, ease: [0.25, 1, 0.5, 1] };

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  sizes: string[];
  discount_price?: string;
  category?: string;
  stock_count?: number;
}

interface ProductSelectionCardProps {
  product: Product;
  quantity: number;
  selectedSize: string;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  setSelectedSize: (v: string) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
  handleAddToCart: (e: React.MouseEvent) => void;
}

export default function ProductSelectionCard({
  product, selectedSize,
  setSelectedSize, handleAddToCart,
}: ProductSelectionCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(false);

  const stockCount = product.stock_count ?? 999;
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 3;

  useEffect(() => {
    let ticking = false;
    let lastCollapsed = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const shouldCollapse = lastCollapsed ? y > 120 : y > 180;
          if (shouldCollapse !== lastCollapsed) {
            lastCollapsed = shouldCollapse;
            setCollapsed(shouldCollapse);
            if (shouldCollapse) setSizeOpen(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAdd = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!selectedSize) { setSizeOpen(true); return; }
    if (isAdding) return;
    setIsAdding(true);
    await new Promise(r => setTimeout(r, 1200));
    handleAddToCart(e);
    setTimeout(() => setIsAdding(false), 600);
  }, [selectedSize, isAdding, handleAddToCart, isOutOfStock]);

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 z-50 flex flex-col items-end pointer-events-none md:right-8 md:left-auto md:w-[440px]">

      {/*
        Architecture: Fixed outer shell holds border-radius + overflow:hidden.
        Inner content animates height ONLY — no scale transforms, no border distortion.
      */}
      <div
        className="w-full glass-nav pointer-events-auto overflow-hidden border border-white/10 shadow-2xl"
        style={{ borderRadius: 10 }}
      >
        {/* ── Expandable Info Area ── */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="info-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={smoothTransition}
              className="overflow-hidden"
            >
              <div className="p-4 flex items-start gap-4">
                <div className="w-[70px] h-[90px] rounded-[4px] overflow-hidden border border-white/10 shrink-0 bg-white/5">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14px] font-bold leading-none text-white/95 tracking-tighter truncate max-w-[240px]">
                        {product.name}
                      </h3>
                      <p className="text-[17px] font-bold text-white tracking-tighter mt-1">
                        {product.discount_price || product.price}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-2 font-['Handjet',sans-serif]">
                        {product.category} {isOutOfStock ? '/ TÜKENDI' : isLowStock ? `/ SON ${stockCount} ADET` : '/ ARCHIVE PIECE'}
                      </p>
                    </div>
                    <button onClick={() => setIsWishlisted(!isWishlisted)} className="active:scale-90 transition-transform p-1.5">
                      <Heart size={21} className={isWishlisted ? 'fill-white text-white' : 'text-white/40'} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mx-3 h-px bg-white/[0.06]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action Row (always visible) ── */}
        <div className="flex items-center gap-2 px-1.5 py-1.5">
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex-[2] h-[42px] sm:h-[44px] rounded-[4px] transition-all flex items-center justify-center shadow-lg
              ${isOutOfStock 
                ? 'bg-white/20 text-white/40 cursor-not-allowed' 
                : 'bg-white hover:bg-white/90 text-black active:scale-[0.97]'}`}
          >
            {isAdding ? (
              <Check size={20} className="text-emerald-600 animate-in fade-in zoom-in duration-300" />
            ) : isOutOfStock ? (
              <span className="text-[14px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif] text-rose-400">TÜKENDI</span>
            ) : (
              <span className="text-[16px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">SEPETE EKLE</span>
            )}
          </button>

          <button
            onClick={() => { setCollapsed(false); setSizeOpen(!sizeOpen); }}
            className="flex-1 h-[42px] sm:h-[44px] rounded-[4px] bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all font-['Handjet',sans-serif]"
          >
            <span className="text-[15px] font-normal uppercase tracking-[0.05em]">{selectedSize || 'BEDEN'}</span>
            <ChevronDown size={13} className={`transition-transform duration-300 ${sizeOpen ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] shrink-0 bg-white/10 hover:bg-white/15 border border-white/10 rounded-[4px] flex items-center justify-center active:scale-[0.95] transition-all text-white/60"
          >
            {collapsed ? <ChevronUp size={18} /> : <X size={20} />}
          </button>
        </div>

        {/* ── Size Selection Area ── */}
        <AnimatePresence initial={false}>
          {sizeOpen && !collapsed && (
            <motion.div
              key="size-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={fastTransition}
              className="overflow-hidden"
            >
              <div className="mx-3 h-px bg-white/[0.06] mb-3" />
              <div className="px-3 pb-4 grid grid-cols-3 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeOpen(false); }}
                    className={`h-12 rounded-[4px] text-[17px] font-normal transition-all border font-['Handjet',sans-serif]
                      ${selectedSize === size ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/20'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

