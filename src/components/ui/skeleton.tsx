import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-zinc-50 ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear'
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent"
      />
    </div>
  );
};
