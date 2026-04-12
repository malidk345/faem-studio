import React, { useState, useEffect } from 'react';
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
  Plus, X, Sparkles, ChevronLeft, Save, Trash2
} from 'lucide-react';

interface ProductEditTabProps {
  product: any;
  categories: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function ProductEditTab({ product, categories, onSave, onCancel, onDelete }: ProductEditTabProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    price: '',
    category: '',
    image_url: '',
    images: [],
    features: [],
    stock_count: 24,
    description: '',
    type: 'Standard'
  });

  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price?.replace(' ₺', '') || '',
        images: Array.isArray(product.images) ? product.images : [],
        features: Array.isArray(product.features) ? product.features : []
      });
    }
  }, [product]);

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
      price: formData.price.toString().includes('₺') ? formData.price : `${formData.price} ₺`
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-32">
      {/* Header Navigation */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-md py-4 border-b border-zinc-100 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >
            <ChevronLeft size={16} /> Back to Assets
        </button>
        <div className="flex gap-2">
            {product?.id && onDelete && (
                <Button 
                variant="ghost" 
                onClick={() => onDelete(product.id)}
                className="text-rose-500 hover:bg-rose-50 rounded-xl"
                >
                    <Trash2 size={18} />
                </Button>
            )}
            <Button 
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-zinc-800 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10"
            >
                <Save size={16} className="mr-2" /> Save Changes
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-10">
            <section className="space-y-6">
                <div>
                   <h2 className="text-2xl font-black tracking-tight text-zinc-900">Core Identity</h2>
                   <p className="text-zinc-400 text-xs font-medium">Define the technical name and market valuation.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Asset Designation</Label>
                        <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Product Title"
                            className="h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white font-bold"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction Value (₺)</Label>
                        <Input 
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Price"
                            className="h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white font-black"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Product Narration</h2>
                        <p className="text-zinc-400 text-xs font-medium">Draft the visual and material philosophy.</p>
                    </div>
                </div>
                <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-zinc-50 border-transparent rounded-3xl p-6 min-h-[160px] focus:bg-white transition-all font-bold text-sm resize-none"
                    placeholder="Tell the story of this piece..."
                />
            </section>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900">Technical Details</h2>
                    <p className="text-zinc-400 text-xs font-medium">Add unique features and material specifics.</p>
                </div>
                
                <div className="flex gap-2">
                    <Input 
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="e.g. 100% Recycled Cotton"
                        className="h-14 bg-zinc-50 border-transparent rounded-2xl focus:bg-white font-bold"
                    />
                    <Button onClick={addFeature} className="h-14 bg-zinc-900 text-white rounded-2xl px-6">
                        <Plus size={20} />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {formData.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl group hover:bg-zinc-100 transition-colors">
                            <span className="text-xs font-bold text-zinc-800">{f}</span>
                            <button onClick={() => removeFeature(i)} className="text-zinc-300 hover:text-rose-500">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* Right Column: Visuals & Params */}
        <div className="lg:col-span-4 space-y-10">
            <section className="space-y-6 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Parameters</h3>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                        >
                            <SelectTrigger className="h-12 bg-white border-transparent rounded-xl shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {categories.map((cat, i) => (
                                    <SelectItem key={i} value={cat.name || cat}>{cat.name || cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Inventory Status</Label>
                        <Input 
                            type="number"
                            value={formData.stock_count}
                            onChange={(e) => setFormData({ ...formData, stock_count: parseInt(e.target.value) })}
                            className="h-12 bg-white border-transparent rounded-xl shadow-sm font-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase">Collection Class</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger className="h-12 bg-black text-white border-transparent rounded-xl shadow-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="Standard">Standard</SelectItem>
                                <SelectItem value="Limited">Limited Edition</SelectItem>
                                <SelectItem value="Premium">Premium Archival</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Imagery</h3>
                
                <div className="space-y-4">
                    <div className="aspect-[3/4] bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200 relative group">
                        {formData.image_url ? (
                            <img src={formData.image_url} className="w-full h-full object-cover" alt="primary" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                                <ImageIcon size={48} strokeWidth={1} />
                                <span className="text-[10px] font-black uppercase tracking-widest mt-4">Primary Missing</span>
                            </div>
                        )}
                        <div className="absolute inset-x-4 bottom-4">
                            <Input 
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="Primary URL"
                                className="h-10 bg-white/90 backdrop-blur shadow-xl border-none text-[10px] font-bold rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {formData.images.map((img: any) => (
                           <div key={img.id} className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden relative group border border-zinc-100">
                                <img src={img.url} className="w-full h-full object-cover" alt="gallery" />
                                <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={12} />
                                </button>
                           </div> 
                        ))}
                        <div className="aspect-square border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-center p-4">
                            <div className="flex flex-col gap-2 w-full">
                                <Input 
                                    value={newImage}
                                    onChange={(e) => setNewImage(e.target.value)}
                                    placeholder="Add URL"
                                    className="h-8 text-[9px] px-2 rounded-lg"
                                />
                                <Button onClick={addImage} size="sm" className="h-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 rounded-lg text-[9px] font-black uppercase">Add</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
