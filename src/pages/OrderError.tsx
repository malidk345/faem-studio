import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCcw, HelpCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function OrderError() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Extract error message from state if passed from iyzico callback
  const errorMessage = location.state?.message || "Ödeme işlemi bankanız tarafından onaylanmadı veya teknik bir sorun oluştu.";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="mb-10"
      >
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/10 border border-rose-100">
          <AlertCircle size={48} strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-md"
      >
        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-rose-600 mb-2 block">
          Transaction Failed
        </span>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter leading-none text-black">
          Bir Sorun Oluştu.
        </h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed font-medium px-4">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button 
            onClick={() => navigate('/checkout')}
            className="group bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Tekrar Dene <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="group bg-zinc-50 text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-zinc-100 hover:bg-zinc-100 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Support <HelpCircle size={16} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/shop')}
          className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mx-auto"
        >
          <ArrowLeft size={12} /> Gallery'ye Dön
        </button>
      </motion.div>
    </div>
  );
}
