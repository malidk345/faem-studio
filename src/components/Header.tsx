import React, { useState } from 'react';
import { Grid3X3, ShoppingBag, Search, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import SearchPanel from './HeaderPanels/SearchPanel';
import MenuPanel from './HeaderPanels/MenuPanel';
import ProfilePanel from './HeaderPanels/ProfilePanel';
import CartPanel from './HeaderPanels/CartPanel';
import { contentTransition } from '../utils/animations';

// Smooth easing — no spring bounce, just fluid deceleration
const smoothTransition = { duration: 0.45, ease: [0.25, 1, 0.5, 1] };

export default function Header({ isAbsolute = false }: { isAbsolute?: boolean }) {
  const { cartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const [activePanel, setActivePanel] = useState<'search' | 'profile' | 'menu' | 'cart' | null>(null);

  const positionClass = isAbsolute ? 'absolute' : 'fixed';

  return (
    <>
      {/* Click Outside Overlay */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePanel(null)}
            className="fixed inset-0 z-40 bg-black/[0.04] backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <header className={`${positionClass} top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 flex justify-center z-50 pointer-events-none`}>
        {/*
          Architecture: Fixed outer shell holds border-radius + overflow:hidden.
          Inner panels animate height ONLY — no scale transforms, no border distortion.
        */}
        <div
          className="w-full max-w-5xl glass-nav pointer-events-auto overflow-hidden flex flex-col border border-white/10 shadow-2xl"
          style={{ borderRadius: 10 }}
        >
          {/* Top Bar (Logo + Icons) — always visible, fixed height */}
          <div className="flex items-center justify-between h-[52px] sm:h-[56px] px-1 sm:px-2 shrink-0 w-full">
            {/* Logo */}
            <Link to="/" onClick={() => setActivePanel(null)} className="pl-3 flex items-center hover:opacity-60 transition-opacity">
              <span className="text-[19px] sm:text-[21px] font-bold tracking-tighter lowercase leading-none">
                <span className="text-[#ddff34]">f</span>a<span className="text-[#ddff34]">e</span>m
              </span>
            </Link>

            {/* Action Icons */}
            <div className="flex items-center h-full">
              <AnimatePresence mode="popLayout" initial={false}>
                {!activePanel ? (
                  <motion.div
                    key="icons"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={contentTransition}
                    className="flex items-center h-full gap-0.5"
                  >
                    <button onClick={toggleLanguage} className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] flex items-center justify-center glass-nav-btn text-[9px] sm:text-[10px] font-normal uppercase font-['Handjet',sans-serif]">
                      {language}
                    </button>
                    <div className="w-[1px] h-3.5 bg-white/10 mx-0.5"></div>
                    <button onClick={() => setActivePanel('search')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] flex items-center justify-center glass-nav-btn">
                      <Search size={17} strokeWidth={2} />
                    </button>
                    <button onClick={() => setActivePanel('profile')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] flex items-center justify-center glass-nav-btn">
                      <User size={17} strokeWidth={2} />
                    </button>
                    <button onClick={() => setActivePanel('menu')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] flex items-center justify-center glass-nav-btn">
                      <Grid3X3 size={19} strokeWidth={2} />
                    </button>
                    <div className="w-[1px] h-5 bg-white/10 mx-1 sm:mx-1.5"></div>
                    <button onClick={() => setActivePanel('cart')} className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-[4px] glass-nav-btn mr-1 group">
                      <ShoppingBag size={19} strokeWidth={1.5} />
                      <AnimatePresence>
                        {cartCount > 0 && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute bottom-0.5 right-0 bg-white text-black text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full shadow-sm"
                          >
                            {cartCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={contentTransition}
                    className="flex items-center justify-end h-full pr-1 gap-2 sm:gap-3"
                  >
                    <span className="font-normal uppercase tracking-[0.2em] text-[9px] sm:text-[11px] opacity-40 text-white font-['Handjet',sans-serif]">
                      {activePanel === 'cart' ? 'SEPET' :
                        activePanel === 'menu' ? 'MENÜ' :
                          activePanel === 'search' ? 'ARA' :
                            activePanel === 'profile' ? 'PROFİL' : ''}
                    </span>
                    <button onClick={() => setActivePanel(null)} className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[4px] flex items-center justify-center glass-nav-btn text-white">
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Expanded Content — animates height only, no scale */}
          <AnimatePresence mode="wait">
            {activePanel && (
              <motion.div
                key={activePanel}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={smoothTransition}
                className="overflow-hidden"
              >
                <div className="mx-2 h-[1px] bg-white/10 mb-1"></div>
                {activePanel === 'search' && <SearchPanel onClose={() => setActivePanel(null)} />}
                {activePanel === 'menu' && <MenuPanel onClose={() => setActivePanel(null)} />}
                {activePanel === 'profile' && <ProfilePanel onClose={() => setActivePanel(null)} />}
                {activePanel === 'cart' && <CartPanel onClose={() => setActivePanel(null)} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
