import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Product {
  id: string;
  name: string;
  price: string;
  sizes: string[];
  discount_price?: string;
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

const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({
  product, quantity, selectedSize, isExpanded,
  setIsExpanded, setSelectedSize,
  handleDecrease, handleIncrease, handleAddToCart,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useLanguage();

  const performAddAnimation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    
    // Slight artificial delay to allow burst animation to play
    await new Promise(r => setTimeout(r, 1200));
    
    handleAddToCart(e);
    // After callback resolves (and usually closes parent), clean up state occasionally
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        borderRadius: isExpanded ? 16 : 14,
      }}
      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
      className="fixed bottom-4 left-4 right-4 md:max-w-[420px] md:left-1/2 md:-translate-x-1/2 z-50 flex flex-col overflow-hidden glass-nav"
    >
      {/* Handle */}
      <div className="w-full pt-3 pb-2 flex justify-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
      </div>

      {/* Top row */}
      <div className="flex items-center justify-between px-6 pb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col gap-1">
          <h2 className="text-black text-[18px] font-black tracking-[-0.04em] leading-none">{product.name}</h2>
          <p className="text-[13px] font-light" style={{ color: 'rgba(0,0,0,0.4)' }}>
            {t('product.price_label')} 
            {product.discount_price ? (
              <>
                <span className="font-bold ml-1 line-through opacity-40">{product.price}</span>
                <span className="font-bold ml-2 text-rose-600">{product.discount_price}</span>
              </>
            ) : (
              <span className="font-bold ml-1" style={{ color: '#000000' }}>{product.price}</span>
            )}
          </p>
        </div>
        <motion.button
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center glass-nav-btn"
        >
          <ChevronUp size={18} strokeWidth={2} />
        </motion.button>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col overflow-hidden"
          >
            <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />

            {/* Size + Qty */}
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(0,0,0,0.3)' }}>{t('cart.size')}</p>
                <div className="flex gap-5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={e => { e.stopPropagation(); setSelectedSize(size); }}
                      className="text-[14px] font-bold transition-all duration-200"
                      style={{
                        color: selectedSize === size ? '#1A1A1A' : 'rgba(0,0,0,0.2)',
                        transform: selectedSize === size ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(0,0,0,0.3)' }}>{t('cart.qty')}</p>
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <button onClick={e => { e.stopPropagation(); handleDecrease(); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'rgba(0,0,0,0.35)' }}>
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <span className="text-black font-bold w-4 text-center text-[14px]">{quantity}</span>
                  <button onClick={e => { e.stopPropagation(); handleIncrease(); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'rgba(0,0,0,0.35)' }}>
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />

            {/* CTA */}
            <div className="px-6 pt-5 pb-6 flex flex-col gap-3">
              <p className="text-center text-[10px] font-medium" style={{ color: 'rgba(0,0,0,0.25)' }}>
                {t('product.short_promise')}
              </p>
              
              <button
                data-adding={isAdding}
                onClick={performAddAnimation}
                className="w-full py-4 rounded-xl text-[15px] font-black tracking-wide transition-all active:scale-[0.98] hover:bg-zinc-800 text-white relative flex justify-center items-center"
                style={{ backgroundColor: '#1A1A1A' }}
              >
                <span className="add-to-cart-text">     
                  <span className="w-5 h-5 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.608 9.421V6.906H3.392v8.016c0 .567.224 1.112.624 1.513.4.402.941.627 1.506.627H8.63M8.818 3h2.333c.618 0 1.212.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.344c0-.622.246-1.218.683-1.658A2.33 2.33 0 0 1 8.82 3"></path>
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M14.608 12.563v5m2.5-2.5h-5"></path>
                    </svg>
                  </span>
                  <span>{t('product.add')} · {product.discount_price || product.price}</span>
                </span>
                
                <span className="added-state">
                  <span className="w-8 h-8 flex items-center justify-center text-[#D2FF3A]">
                    <svg className="checkmark-burst" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g className="check">
                        <path className="ring" d="M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path className="tick" d="M9 12.75L11.25 15L15 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <g className="burst">
                        {[...Array(8)].map((_, i) => (
                          <g className="burst-p" key={i} style={{ '--index': i } as React.CSSProperties}>
                            <path className="wiggle" pathLength={1} d="M12 8.5 Q13 9.5 12 10.5 Q11 11.5 12 12.5 Q13 13.5 12 15.5" stroke="currentColor" strokeLinecap="round" fill="none"/>
                            <line className="line" pathLength={1} strokeLinecap="round" x1="12" y1="8.5" x2="12" y2="15.5" stroke="currentColor"/>
                          </g>
                        ))}
                      </g>
                    </svg>
                  </span>
                </span>
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductSelectionCard;
