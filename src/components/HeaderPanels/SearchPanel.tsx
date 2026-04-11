import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { containerVariants, itemVariants } from '../../utils/animations';

const SearchPanel: React.FC = () => {
  return (
    <motion.div variants={containerVariants} className="p-5 flex flex-col gap-4">
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-black/5 border border-black/5 rounded-xl py-3 pl-11 pr-4 text-black placeholder:text-black/30 focus:outline-none focus:border-black/10 transition-colors text-sm"
          autoFocus
        />
      </motion.div>
      <motion.div variants={itemVariants} className="mt-2">
        <p className="text-black/30 text-[10px] uppercase tracking-[0.2em] mb-3 font-bold">Popular Searches</p>
        <div className="flex flex-wrap gap-2">
          {['Summer Dress', 'Denim', 'Accessories', 'New Arrivals'].map(term => (
            <span key={term} className="px-3 py-1.5 bg-black/5 border border-black/5 rounded-lg text-black/70 text-xs cursor-pointer hover:bg-black/10 transition-colors">{term}</span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchPanel;
