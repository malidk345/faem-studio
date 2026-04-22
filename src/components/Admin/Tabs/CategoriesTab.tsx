import React, { useState } from 'react';
import { Plus, Tags, Hash, Layers, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CategoriesTabProps {
  categories: any[];
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Categories List Section */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between mb-4">
           <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Kategoriler</h2>
              <p className="text-zinc-500 text-[11px] font-medium mt-1">Mağazanızın ürün kategorilerini yönetin.</p>
           </div>
           <Badge variant="secondary" className="font-semibold bg-zinc-100 text-zinc-600 px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest border-none">
              {categories.length} Kategori
           </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.length > 0 ? (
            categories.map((c, i) => (
              <Card key={i} className="group apple-card hover:border-zinc-300 transition-all duration-300 border-none cursor-pointer overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Hash size={20} className="text-zinc-400 group-hover:text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold tracking-tight text-zinc-900 text-lg leading-none">{c.name || c}</span>
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-1.5">Kategori Grubu</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                    </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center px-6">
               <Layers className="text-zinc-300 mb-4" size={48} />
               <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Kategori Bulunmuyor</h3>
               <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">Henüz bir ürün kategorisi oluşturmadınız. Envanterinizi organize etmek için sağ panelden yeni bir kategori ekleyin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Section */}
      <div className="lg:col-span-4">
        <Card className="bg-zinc-900 text-white rounded-[2rem] border-none shadow-xl shadow-zinc-900/20 p-4 sticky top-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <CardHeader className="space-y-4 pt-6">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl">
                <Plus size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">Yeni Kategori Ekle</CardTitle>
              <CardDescription className="text-zinc-400 text-[11px] font-medium leading-relaxed mt-1">
                Kataloğunuzu genişletmek için yeni bir kategori ismi girin.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-6">
            <div className="space-y-3">
               <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 ml-1">Kategori Adı</label>
               <Input 
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="Örn. Giyim" 
                className="h-12 bg-white/10 border-transparent rounded-xl font-medium focus:bg-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/30 text-white" 
               />
            </div>
            <Button 
              onClick={handleAdd}
              disabled={!newCat.trim()}
              className="w-full bg-white text-zinc-900 hover:bg-zinc-100 h-12 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              Kategori Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
