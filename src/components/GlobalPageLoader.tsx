import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface GlobalPageLoaderProps {
  isLoading: boolean;
}

export const GlobalPageLoader: React.FC<GlobalPageLoaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 pointer-events-none"
        >
          {/* Top Progress Line */}
          <motion.div 
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "circIn" }}
            className="absolute top-0 left-0 right-0 h-1 bg-black"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
               <Loader2 className="animate-spin text-zinc-100" size={48} strokeWidth={1} />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
               </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-black">
                Faem Studio
              </span>
              <div className="flex items-center gap-3">
                 <div className="h-px w-8 bg-zinc-100" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                   Establishing Link
                 </span>
                 <div className="h-px w-8 bg-zinc-100" />
              </div>
            </div>
          </motion.div>

          <footer className="absolute bottom-12 left-0 right-0 flex justify-center">
             <span className="text-[8px] font-mono text-zinc-300 uppercase tracking-widest leading-none">
                Node-Alpha-26 // Operational
             </span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
