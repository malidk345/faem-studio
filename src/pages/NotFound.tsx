import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Ghost, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative mb-12"
      >
        <div className="text-[120px] md:text-[180px] font-black tracking-tighter text-zinc-50 leading-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
           <motion.div
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
             className="text-black/10"
           >
              <Ghost size={80} strokeWidth={1} />
           </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-sm"
      >
        <h1 className="text-3xl font-black tracking-tighter">İz Kayboldu.</h1>
        <p className="text-zinc-400 text-[14px] font-medium leading-relaxed">
          Aradığınız parça arşive kaldırılmış veya yanlış bir koordinata yönlenmiş olabilirsiniz.
        </p>

        <div className="flex flex-col gap-3 mt-10">
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Ana Sayfa <Home size={14} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="text-zinc-400 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:text-black transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={14} /> Geri Dön
          </button>
        </div>
      </motion.div>
    </div>
  );
}
