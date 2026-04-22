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
  const [collapsed, setCollapsed] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(false);

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
    if (!selectedSize) { setSizeOpen(true); return; }
    if (isAdding) return;
    setIsAdding(true);
    await new Promise(r => setTimeout(r, 1200));
    handleAddToCart(e);
    setTimeout(() => setIsAdding(false), 600);
  }, [selectedSize, isAdding, handleAddToCart]);

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex flex-col items-center pointer-events-none md:right-10 md:bottom-10 md:left-auto md:w-[440px]">

      {/* ── Main Detail Card (Now Synced with Header Frame) ── */}
      <motion.div
        layout
        initial={false}
        animate={{
          height: collapsed ? 60 : 'auto',
        }}
        transition={springTransition}
        style={{ borderRadius: 8 }}
        className="w-full glass-nav overflow-hidden pointer-events-auto flex flex-col origin-bottom border border-white/10 shadow-2xl"
      >
        {/* Info Area */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="info"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTransition}
              className="overflow-hidden"
            >
              <div className="p-4 flex items-start gap-4">
                <div className="w-[64px] h-[80px] rounded-[4px] overflow-hidden border border-white/10 shrink-0 bg-white/5">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14px] font-bold leading-none text-white/95 tracking-tighter truncate max-w-[240px]">
                        {product.name}
                      </h3>
                      <p className="text-[16px] font-bold text-white tracking-tighter mt-1">
                        {product.discount_price || product.price}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-2 font-['Handjet',sans-serif]">
                        {product.category} / ARCHIVE PIECE
                      </p>
                    </div>
                    <button onClick={() => setIsWishlisted(!isWishlisted)} className="active:scale-90 transition-transform mt-1">
                      <Heart size={20} className={isWishlisted ? 'fill-white text-white' : 'text-white/40'} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Row */}
        <div className={`flex items-center gap-2 px-3 pb-3 ${collapsed ? 'h-full pt-3' : 'pt-2'}`}>
          <button
            onClick={handleAdd}
            className="flex-1 h-[48px] bg-white hover:bg-white/90 text-black rounded-[4px] transition-all active:scale-[0.97] flex items-center justify-center shadow-lg"
          >
            {isAdding ? (
              <Check size={20} className="text-emerald-600 animate-in fade-in zoom-in duration-300" />
            ) : (
              <span className="text-[18px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">SEPETE EKLE</span>
            )}
          </button>

          <button
            onClick={() => { setCollapsed(false); setSizeOpen(!sizeOpen); }}
            className={`flex-1 h-[48px] rounded-[4px] bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all font-['Handjet',sans-serif]`}
          >
            <span className="text-[18px] font-normal uppercase tracking-[0.05em]">{selectedSize || 'BEDEN SEÇ'}</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${sizeOpen ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-[48px] h-[48px] shrink-0 bg-white/10 hover:bg-white/15 border border-white/10 rounded-[4px] flex items-center justify-center active:scale-[0.95] transition-all text-white/60"
          >
            {collapsed ? <ChevronUp size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Size Selection Area */}
        <AnimatePresence>
          {sizeOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springTransition}
              className="px-3 pb-4 overflow-hidden"
            >
              <div className="w-full h-px bg-white/10 mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeOpen(false); }}
                    className={`h-12 rounded-[4px] text-[16px] font-normal transition-all border font-['Handjet',sans-serif]
                      ${selectedSize === size ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/20'}`}
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
