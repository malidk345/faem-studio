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
import { 
  Package, Tag, Layers, Image as ImageIcon, 
  Plus, X, Sparkles 
} from 'lucide-react';

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
    images: [],
    features: [],
    stock_count: 24,
    description: '',
    type: 'Standard',
    discount_price: ''
  });

  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        price: editingProduct.price?.replace(' ₺', '') || '',
        discount_price: editingProduct.discount_price?.replace(' ₺', '') || '',
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [],
        features: Array.isArray(editingProduct.features) ? editingProduct.features : []
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category: categories[0]?.name || categories[0] || '',
        image_url: '',
        images: [],
        features: [],
        stock_count: 24,
        description: '',
        type: 'Standard',
        discount_price: ''
      });
    }
  }, [editingProduct, categories, isOpen]);

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_: any, i: number) => i !== idx) });
  };

  const addImage = () => {
    if (!newImage.trim()) return;
    const imgObj = { id: `img-${Date.now()}`, url: newImage.trim() };
    setFormData({ ...formData, images: [...formData.images, imgObj] });
    setNewImage('');
  };

  const removeImage = (id: string) => {
    setFormData({ ...formData, images: formData.images.filter((img: any) => img.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: formData.price.toString().includes('₺') || !formData.price ? formData.price : `${formData.price} ₺`,
      discount_price: (formData.discount_price && !formData.discount_price.toString().includes('₺')) ? `${formData.discount_price} ₺` : (formData.discount_price || null)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] md:max-w-[750px] max-h-[90vh] overflow-y-auto bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-2xl p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-10 space-y-8 md:space-y-10">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-zinc-950 flex items-center justify-center text-white shadow-2xl">
                  <Package size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter">
                    {editingProduct ? 'Configure Asset' : 'New Asset Curation'}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1">
                    Enterprise Inventory Terminal v3.0 • Mobile Optimized
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-6 md:gap-8 py-4">
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="8.500"
                      className="pl-10 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-black transition-all font-black"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="discount_price" className="text-[10px] font-black uppercase tracking-widest text-rose-400 ml-1">Strategic Discount (₺)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 font-bold">₺</span>
                    <Input
                      id="discount_price"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      placeholder="Optional"
                      className="pl-10 h-14 bg-rose-50/30 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all font-black text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Image Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Media Gallery</Label>
                  <span className="text-[9px] font-bold text-zinc-300 uppercase italic">Primary + Gallery Assets</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Primary Display</p>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                      <Input
                        required
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Primary image URL..."
                        className="pl-12 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Add Gallery Image</p>
                    <div className="flex gap-2">
                      <Input
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="Gallery URL..."
                        className="h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white text-xs"
                      />
                      <Button type="button" onClick={addImage} className="h-14 w-14 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-none shrink-0 shadow-sm">
                        <Plus size={20} />
                      </Button>
                    </div>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 p-4 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                    {formData.images.map((img: any) => (
                      <div key={img.id} className="group relative w-20 h-20 rounded-xl overflow-hidden border bg-white shadow-sm transition-transform active:scale-95">
                        <img src={img.url} className="w-full h-full object-cover" alt="gallery" />
                        <button 
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categorization & Strategic Params */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Strategic Sector</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat.name || cat} className="font-bold rounded-xl py-3">{cat.name || cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Warehouse Units</Label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_count}
                      onChange={(e) => setFormData({ ...formData, stock_count: parseInt(e.target.value) })}
                      className="pl-12 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white font-black"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Class</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="h-14 bg-zinc-950 rounded-2xl flex items-center px-4 gap-2 text-white shadow-inner border-none">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        <SelectItem value="Standard" className="font-bold rounded-xl py-3">Standard</SelectItem>
                        <SelectItem value="Limited" className="font-bold rounded-xl py-3 text-amber-500">Limited</SelectItem>
                        <SelectItem value="Premium" className="font-bold rounded-xl py-3 text-emerald-500">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Features Management */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Peculiarities</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="e.g. 100% Recycled Obsidian Fibers..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="pl-12 h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white font-medium"
                    />
                  </div>
                  <Button type="button" onClick={addFeature} className="h-14 bg-zinc-900 text-white rounded-2xl px-6 font-bold flex items-center gap-2">
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Detail</span>
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-xl group transition-all hover:bg-zinc-100">
                      <span className="text-[11px] font-bold text-zinc-700">{feature}</span>
                      <button type="button" onClick={() => removeFeature(idx)} className="text-zinc-300 hover:text-rose-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.features.length === 0 && (
                    <p className="text-[10px] text-zinc-300 italic font-medium py-2 ml-1">No specific features deployed.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Creative Narrative</Label>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the material and visual philosophy..."
                  className="bg-zinc-50 border-transparent rounded-3xl p-6 min-h-[120px] focus:bg-white transition-all resize-none font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="bg-zinc-50 p-6 md:p-10 flex items-center justify-between sm:justify-between border-t border-zinc-100">
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
              className="bg-zinc-950 text-white hover:bg-zinc-800 px-8 md:px-12 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/30 transform transition-all active:scale-95"
            >
              {editingProduct ? 'Update Asset' : 'Initialize Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
