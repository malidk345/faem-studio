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
        <div className="flex items-center justify-between mb-2">
           <div>
              <h2 className="text-2xl font-black tracking-tighter text-zinc-900">Strategic Sectors</h2>
              <p className="text-zinc-400 text-xs font-medium">Manage and organize your retail product categories.</p>
           </div>
           <Badge variant="outline" className="font-bold border-zinc-200 px-4 py-1.5 rounded-xl uppercase text-[10px] tracking-widest">
              {categories.length} Registered Sectors
           </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c, i) => (
            <Card key={i} className="group hover:border-zinc-900 transition-all duration-300 shadow-none border-zinc-100 cursor-pointer overflow-hidden">
               <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                      <Hash size={20} className="opacity-40" />
                    </div>
                    <div className="flex flex-col">
                       <span className="font-black tracking-tight text-zinc-900 text-lg leading-none">{c.name || c}</span>
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Operational Sector</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-4 w-4" />
                  </Button>
               </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Category Section */}
      <div className="lg:col-span-4">
        <Card className="bg-zinc-950 text-white rounded-[2.5rem] border-none shadow-2xl p-4 sticky top-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <CardHeader className="space-y-4 pt-8">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <Plus size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">Deploy Sector</CardTitle>
              <CardDescription className="text-white/40 text-xs font-medium leading-relaxed">
                Initialize a new strategic product group to expand your enterprise core.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Sector Designation</label>
               <Input 
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="e.g. Winter Expedition '26" 
                className="h-14 bg-white/10 border-transparent rounded-2xl font-bold focus:bg-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20 text-white" 
               />
            </div>
            <Button 
              onClick={handleAdd}
              disabled={!newCat.trim()}
              className="w-full bg-white text-black hover:bg-zinc-100 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-black/40 transition-all active:scale-95 disabled:opacity-50"
            >
              Initialize Sector
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
