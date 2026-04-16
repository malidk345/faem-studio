import React, { useState } from 'react';
import { Grid3X3, ShoppingBag, Search, X, User, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import SearchPanel from './HeaderPanels/SearchPanel';
import MenuPanel from './HeaderPanels/MenuPanel';
import ProfilePanel from './HeaderPanels/ProfilePanel';
import CartPanel from './HeaderPanels/CartPanel';
import { springTransition, contentTransition } from '../utils/animations';

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
            className="fixed inset-0 z-40 bg-black/[0.05] backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>

      <header className={`${positionClass} top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex justify-center z-50 pointer-events-none`}>
      {/* Expandable Full-Width Pill with light glassmorphism */}
      <motion.div
        layout
        initial={false}
        animate={{
          height: activePanel ? 'auto' : 52,
          borderRadius: activePanel ? 8 : 6,
        }}
        transition={springTransition}
        className="w-full max-w-5xl glass-nav overflow-hidden pointer-events-auto flex flex-col origin-top border border-white/5"
      >
        {/* Top Bar (Logo + Icons) */}
        <motion.div layout="position" className="flex items-center justify-between h-[52px] px-2 shrink-0 w-full">
          {/* Logo */}
          <Link to="/" onClick={() => setActivePanel(null)} className="pl-3 flex items-center hover:opacity-60 transition-opacity">
            <span className="text-[20px] font-bold tracking-tighter lowercase leading-none">faem</span>
          </Link>

          {/* Icons or Close Button */}
          <AnimatePresence mode="popLayout" initial={false}>
            {!activePanel ? (
              <motion.div
                key="icons"
                initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                transition={contentTransition}
                className="flex items-center h-full"
              >
                <button onClick={toggleLanguage} className="w-9 h-9 rounded-xl flex items-center justify-center glass-nav-btn text-[10px] font-black uppercase">
                  {language}
                </button>
                <div className="w-[1px] h-3 bg-white/10 mx-0.5"></div>
                <button onClick={() => setActivePanel('search')} className="w-9 h-9 rounded-xl flex items-center justify-center glass-nav-btn">
                  <Search size={17} strokeWidth={2} />
                </button>
                <button onClick={() => setActivePanel('profile')} className="w-9 h-9 rounded-xl flex items-center justify-center glass-nav-btn">
                  <User size={17} strokeWidth={2} />
                </button>
                <button onClick={() => setActivePanel('menu')} className="w-9 h-9 rounded-xl flex items-center justify-center glass-nav-btn">
                  <Grid3X3 size={19} strokeWidth={2} />
                </button>
                <div className="w-[1px] h-5 bg-white/10 mx-1"></div>
                <button onClick={() => setActivePanel('cart')} className="relative w-9 h-9 flex items-center justify-center rounded-xl glass-nav-btn mr-1">
                  <ShoppingBag size={19} strokeWidth={1.5} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute bottom-0.5 right-0 bg-white text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
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
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={contentTransition}
                className="flex items-center justify-end h-full pr-1 gap-3"
              >
                <span className="font-bold capitalize tracking-tight text-xs opacity-60">{activePanel ? t(`nav.${activePanel}`) : ''}</span>
                <button onClick={() => setActivePanel(null)} className="w-[38px] h-[38px] rounded-xl flex items-center justify-center glass-nav-btn">
                  <X size={18} strokeWidth={2} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { opacity: 0, height: 0 },
                show: { opacity: 1, height: 'auto', transition: { height: springTransition, opacity: { duration: 0.3, delay: 0.1 } } },
                exit: { opacity: 0, height: 0, transition: { height: springTransition, opacity: { duration: 0.2 } } }
              }}
              className="flex flex-col w-full"
            >
              <motion.div layout="position" className="w-full h-[1px] bg-white/10 mb-2"></motion.div>
              {activePanel === 'search' && <SearchPanel onClose={() => setActivePanel(null)} />}
              {activePanel === 'menu' && <MenuPanel onClose={() => setActivePanel(null)} />}
              {activePanel === 'profile' && <ProfilePanel onClose={() => setActivePanel(null)} />}
              {activePanel === 'cart' && <CartPanel onClose={() => setActivePanel(null)} />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </header>
    </>
  );
}
