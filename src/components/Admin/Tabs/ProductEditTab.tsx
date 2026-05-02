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
    sizes: ['S', 'M', 'L', 'XL'],
    stock_count: 24,
    description: '',
    discount_price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (product) {
      const data = {
        name: product.name || '',
        price: product.price?.toString().replace(/[^\d]/g, '') || '',
        category: product.category || '',
        collection: product.collection || '',
        color: product.color || '',
        image_url: product.image_url || product.image || '',
        images: Array.isArray(product.images) ? product.images : [],
        features: Array.isArray(product.features) ? product.features : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL'],
        stock_count: product.stock_count || 0,
        description: product.description || '',
        discount_price: product.discount_price?.toString().replace(/[^\d]/g, '') || '',
      };
      setFormData(data);
    }
  }, [product]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (files: FileList | null, isGallery = false) => {
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
        updateField('images', [...formData.images, ...uploadedFiles]);
      } else {
        updateField('image_url', uploadedFiles[0].url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Yükleme sırasında bir hata oluştu.");
    } finally {
      setUploading(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Ürün adı zorunludur';
    if (!formData.price) newErrors.price = 'Fiyat zorunludur';
    if (!formData.category) newErrors.category = 'Kategori seçiniz';
    if (!formData.image_url) newErrors.image_url = 'Ana görsel gereklidir';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      document.getElementsByName(firstError)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const submissionData = {
      ...formData,
      price: formData.price.toString().includes('₺') ? formData.price : `${formData.price} ₺`,
      discount_price: formData.discount_price ? (formData.discount_price.toString().includes('₺') ? formData.discount_price : `${formData.discount_price} ₺`) : null,
      stock_count: parseInt(formData.stock_count) || 0,
    };

    setIsDirty(false);
    onSave(submissionData);
  };

  const adjustStock = (amount: number) => {
    const newVal = Math.max(0, (parseInt(formData.stock_count) || 0) + amount);
    updateField('stock_count', newVal);
  };


  return (
    <div className="max-w-5xl mx-auto pb-20 px-1 sm:px-4">
      {/* ── Compact Sticky Action Bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 -mx-4 px-4 py-2.5 sm:rounded-b-2xl mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (isDirty && !window.confirm('Kaydedilmemiş değişiklikleriniz var. Çıkmak istiyor musunuz?')) return;
                onCancel();
              }} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-all active:scale-90"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[13px] font-black tracking-tight text-gray-900 leading-tight">{product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-tight">Envanter Kataloğu</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mr-2 hidden sm:inline">Kaydedilmedi</span>}
            {product?.id && onDelete && (
              <button 
                onClick={() => {
                  if (window.confirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?')) {
                    onDelete(product.id);
                  }
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <Button 
              onClick={handleSubmit} 
              className="bg-emerald-600 text-white hover:bg-emerald-700 h-9 px-6 rounded-lg font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all active:scale-95"
            >
              <Save size={14} className="mr-2" /> {product ? 'Güncelle' : 'Yayınla'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: MEDIA ASSETS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Image with Drag & Drop */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Label className={`text-[10px] font-black uppercase tracking-widest ${errors.image_url ? 'text-rose-500' : 'text-gray-500'}`}>Ana Görsel</Label>
              <button onClick={() => setShowImageUrlInput(!showImageUrlInput)} className="p-1.5 rounded-md hover:bg-gray-50 text-gray-400">
                <LinkIcon size={12} />
              </button>
            </div>

            {showImageUrlInput && (
              <Input 
                placeholder="URL yapıştır..."
                value={formData.image_url}
                onChange={(e) => updateField('image_url', e.target.value)}
                className="h-9 bg-gray-50 border-gray-100 rounded-lg text-[10px] font-bold"
              />
            )}
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files, false);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all ${
                isDragging ? 'border-emerald-500 bg-emerald-50' : 
                errors.image_url ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 bg-gray-50'
              } hover:border-emerald-200`}
            >
              {formData.image_url ? (
                <img src={formData.image_url} className="w-full h-full object-cover" alt="Primary" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400">
                    {uploading === 'primary' ? <Loader2 className="animate-spin" size={16} /> : <Upload size={18} />}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Görsel Sürükle veya Seç</span>
                </div>
              )}
              <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => handleFileUpload(e.target.files, false)} />
            </div>
            {errors.image_url && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">{errors.image_url}</p>}
          </div>

          {/* Gallery */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Galeri</Label>
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{formData.images.length} Adet</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <AnimatePresence>
                {formData.images.map((img: any) => (
                  <motion.div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-50">
                    <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateField('images', formData.images.filter((i: any) => i.id !== img.id));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-white hover:border-emerald-300 transition-all"
              >
                {uploading === 'gallery' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
              <input type="file" hidden ref={galleryInputRef} accept="image/*" multiple onChange={(e) => handleFileUpload(e.target.files, true)} />
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={`text-[10px] font-bold uppercase ml-1 ${errors.name ? 'text-rose-500' : 'text-gray-400'}`}>Ürün İsmi *</Label>
                <Input 
                  name="name"
                  value={formData.name} 
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`h-10 bg-gray-50 border-gray-100 rounded-xl font-bold text-xs ${errors.name ? 'border-rose-200' : ''}`}
                />
                {errors.name && <p className="text-[9px] font-bold text-rose-500 ml-1">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Renk</Label>
                <Input 
                  value={formData.color} 
                  onChange={(e) => updateField('color', e.target.value)}
                  className="h-10 bg-gray-50 border-gray-100 rounded-xl font-bold text-xs" 
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={`text-[10px] font-bold uppercase ml-1 ${errors.price ? 'text-rose-500' : 'text-gray-400'}`}>Fiyat (₺) *</Label>
                <Input 
                  name="price"
                  type="number"
                  value={formData.price} 
                  onChange={(e) => updateField('price', e.target.value)}
                  className={`h-10 bg-gray-50 border-gray-100 rounded-xl font-black text-xs ${errors.price ? 'border-rose-200' : ''}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1 text-rose-500">İndirimli (₺)</Label>
                <Input 
                  type="number"
                  value={formData.discount_price} 
                  onChange={(e) => updateField('discount_price', e.target.value)}
                  className="h-10 bg-rose-50/30 border-rose-100 rounded-xl font-black text-xs text-rose-600" 
                />
              </div>
            </div>

            {/* Cat & Coll */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={`text-[10px] font-bold uppercase ml-1 ${errors.category ? 'text-rose-500' : 'text-gray-400'}`}>Kategori *</Label>
                <Select value={formData.category} onValueChange={(val) => updateField('category', val)}>
                  <SelectTrigger className={`h-10 bg-gray-50 border-gray-100 rounded-xl text-xs font-bold shadow-none ${errors.category ? 'border-rose-200' : ''}`}>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat, i) => (
                      <SelectItem key={i} value={cat.name || cat} className="text-xs">{cat.name || cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Koleksiyon</Label>
                <Select value={formData.collection} onValueChange={(val) => updateField('collection', val)}>
                  <SelectTrigger className="h-10 bg-gray-50 border-gray-100 rounded-xl text-xs font-bold shadow-none">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {collections.map((coll, i) => (
                      <SelectItem key={i} value={coll.name || coll} className="text-xs">{coll.name || coll}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sizes & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Bedenler</Label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {formData.sizes?.map((size: string, idx: number) => (
                    <div key={size + idx} className="flex items-center bg-white border border-gray-200 px-2 py-1 rounded-lg gap-1.5">
                      <span className="text-[10px] font-black uppercase">{size}</span>
                      <button 
                        onClick={() => updateField('sizes', formData.sizes.filter((_: any, i: number) => i !== idx))}
                        className="text-gray-400 hover:text-rose-500"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <input 
                    placeholder="+ Ekle"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                        if (val && !formData.sizes?.includes(val)) {
                          updateField('sizes', [...(formData.sizes || []), val]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="bg-transparent border-none text-[10px] font-bold w-12 outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Stok Adedi</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1 flex-1">
                    <button 
                      onClick={() => adjustStock(-1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-500"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={formData.stock_count}
                      onChange={(e) => updateField('stock_count', parseInt(e.target.value) || 0)}
                      className="bg-transparent border-none text-center font-black text-xs w-full outline-none"
                    />
                    <button 
                      onClick={() => adjustStock(1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-emerald-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features (New Functional Addition) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Özellikler</Label>
                <span className="text-[9px] font-bold text-gray-300">{formData.features.length}/10</span>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Örn: %100 Pamuk"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFeature.trim()) {
                      e.preventDefault();
                      updateField('features', [...formData.features, newFeature.trim()]);
                      setNewFeature('');
                    }
                  }}
                  className="h-10 bg-gray-50 border-gray-100 rounded-xl text-xs font-medium"
                />
                <Button 
                  onClick={() => {
                    if (newFeature.trim()) {
                      updateField('features', [...formData.features, newFeature.trim()]);
                      setNewFeature('');
                    }
                  }}
                  variant="outline"
                  className="h-10 w-10 p-0 rounded-xl border-gray-100"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-[10px] font-bold">
                    {f}
                    <button onClick={() => updateField('features', formData.features.filter((_: any, idx: number) => idx !== i))}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description with Char Count */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Açıklama</Label>
                <span className={`text-[9px] font-bold ${formData.description.length > 450 ? 'text-rose-500' : 'text-gray-300'}`}>
                  {formData.description.length}/500
                </span>
              </div>
              <Textarea 
                value={formData.description} 
                onChange={(e) => updateField('description', e.target.value.slice(0, 500))}
                placeholder="Ürün hikayesini anlatın..."
                className="bg-gray-50 border-gray-100 rounded-xl min-h-[120px] text-xs font-medium resize-none leading-relaxed" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
