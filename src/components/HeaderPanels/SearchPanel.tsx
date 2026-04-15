import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { containerVariants, itemVariants } from '../../utils/animations';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

interface ProductResult {
  id: string;
  name: string;
  price: string;
  image_url: string;
  discount_price?: string;
}

interface SearchPanelProps {
  onClose?: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const { data } = await supabase
            .from('products')
            .select('id, name, price, image_url, discount_price')
            .ilike('name', `%${query}%`)
            .limit(4);
          
          if (data) setResults(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const hasResults = results.length > 0;

  return (
    <motion.div variants={containerVariants} className="p-5 flex flex-col gap-6">
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching ? <Loader2 size={16} className="animate-spin text-white/20" /> : <Search size={16} className="text-white/30" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all text-[15px] font-medium"
          autoFocus
        />
      </motion.div>

      <div className="min-h-[120px]">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div 
              key="popular"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="px-1"
            >
              <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">{t('search.popular')}</p>
              <div className="flex flex-wrap gap-2">
                {['Archive', 'Selection', 'Essential', 'Object'].map(term => (
                  <button 
                    key={term} 
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col px-1"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">{t('search.results')}</p>
                <button onClick={() => setQuery('')} className="text-[10px] uppercase font-bold tracking-widest text-white/50 border-white/20 border-b hover:text-white transition-colors">{t('search.clear')}</button>
              </div>
              <div className="flex flex-col gap-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      onClose?.();
                    }}
                    className="group flex items-center gap-4 py-3 px-3 rounded-2xl hover:bg-white/5 transition-all text-left"
                  >
                    <div className="w-12 h-16 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-white leading-tight truncate">{product.name}</h4>
                      {product.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-white/20 line-through tracking-tighter">{product.price}</span>
                          <span className="text-[12px] font-bold text-rose-500 tracking-tighter">{product.discount_price}</span>
                        </div>
                      ) : (
                        <p className="text-[12px] font-bold text-white/30 tracking-tighter">{product.price}</p>
                      )}
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-white/20" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
