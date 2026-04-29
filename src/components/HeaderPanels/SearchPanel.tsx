import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ArrowRight, History, X } from 'lucide-react';
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const addToRecent = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const removeRecent = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const { data } = await supabase
            .from('products')
            .select('id, name, price, image_url, discount_price')
            .ilike('name', `%${query}%`)
            .limit(5);
          
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
    <motion.div variants={containerVariants} className="p-4 sm:p-6 flex flex-col gap-6 max-h-[70vh] sm:max-h-none overflow-y-auto hide-scrollbar">
      {/* Search Input */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching ? <Loader2 size={16} className="animate-spin text-white/20" /> : <Search size={16} className="text-white/30" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all text-[16px] font-medium"
          autoFocus
        />
      </motion.div>

      <div className="min-h-[120px]">
        <AnimatePresence mode="wait">
          {!query && (
            <motion.div 
              key="suggestions"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-8 px-1"
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] mb-3 font-bold flex items-center gap-2">
                    <History size={12} /> {t('search.recent') || 'GEÇMİŞ ARAMALAR'}
                  </p>
                  <div className="flex flex-col gap-1">
                    {recentSearches.map(term => (
                      <div key={term} className="flex items-center justify-between group">
                        <button 
                          onClick={() => setQuery(term)}
                          className="flex-1 text-left py-2 text-[13px] text-white/60 hover:text-white transition-colors"
                        >
                          {term}
                        </button>
                        <button 
                          onClick={() => removeRecent(term)}
                          className="p-2 text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories */}
              <div>
                <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">{t('search.popular')}</p>
                <div className="flex flex-wrap gap-2">
                  {['Arşiv', 'Seçki', 'Temel', 'Nesne'].map(term => (
                    <button 
                      key={term} 
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {query && !isSearching && results.length === 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <p className="text-white/20 text-xs font-medium uppercase tracking-widest">Sonuç bulunamadı</p>
            </motion.div>
          )}

          {hasResults && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col px-1"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em]">{t('search.results')}</p>
                <button onClick={() => setQuery('')} className="text-[10px] uppercase font-bold tracking-widest text-white/50 border-white/20 border-b hover:text-white transition-colors">{t('search.clear')}</button>
              </div>
              <div className="flex flex-col gap-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      addToRecent(product.name);
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
              
              <button 
                onClick={() => {
                  addToRecent(query);
                  navigate(`/shop?q=${query}`);
                  onClose?.();
                }}
                className="mt-4 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors border-t border-white/5"
              >
                TÜM SONUÇLARI GÖR ({results.length}+)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
