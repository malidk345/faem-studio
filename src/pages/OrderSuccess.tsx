import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Elegant celebration burst
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 0, colors: ['#8c7f76', '#dfd7d0', '#ffffff'] };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-14"
      >
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-neutral-400 border border-neutral-200">
          <CheckCircle2 size={32} strokeWidth={1} />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-neutral-300 mb-6 block">
          Archived Successfully
        </span>
        <h1 className="text-[clamp(2rem,6vw,4rem)] font-serif italic tracking-tight leading-none text-neutral-800 mb-8 px-4">
          The pieces are now yours.
        </h1>
        <p className="text-neutral-500 text-[15px] leading-relaxed max-w-sm mx-auto mb-16">
          Everything is being prepared with clinical precision. We appreciate your discernment.
        </p>

        {id && (
          <div className="inline-flex flex-col items-center gap-2 mb-16 opacity-40">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400">Inventory ID</span>
            <span className="text-[14px] font-serif text-neutral-800 italic">#{id.toUpperCase()}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <button 
            onClick={() => navigate('/shop')}
            className="group text-[12px] font-bold uppercase tracking-[0.3em] text-neutral-800 flex items-center gap-3 transition-colors hover:text-neutral-500"
          >
            Mağaza <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
          <div className="hidden sm:block w-px h-10 bg-neutral-200" />
          <button 
            onClick={() => navigate('/account')}
            className="group text-[12px] font-bold uppercase tracking-[0.3em] text-neutral-800 flex items-center gap-3 transition-colors hover:text-neutral-500"
          >
            My Archive <ShoppingBag size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
