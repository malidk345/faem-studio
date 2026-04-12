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
            .select('id, name, price, image_url')
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
      {/* Search Input Section */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching ? <Loader2 size={16} className="animate-spin text-black/20" /> : <Search size={16} className="text-black/30" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full bg-black/[0.03] border border-black/[0.05] rounded-xl py-3.5 pl-11 pr-4 text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-all text-[15px] font-medium"
          autoFocus
        />
      </motion.div>

      {/* Content Section */}
      <div className="min-h-[100px]">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div 
              key="popular"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-black/40 text-[11px] mb-2 font-bold">{t('search.popular')}</p>
              <div className="flex flex-wrap gap-1.5">
                {['Archive', 'Selection', 'Essential', 'Object'].map(term => (
                  <button 
                    key={term} 
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-black/[0.03] border border-black/[0.05] rounded-lg text-black/60 text-[12px] font-medium hover:bg-black hover:text-white transition-all"
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
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-black/40 text-[11px] font-bold">{t('search.results')}</p>
                <button onClick={() => setQuery('')} className="text-[11px] border-b border-black text-black font-bold">{t('search.clear')}</button>
              </div>
              <div className="flex flex-col">
                {results.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      onClose?.();
                    }}
                    className={`group flex items-center gap-4 py-4 transition-all text-left ${
                      i !== results.length - 1 ? 'border-b border-black/[0.04]' : ''
                    }`}
                  >
                    <div className="w-12 h-16 bg-black/[0.03] rounded-md overflow-hidden flex-shrink-0">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                      <h4 className="text-[14px] font-bold text-black leading-tight">{product.name}</h4>
                      <p className="text-[12px] font-medium text-black/40">{product.price}</p>
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-black/20" />
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
