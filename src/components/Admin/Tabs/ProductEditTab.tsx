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
  Plus, X, ChevronLeft, Save, Trash2, Upload, Loader2, Image as ImageIcon, CheckCircle2, Link as LinkIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface ProductEditTabProps {
  product: any;
  categories: any[];
  collections: any[];
  onSave: (data: any) => void;
  onAddCategory?: (name: string) => void;
  onAddCollection?: (name: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function ProductEditTab({ product, categories, collections, onSave, onAddCategory, onAddCollection, onCancel, onDelete }: ProductEditTabProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    price: '',
    category: '',
    collection: '',
    color: '',
    image_url: '',
    images: [],
    features: [],
    stock_count: 24,
    description: '',
    discount_price: '',
  });

  const [uploading, setUploading] = useState<string | null>(null); // 'primary' | 'gallery' | null
  const [newFeature, setNewFeature] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString().replace(/[^\d]/g, '') || '',
        category: product.category || '',
        collection: product.collection || '',
        color: product.color || '',
        image_url: product.image_url || product.image || '',
        images: Array.isArray(product.images) ? product.images : [],
        features: Array.isArray(product.features) ? product.features : [],
        stock_count: product.stock_count || 24,
        description: product.description || '',
        discount_price: product.discount_price?.toString().replace(/[^\d]/g, '') || '',
      });
    }
  }, [product]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(isGallery ? 'gallery' : 'primary');
    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        return { id: crypto.randomUUID(), url: publicUrl };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      if (isGallery) {
        setFormData((prev: any) => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedFiles] 
        }));
      } else {
        setFormData((prev: any) => ({ ...prev, image_url: uploadedFiles[0].url }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((prev: any) => ({ 
      ...prev, 
      features: [...prev.features, newFeature.trim()] 
    }));
    setNewFeature('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    // Sanitize data specifically for Supabase table schema
    const submissionData = {
      name: formData.name,
      price: formData.price.toString().includes('₺') ? formData.price : `${formData.price} ₺`,
      category: formData.category,
      image_url: formData.image_url,
      images: formData.images,
      features: formData.features,
      stock_count: parseInt(formData.stock_count) || 0,
      description: formData.description,
      discount_price: formData.discount_price ? (formData.discount_price.toString().includes('₺') ? formData.discount_price : `${formData.discount_price} ₺`) : null,
    };

    onSave(submissionData);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-3 sm:px-0">
      {/* ─── COMPACT STICKY ORCHESTRATOR ─── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-100 -mx-3 px-3 py-3 sm:mx-0 sm:px-0 sm:rounded-t-3xl mb-4 sm:mb-8 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onCancel} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-zinc-100 rounded-xl sm:rounded-2xl transition-all active:scale-90">
              <ChevronLeft size={20} className="text-zinc-600" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm sm:text-base font-black tracking-tight leading-none mb-0.5">{product ? 'Edit Asset' : 'New Curation'}</h2>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Studio Catalog</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {product?.id && onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(product.id)}
                className="w-9 h-9 sm:w-10 sm:h-10 text-rose-500 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all active:scale-95"
              >
                <Trash2 size={16} />
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              className="bg-black text-white hover:bg-zinc-800 h-10 sm:h-12 px-5 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[12px] uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              <Save size={13} className="mr-1.5 sm:mr-2" /> {product ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: MEDIA ASSETS */}
        <div className="lg:col-span-5 space-y-8">
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Master Source</Label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowImageUrlInput(!showImageUrlInput)}
                  className={`p-1.5 rounded-lg transition-all ${showImageUrlInput ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                  title="Link ile Ekle"
                >
                  <LinkIcon size={12} />
                </button>
                {formData.image_url && <CheckCircle2 size={12} className="text-emerald-500" />}
              </div>
            </div>

            {showImageUrlInput && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="relative">
                  <Input 
                    placeholder="Görsel linkini yapıştırın..."
                    value={formData.image_url}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, image_url: e.target.value }))}
                    className="h-10 bg-zinc-50 border-zinc-100 focus:border-black rounded-xl text-[10px] font-bold"
                  />
                </div>
              </motion.div>
            )}
            
            <motion.div 
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/5] bg-zinc-50 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-black/20 hover:bg-zinc-100/50 transition-all duration-500"
            >
              {formData.image_url ? (
                <>
                  <img src={formData.image_url} className="w-full h-full object-cover" alt="Primary" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 text-white">
                    <ImageIcon size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Swap Master</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 sm:gap-5 text-center p-6 sm:p-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-white shadow-xl shadow-black/[0.03] flex items-center justify-center text-zinc-400 group-hover:text-black transition-all duration-500">
                    {uploading === 'primary' ? <Loader2 className="animate-spin text-black" size={20} /> : <Upload size={22} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Upload Primary</p>
                    <p className="text-[9px] text-zinc-400 font-medium leading-tight">Touch to select view</p>
                  </div>
                </div>
              )}
              <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
            </motion.div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Studio Gallery</Label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowGalleryUrlInput(!showGalleryUrlInput)}
                  className={`p-1.5 rounded-lg transition-all ${showGalleryUrlInput ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                  title="Link ile Ekle"
                >
                  <LinkIcon size={12} />
                </button>
                <span className="text-[10px] font-bold text-zinc-300 italic">{formData.images.length} Loaded</span>
              </div>
            </div>

            {showGalleryUrlInput && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="flex gap-2">
                  <Input 
                    placeholder="Galeri görsel linki..."
                    value={tempGalleryUrl}
                    onChange={(e) => setTempGalleryUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempGalleryUrl.trim()) {
                          setFormData((prev: any) => ({
                            ...prev,
                            images: [...prev.images, { id: crypto.randomUUID(), url: tempGalleryUrl.trim() }]
                          }));
                          setTempGalleryUrl('');
                        }
                      }
                    }}
                    className="h-10 bg-zinc-50 border-zinc-100 focus:border-black rounded-xl text-[10px] font-bold flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (tempGalleryUrl.trim()) {
                        setFormData((prev: any) => ({
                          ...prev,
                          images: [...prev.images, { id: crypto.randomUUID(), url: tempGalleryUrl.trim() }]
                        }));
                        setTempGalleryUrl('');
                      }
                    }}
                    className="h-10 rounded-xl px-3 border-zinc-100 hover:bg-zinc-100"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
              <AnimatePresence>
                {formData.images.map((img: any) => (
                  <motion.div 
                    key={img.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-100 group shadow-sm shadow-black/[0.02]"
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev: any) => ({
                          ...prev,
                          images: prev.images.filter((i: any) => i.id !== img.id)
                        }));
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity hover:bg-rose-500"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-100 hover:border-black/20 hover:text-black transition-all duration-300"
              >
                {uploading === 'gallery' ? (
                  <Loader2 size={24} className="animate-spin text-black" />
                ) : (
                  <>
                    <Plus size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add Views</span>
                  </>
                )}
              </motion.button>
              <input type="file" hidden ref={galleryInputRef} accept="image/*" multiple onChange={(e) => handleFileUpload(e, true)} />
            </div>
          </section>
        </div>

        {/* RIGHT: CURATION DETAILS */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="bg-white lg:border border-zinc-100 lg:rounded-3xl p-0 lg:p-8 space-y-6 sm:space-y-8">
            
            {/* Core Identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Name</Label>
                <Input 
                  placeholder="e.g., ARCHIVE TEE"
                  value={formData.name} 
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="h-11 sm:h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-xl font-bold text-xs sm:text-sm transition-all shadow-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tone (Color)</Label>
                <Input 
                  placeholder="e.g., PITCH BLACK"
                  value={formData.color} 
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, color: e.target.value }))}
                  className="h-11 sm:h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-xl font-bold text-xs sm:text-sm transition-all shadow-none" 
                />
              </div>
            </div>
            {/* Valuation Details */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Valuation (₺)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.price} 
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
                    className="h-11 sm:h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-xl font-black text-xs sm:text-sm pl-8 sm:pl-10 transition-all shadow-none" 
                  />
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-xs sm:text-sm italic">₺</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-rose-400 ml-1">Discount (₺)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="Opt"
                    value={formData.discount_price} 
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, discount_price: e.target.value }))}
                    className="h-11 sm:h-12 bg-rose-50/20 border-zinc-100 focus:border-rose-500 rounded-xl font-black text-xs sm:text-sm pl-8 sm:pl-10 transition-all text-rose-600 shadow-none" 
                  />
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-black text-rose-400/50 text-xs sm:text-sm italic">₺</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Sector (Category)</Label>
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={(val) => setFormData((prev: any) => ({ ...prev, category: val }))}>
                    <SelectTrigger className="h-11 sm:h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-xl text-[10px] font-black uppercase tracking-wider shadow-none flex-1">
                      <SelectValue placeholder="SELECT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {categories.map((cat, i) => (
                        <SelectItem key={i} value={cat.name || cat} className="rounded-xl font-bold py-2 sm:py-3 text-xs">
                          {cat.name || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const newCat = window.prompt('Yeni kategori adını girin:');
                      if (newCat && onAddCategory) {
                        onAddCategory(newCat);
                        setFormData((prev: any) => ({ ...prev, category: newCat }));
                      }
                    }}
                    className="h-11 sm:h-12 w-11 sm:w-12 p-0 bg-zinc-50/50 border-zinc-100 rounded-xl hover:bg-zinc-100"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Archive (Collection)</Label>
                <div className="flex gap-2">
                  <Select value={formData.collection} onValueChange={(val) => setFormData((prev: any) => ({ ...prev, collection: val }))}>
                    <SelectTrigger className="h-11 sm:h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-xl text-[10px] font-black uppercase tracking-wider shadow-none flex-1">
                      <SelectValue placeholder="SELECT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {collections.map((coll, i) => (
                        <SelectItem key={i} value={coll.name || coll} className="rounded-xl font-bold py-2 sm:py-3 text-xs">
                          {coll.name || coll}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const newColl = window.prompt('Yeni koleksiyon adını girin:');
                      if (newColl && onAddCollection) {
                        onAddCollection(newColl);
                        setFormData((prev: any) => ({ ...prev, collection: newColl }));
                      }
                    }}
                    className="h-11 sm:h-12 w-11 sm:w-12 p-0 bg-zinc-50/50 border-zinc-100 rounded-xl hover:bg-zinc-100"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Inventory</Label>
              <Input 
                type="number" 
                value={formData.stock_count} 
                onChange={(e) => setFormData((prev: any) => ({ ...prev, stock_count: parseInt(e.target.value) }))}
                className="h-11 sm:h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-xl font-black text-xs sm:text-sm transition-all shadow-none" 
              />
            </div>

            <div className="space-y-3 sm:space-y-4 pt-4 border-t border-zinc-50">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Size Management</Label>
                <span className="text-[9px] font-bold text-zinc-300 italic">{formData.sizes?.length || 0} Sizes Available</span>
              </div>
              <div className="flex flex-wrap gap-2 p-2 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                <AnimatePresence mode="popLayout">
                  {formData.sizes?.map((size: string, idx: number) => (
                    <motion.div
                      key={size + idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="group relative flex items-center bg-white border border-zinc-200 px-3 py-1.5 rounded-xl gap-2 hover:border-black transition-all"
                    >
                      <span className="text-[10px] font-black tracking-tight text-zinc-900 uppercase">{size}</span>
                      <button 
                        onClick={() => setFormData((prev: any) => ({
                          ...prev,
                          sizes: prev.sizes.filter((_: any, i: number) => i !== idx)
                        }))}
                        className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <div className="flex-1 min-w-[120px] relative">
                  <Input 
                    placeholder="Add Size (e.g. XL, 42)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                        if (val && !formData.sizes?.includes(val)) {
                          setFormData((prev: any) => ({
                            ...prev,
                            sizes: [...(prev.sizes || []), val]
                          }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="h-8 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 shadow-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Narrative Description</Label>
              <Textarea 
                placeholder="Describe the essence of this piece..."
                value={formData.description} 
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                className="bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl p-4 min-h-[140px] text-sm font-medium leading-relaxed transition-all resize-none" 
              />
            </div>

            {/* Peculiarities (Features) */}
            <div className="space-y-3 sm:space-y-4 pt-4 border-t border-zinc-50">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Peculiarities</Label>
                <span className="text-[9px] font-bold text-zinc-300 italic">{formData.features.length}/8 Max</span>
              </div>
              <div className="flex gap-2 p-1 bg-zinc-50 rounded-xl sm:rounded-2xl border border-zinc-100 focus-within:border-black transition-colors">
                <Input 
                  placeholder="Feature..."
                  value={newFeature} 
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="border-none bg-transparent h-9 sm:h-10 shadow-none focus-visible:ring-0 font-bold text-xs" 
                />
                <Button 
                  onClick={addFeature} 
                  className="bg-black text-white w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-lg sm:rounded-xl shadow-lg shadow-black/10 active:scale-90 transition-all"
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <AnimatePresence>
                  {formData.features.map((f: string, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="group flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-900 hover:text-white border border-zinc-100 px-2.5 py-1.5 rounded-lg sm:rounded-xl transition-all duration-300"
                    >
                      <CheckCircle2 size={10} className="text-zinc-300 group-hover:text-white transition-colors" />
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide">{f}</span>
                      <button 
                        onClick={() => setFormData((prev: any) => ({ ...prev, features: prev.features.filter((_: any, idx: number) => idx !== i) }))}
                        className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Guidance */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900 border border-zinc-100 shadow-sm shrink-0">
               <span className="text-xs font-black">?</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-black uppercase tracking-wider">Curation Tip</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium"> Ensure that the narration accurately reflects the high-craftsmanship of FAEM Studio pieces. Visual assets at 4:5 aspect ratio perform best across all interfaces. </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
