import React from 'react';
import { Plus, Trash2, Search, Filter, Edit } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductsTabProps {
  products: any[];
  onAdd: () => void;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductsTab({ products, onAdd, onEdit, onDelete }: ProductsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <FilterButton label="Tümü" active />
          <FilterButton label="Stokta Var" />
          <FilterButton label="Tükendi" />
          <FilterButton label="Taslaklar" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors" />
            <input 
                type="text" 
                placeholder="Ürün Ara..." 
                className="pl-11 pr-6 py-3 bg-black/[0.03] border border-transparent rounded-2xl text-xs font-bold focus:outline-none focus:bg-white focus:border-black/10 transition-all w-full md:w-64"
            />
          </div>
          <button onClick={onAdd} className="bg-black text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 active:scale-95">
            <Plus size={16} /> Ürün Ekle
          </button>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-black/[0.01] border-b border-black/5">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Ürün Bilgisi</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Koleksiyon</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-right">Fiyat</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-right">Stok</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-black/[0.01] transition-colors group/row">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/5 flex-shrink-0 group-hover/row:scale-105 transition-transform duration-500 shadow-sm">
                        <img src={p.image_url || p.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black tracking-tight text-sm leading-tight group-hover/row:translate-x-1 transition-transform">{p.name}</p>
                        <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest mt-1">Ref: {p.id.slice(0, 6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-black/60 bg-black/5 px-3 py-1 rounded-lg">{p.category}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-right tracking-tighter text-base">{p.price}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold">{p.stock_count || 24} Adet</span>
                      <div className="w-12 h-1 bg-black/5 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-black rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(p)} className="p-2.5 rounded-xl bg-black/5 hover:bg-black hover:text-white transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onDelete(p.id)} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-black/30 font-bold uppercase tracking-widest text-[10px]">Henüz ürün eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-black/40 hover:bg-black/5 hover:text-black'
    }`}>
      {label}
    </button>
  )
}
