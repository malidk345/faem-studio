import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { 
  Plus, X, ChevronLeft, Save, Trash2, Upload, Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (isGallery) {
        setFormData({ ...formData, images: [...formData.images, { id: Date.now().toString(), url: publicUrl }] });
      } else {
        setFormData({ ...formData, image_url: publicUrl });
      }
    } catch (error) {
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_: any, i: number) => i !== idx) });
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
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      {/* Ultra-Compact Sticky Header */}
      <div className="flex items-center justify-between sticky top-0 z-30 bg-white/90 backdrop-blur-sm py-2 border-b -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onClick={onCancel} className="p-2 -ml-2"><ChevronLeft size={20} /></button>
        <div className="flex gap-2">
            {product?.id && onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)} className="text-rose-500 h-9 w-9 p-0">
                    <Trash2 size={16} />
                </Button>
            )}
            <Button onClick={handleSubmit} className="bg-black text-white h-9 px-4 rounded-lg font-bold text-[11px] uppercase tracking-wider">
                <Save size={14} className="mr-1.5" /> Save
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Main Photo Upload */}
        <div className="aspect-[4/5] bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden group">
            {formData.image_url ? (
                <>
                    <img src={formData.image_url} className="w-full h-full object-cover" alt="primary" />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">Change Asset</button>
                </>
            ) : (
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2">
                    {uploading ? <Loader2 className="animate-spin text-zinc-400" /> : <Upload className="text-zinc-300" />}
                    <span className="text-[10px] font-black uppercase text-zinc-400">Primary Core Asset</span>
                </button>
            )}
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Title</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-10 bg-zinc-50 border-none rounded-xl font-bold text-xs" />
                </div>
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Valuation (₺)</Label>
                    <Input value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-10 bg-zinc-50 border-none rounded-xl font-black text-xs" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Sector</Label>
                   <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                        <SelectTrigger className="h-10 bg-zinc-50 border-none rounded-xl text-xs font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                            {categories.map((cat, i) => <SelectItem key={i} value={cat.name || cat} className="text-xs font-bold">{cat.name || cat}</SelectItem>)}
                        </SelectContent>
                   </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Inventory</Label>
                    <Input type="number" value={formData.stock_count} onChange={(e) => setFormData({ ...formData, stock_count: parseInt(e.target.value) })} className="h-10 bg-zinc-50 border-none rounded-xl font-black text-xs" />
                </div>
            </div>

            <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Narration</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-50 border-none rounded-xl p-3 min-h-[80px] text-xs font-bold resize-none" />
            </div>

            {/* Gallery Upload */}
            <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Gallery Support</Label>
                <div className="flex flex-wrap gap-2">
                    {formData.images.map((img: any) => (
                        <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border">
                            <img src={img.url} className="w-full h-full object-cover" alt="gallery" />
                            <button onClick={() => removeImage(img.id)} className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-bl-lg"><X size={10} /></button>
                        </div>
                    ))}
                    <button onClick={() => galleryInputRef.current?.click()} className="w-16 h-16 rounded-xl border border-dashed border-zinc-200 flex items-center justify-center bg-zinc-50 text-zinc-300">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                    <input type="file" hidden ref={galleryInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Peculiarities</Label>
                <div className="flex gap-2">
                    <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="New feature..." className="h-10 bg-zinc-50 border-none rounded-xl text-[10px] font-bold" />
                    <Button onClick={addFeature} className="h-10 w-10 p-0 bg-zinc-900 text-white rounded-xl"><Plus size={18} /></Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded-lg text-[10px] font-extrabold text-zinc-600">
                            {f} <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => removeFeature(i)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
