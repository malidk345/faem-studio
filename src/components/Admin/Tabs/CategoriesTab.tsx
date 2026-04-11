import React, { useState } from 'react';
import { Plus, Tags, Hash } from 'lucide-react';

interface CategoriesTabProps {
  categories: string[];
  onAdd: (name: string) => void;
}

export function CategoriesTab({ categories, onAdd }: CategoriesTabProps) {
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    onAdd(newCat.trim());
    setNewCat('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-black/5 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black tracking-tight">Koleksiyonlar</h2>
              <p className="text-[10px] uppercase font-bold text-black/30 tracking-widest mt-1">Aktİf Seçkİler</p>
            </div>
            <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-full uppercase tracking-widest">{categories.length} Toplam</span>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c, i) => (
              <div key={i} className="group p-6 bg-black/[0.02] hover:bg-black hover:text-white rounded-[2rem] transition-all duration-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black/5 group-hover:bg-white/10 flex items-center justify-center">
                    <Hash size={18} className="opacity-40" />
                  </div>
                  <span className="font-black tracking-tight">{c}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 sticky top-32">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Plus size={24} />
          </div>
          <h3 className="text-xl font-black tracking-tight mb-2">Yeni Koleksiyon</h3>
          <p className="text-white/40 text-xs font-medium mb-8 leading-relaxed">Yeni bir ürün grubu tanımlayarak envanterinizi organize edin.</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              placeholder="Örn: Yaz Sezonu '26" 
              className="w-full px-6 py-4 bg-white/10 border border-transparent rounded-[1.5rem] text-sm font-bold focus:outline-none focus:bg-white/20 focus:border-white/10 transition-all placeholder:text-white/20" 
            />
            <button 
              onClick={handleAdd}
              className="w-full bg-white text-black font-black py-4 rounded-[1.5rem] text-xs uppercase tracking-widest transition-all hover:bg-white/90 active:scale-95"
            >
              Koleksiyonu Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
