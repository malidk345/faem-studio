import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Package, Tag, DollarSign, Layers, Image as ImageIcon } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  editingProduct: any;
  categories: any[];
}

export function ProductModal({ isOpen, onClose, onSave, editingProduct, categories }: ProductModalProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    price: '',
    category: '',
    image_url: '',
    stock_count: 0,
    description: '',
    type: 'Standard'
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        price: editingProduct.price?.replace(' ₺', '') || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category: categories[0]?.name || categories[0] || '',
        image_url: '',
        stock_count: 24,
        description: '',
        type: 'Standard'
      });
    }
  }, [editingProduct, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: formData.price.includes('₺') ? formData.price : `${formData.price} ₺`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-10 space-y-10">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-zinc-950 flex items-center justify-center text-white shadow-2xl">
                  <Package size={26} />
                </div>
                <div>
                   <DialogTitle className="text-3xl font-black tracking-tighter">
                     {editingProduct ? 'Configure Asset' : 'New Asset Curation'}
                   </DialogTitle>
                   <DialogDescription className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                     Enterprise Inventory Terminal v2.0
                   </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-8 py-4">
              {/* Basic Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Name</Label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <Input 
                      id="name" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Chrome Obsidian Jacket" 
                      className="pl-12 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Market Valuation (₺)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">₺</span>
                    <Input 
                      id="price" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="8.500" 
                      className="pl-10 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all font-black"
                    />
                  </div>
                </div>
              </div>

              {/* Categorization & Visuals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Strategic Sector</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({...formData, category: val})}
                  >
                    <SelectTrigger className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat.name || cat} className="font-bold rounded-xl py-3">{cat.name || cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Inventory Depth</Label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <Input 
                      id="stock" 
                      type="number"
                      value={formData.stock_count}
                      onChange={(e) => setFormData({...formData, stock_count: parseInt(e.target.value)})}
                      className="pl-12 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white font-black"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Digital Asset URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                  <Input 
                    id="image" 
                    required
                    value={formData.image_url || formData.image}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://faem.studio/assets/..." 
                    className="pl-12 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white text-xs font-medium text-zinc-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Creative Narrative</Label>
                <Textarea 
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the material and visual philosophy..."
                  className="bg-zinc-50 border-transparent rounded-3xl p-6 min-h-[120px] focus:bg-white transition-all resize-none font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="bg-zinc-50 p-10 flex items-center justify-between sm:justify-between border-t border-zinc-100">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-transparent"
            >
              Abort
            </Button>
            <Button 
              type="submit"
              className="bg-zinc-950 text-white hover:bg-zinc-800 px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/30 transform transition-all active:scale-95"
            >
              {editingProduct ? 'Update Asset' : 'Initialize Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
