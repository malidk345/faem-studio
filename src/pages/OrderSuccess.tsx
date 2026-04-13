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
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative mb-10"
      >
        <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 border border-emerald-100">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute -top-2 -right-2 w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center"
        >
          <Package size={20} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-md"
      >
        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600 mb-2 block">
          Payment Successful
        </span>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter leading-none text-black">
          Ödeme Alındı.
        </h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed font-medium px-4">
          Siparişiniz arşive eklendi ve hazırlık aşamasına geçildi. Harika bir seçim yaptınız.
        </p>

        {id && (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl mt-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID:</span>
            <span className="text-[13px] font-black text-black">#{id.toUpperCase()}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button 
            onClick={() => navigate('/shop')}
            className="group bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Gallery <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigate('/account')}
            className="group bg-zinc-50 text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-zinc-100 hover:bg-zinc-100 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Orders <ShoppingBag size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
