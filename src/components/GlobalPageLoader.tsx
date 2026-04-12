import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Minimalist Live-Line Hourglass */}
            <div className="relative w-12 h-12">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-full h-full text-black"
              >
                {/* The stationary Hourglass Frame */}
                <path d="M5 22h14" />
                <path d="M5 2h14" />
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                
                {/* The "Live" animated stroke overlay */}
                <motion.path
                  d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22 M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"
                  stroke="black"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 0.4, 1, 1, 0],
                    pathOffset: [0, 0.2, 0.5, 1, 1.2],
                    opacity: [0, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                />
              </svg>

              {/* Central Pulse Dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <motion.div 
                   animate={{ scale: [1, 1.5, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-1 h-1 bg-black rounded-full" 
                 />
              </div>
            </div>

            {/* Just FAEM */}
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              className="text-[12px] font-black uppercase text-black"
            >
              FAEM
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
