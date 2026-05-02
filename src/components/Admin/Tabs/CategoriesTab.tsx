import React, { useState } from 'react';
import { Plus, Hash, Layers, Trash2, Code, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CategoriesTabProps {
  categories: any[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  isCollection?: boolean;
}

export function CategoriesTab({ categories, onAdd, onDelete, isCollection = false }: CategoriesTabProps) {
  const [newCat, setNewCat] = useState('');
  const [showSql, setShowSql] = useState(false);

  const handleAdd = () => {
    if (!newCat.trim()) return;
    onAdd(newCat.trim());
    setNewCat('');
    toast.success('Kategori başarıyla eklendi.');
  };

  const sqlCode = isCollection ? `-- Koleksiyonlar Tablosu SQL
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);` : `-- Kategoriler Tablosu SQL
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Categories List Section */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tighter text-zinc-900">
                {isCollection ? 'Mevcut Koleksiyonlar' : 'Mevcut Kategoriler'}
              </h2>
              <p className="text-zinc-500 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest mt-1">
                {isCollection ? 'Arşiv Yapılanması' : 'Envanter Hiyerarşisi'}
              </p>
           </div>
           <div className="flex items-center gap-2 sm:gap-3">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setShowSql(!showSql)}
               className="rounded-xl border-zinc-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest h-9 sm:h-10 px-3 sm:px-4"
             >
               <Code size={14} className="mr-2" /> SQL
             </Button>
             <Badge variant="secondary" className="font-black bg-zinc-100 text-zinc-900 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl uppercase text-[9px] sm:text-[10px] tracking-widest border-none">
                {categories.length} Toplam
             </Badge>
           </div>
        </div>

        {showSql && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-white/20">
              <Code size={30} className="sm:size-10" />
            </div>
            <h3 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={14} className="text-blue-400" /> Şema
            </h3>
            <pre className="text-emerald-400 font-mono text-[9px] sm:text-[11px] overflow-x-auto p-3 sm:p-4 bg-black/30 rounded-xl leading-relaxed">
              {sqlCode}
            </pre>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {categories.length > 0 ? (
              categories.map((c, i) => (
                <motion.div
                  key={c.name || c}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="group border-zinc-100 hover:border-zinc-900 transition-all duration-500 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm active:scale-[0.98]">
                    <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                            <Hash size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold tracking-tight text-zinc-900 text-sm sm:text-lg leading-none">{c.name || c}</span>
                            <span className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">Aktif Birim</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (window.confirm(`${c.name || c} ${isCollection ? 'koleksiyonunu' : 'kategorisini'} silmek istediğinize emin misiniz?`)) {
                              onDelete(c.name || c);
                              toast.error(isCollection ? 'Koleksiyon silindi.' : 'Kategori silindi.');
                            }
                          }}
                          className="h-9 w-9 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 sm:py-20 bg-zinc-50/50 rounded-[2rem] sm:rounded-[3rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center px-6">
                 <Layers className="text-zinc-200 mb-4 sm:mb-6" size={48} sm:size={64} />
                 <h3 className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Hiyerarşi Boş</h3>
                 <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-2 sm:mt-3 max-w-xs leading-relaxed font-medium">
                   Henüz tanımlanmış bir kayıt bulunmuyor.
                 </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Category Section */}
      <div className="lg:col-span-4 mt-4 lg:mt-0">
        <div className="bg-white border border-zinc-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 sticky top-24 shadow-2xl shadow-black/[0.02]">
          <div className="space-y-6">
            <div className="flex flex-row items-center lg:flex-col lg:items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 shrink-0">
                  {isCollection ? <Layers size={24} sm:size={28} /> : <Plus size={24} sm:size={28} />}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tighter text-zinc-900">
                  {isCollection ? 'Yeni Koleksiyon' : 'Yeni Kategori'}
                </h3>
                <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 leading-relaxed">
                  {isCollection ? 'Archive Planning' : 'Stratejik Sınıflandırma'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <div className="space-y-2">
                 <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                   {isCollection ? 'Başlık' : 'Başlık'}
                 </label>
                 <Input 
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder={isCollection ? "Örn. ARCHIVE 001" : "Örn. OUTERWEAR"} 
                  className="h-12 sm:h-14 bg-zinc-50/50 border-zinc-100 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs focus:bg-white focus:ring-1 focus:ring-black transition-all shadow-none" 
                 />
              </div>
              <Button 
                onClick={handleAdd}
                disabled={!newCat.trim()}
                className="w-full bg-black text-white hover:bg-zinc-800 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-30"
              >
                {isCollection ? 'Koleksiyonu Yayınla' : 'Kategoriyi Yayınla'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
