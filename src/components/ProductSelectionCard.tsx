import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { springTransition, contentTransition } from '../utils/animations';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  sizes: string[];
  discount_price?: string;
  category?: string;
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
  const [collapsed, setCollapsed] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastCollapsed = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          // Hysteresis: different thresholds for collapse/expand to prevent jitter
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
    if (!selectedSize) { setSizeOpen(true); return; }
    if (isAdding) return;
    setIsAdding(true);
    await new Promise(r => setTimeout(r, 1200));
    handleAddToCart(e);
    setTimeout(() => setIsAdding(false), 600);
  }, [selectedSize, isAdding, handleAddToCart]);

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex flex-col items-center pointer-events-none md:right-10 md:bottom-10 md:left-auto md:w-[440px]">

      {/* ── Main Detail Card ── */}
      <motion.div
        initial={false}
        animate={{
          height: collapsed ? 60 : 'auto',
        }}
        transition={springTransition}
        style={{ borderRadius: 16, willChange: 'height' }}
        className="w-full glass-nav overflow-hidden pointer-events-auto flex flex-col origin-bottom"
      >
        {/* Info Area (Thumbnail + Name + Heart) — same animation pattern as Header panels */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="info"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { opacity: 0, height: 0 },
                show: { opacity: 1, height: 'auto', transition: { height: springTransition, opacity: { duration: 0.3, delay: 0.1 } } },
                exit: { opacity: 0, height: 0, transition: { height: springTransition, opacity: { duration: 0.2 } } }
              }}
              className="overflow-hidden"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-[56px] h-[74px] rounded-lg overflow-hidden border border-white/10 shrink-0 bg-white/5">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[14px] font-bold leading-tight text-white/95 tracking-tighter truncate max-w-[240px]">
                        {product.name}
                      </h3>
                      <p className="text-[13px] font-bold text-white tracking-tight">
                        {product.discount_price || product.price}
                      </p>
                      <p className="text-[11px] text-white/40 tracking-tight font-medium">
                        {product.category} (C005)
                      </p>
                    </div>
                    <button onClick={() => setIsWishlisted(!isWishlisted)} className="mt-0.5 active:scale-90 transition-transform">
                      <Heart size={18} className={isWishlisted ? 'fill-white text-white' : 'text-white/40'} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Row — Side by Side Pills */}
        <div
          className={`flex items-center gap-2 px-3 pb-3 ${collapsed ? 'h-full pt-3' : 'pt-1'}`}
        >
          {/* [Add to Cart] — Solid White */}
          <button
            onClick={handleAdd}
            className="flex-1 h-[44px] bg-white hover:bg-white/90 text-black rounded-xl font-bold text-[12px] tracking-tight transition-all active:scale-[0.97] flex items-center justify-center shadow-sm"
          >
            {isAdding ? (
              <Check size={18} className="text-emerald-600 animate-in fade-in zoom-in duration-300" />
            ) : 'Sepete ekle'}
          </button>

          {/* [Select Size] — Ghost Glass */}
          <button
            onClick={() => { setCollapsed(false); setSizeOpen(!sizeOpen); }}
            className="flex-1 h-[44px] rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold text-[12px] tracking-tight text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            {selectedSize || 'Select size'}
            <ChevronDown size={14} className={`transition-transform duration-300 ${sizeOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* [Close/X] — Circular Glass */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-[44px] h-[44px] shrink-0 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center active:scale-[0.95] transition-all"
          >
            {collapsed ? <ChevronUp size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Size Selection Area (Vertical Accordion) */}
        <AnimatePresence>
          {sizeOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              className="px-3 pb-4 overflow-hidden"
            >
              <div className="w-full h-px bg-white/10 mb-3" />
              <div className="grid grid-cols-3 gap-1.5">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeOpen(false); }}
                    className={`h-10 rounded-xl text-[11px] font-bold transition-all border
                      ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
