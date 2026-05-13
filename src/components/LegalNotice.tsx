import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

export default function LegalNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('faem-legal-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('faem-legal-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-48px)] max-w-lg"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 p-4 md:p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={20} />
              </div>
              <p className="text-[11px] md:text-[12px] leading-tight text-zinc-600 font-medium">
                Sitemizi kullanarak{' '}
                <Link to="/legal/terms" className="text-black font-bold underline underline-offset-2">Kullanım Koşulları</Link>
                ,{' '}
                <Link to="/legal/privacy" className="text-black font-bold underline underline-offset-2">Gizlilik</Link>
                {' '}ve{' '}
                <Link to="/legal/privacy" className="text-black font-bold underline underline-offset-2">Çerez Politikası</Link>
                'nı kabul etmiş sayılırsınız.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={handleAccept}
                className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 md:flex-none"
              >
                Anladım
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="w-10 h-10 border border-zinc-100 flex items-center justify-center rounded-xl text-zinc-400 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
