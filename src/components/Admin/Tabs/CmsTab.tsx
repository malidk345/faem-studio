import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Plus, Trash2, Layout, Tag, Save, 
  X, Upload, Loader2, Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';

interface CmsTabProps {
  categories: any[];
}

export function CmsTab({ categories }: CmsTabProps) {
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: slides, error: err1 } = await supabase.from('site_content').select('*').order('priority', { ascending: true });
      const { data: promos, error: err2 } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
      
      if (slides) setHeroSlides(slides);
      if (promos) setPromotions(promos);
    } catch (err) {
      console.warn('CMS tables might be missing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(slideId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `cms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      await updateSlide(slideId, { image_url: publicUrl });
    } catch (error) {
      console.error("Link upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  const addSlide = async () => {
    const newSlide = {
      title: 'Zanaat ve Estetik',
      subtitle: 'Koleksiyon 2026',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      priority: heroSlides.length + 1,
      is_active: true,
      button_text: 'Keşfet'
    };
    const { error } = await supabase.from('site_content').insert([newSlide]);
    if (!error) fetchData();
  };

  const updateSlide = async (id: string, updates: any) => {
    const { error } = await supabase.from('site_content').update(updates).eq('id', id);
    if (!error) {
      setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const deleteSlide = async (id: string) => {
    await supabase.from('site_content').delete().eq('id', id);
    fetchData();
  };

  const addPromo = async () => {
    const newPromo = {
      title: 'Yeni Sezon İndirimi',
      code: `FAEM${Math.floor(Math.random()*1000)}`,
      discount_percent: 10,
      is_active: true
    };
    await supabase.from('promotions').insert([newPromo]);
    fetchData();
  };

  const deletePromo = async (id: string) => {
    await supabase.from('promotions').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ── HERO MANAGEMENT ── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                <Layout size={20} />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight">Vitrin Yönetimi</h2>
                <p className="text-zinc-400 text-xs font-medium">Hero görselleri ve yönlendirme ayarları.</p>
             </div>
          </div>
          <Button onClick={addSlide} className="bg-black text-white rounded-2xl px-6 font-bold h-12 uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
            <Plus size={16} className="mr-2" /> Yeni Vitrin Ekle
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="bg-white border border-zinc-100 rounded-[2.5rem] p-4 sm:p-8 flex flex-col md:flex-row gap-8 group hover:border-black transition-all">
              {/* IMAGE SECTOR */}
              <div 
                className="w-full md:w-80 aspect-[4/5] sm:aspect-video rounded-[1.5rem] overflow-hidden bg-zinc-100 flex-shrink-0 relative group/img cursor-pointer"
                onClick={() => {
                   setActiveSlideId(slide.id);
                   fileInputRef.current?.click();
                }}
              >
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300">
                   {uploading === slide.id ? (
                     <Loader2 className="animate-spin text-white" size={32} />
                   ) : (
                     <>
                        <ImageIcon size={32} className="text-white mb-2" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Görseli Değiştir</span>
                     </>
                   )}
                </div>
              </div>

              {/* DETAILS SECTOR */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Vitrin Başlığı</Label>
                    <Input 
                      value={slide.title} 
                      onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                      className="h-11 sm:h-12 border-zinc-100 focus:border-black rounded-xl font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Alt Metin</Label>
                    <Input 
                      value={slide.subtitle} 
                      onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                      className="h-11 sm:h-12 border-zinc-100 focus:border-black rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Hedef Koleksiyon</Label>
                    <Select 
                      value={slide.button_link || ''} 
                      onValueChange={(val) => updateSlide(slide.id, { button_link: val })}
                    >
                      <SelectTrigger className="h-11 sm:h-12 border-zinc-100 focus:border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-zinc-50/30">
                        <SelectValue placeholder="KOLEKSİYON SEÇ" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        <SelectItem value="all" className="rounded-xl font-bold py-2">Tüm Ürünler</SelectItem>
                        {categories.map((cat, i) => (
                          <SelectItem key={i} value={cat.name || cat} className="rounded-xl font-bold py-2">
                            {cat.name || cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Buton Metni</Label>
                    <Input 
                      value={slide.button_text} 
                      onChange={(e) => updateSlide(slide.id, { button_text: e.target.value })}
                      className="h-11 sm:h-12 border-zinc-100 focus:border-black rounded-xl font-bold transition-all" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Sıralama</Label>
                        <Input 
                          type="number" 
                          value={slide.priority} 
                          className="w-16 h-10 border-zinc-100 rounded-xl font-black text-center"
                          onChange={(e) => updateSlide(slide.id, { priority: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Durum</Label>
                         <Badge 
                           onClick={() => updateSlide(slide.id, { is_active: !slide.is_active })}
                           className={`h-10 px-4 rounded-xl cursor-pointer transition-all border-none ${slide.is_active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}
                         >
                           <div className={`w-1.5 h-1.5 rounded-full mr-2 ${slide.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-zinc-400'}`} />
                           {slide.is_active ? 'YAYINDA' : 'TASLAK'}
                         </Badge>
                      </div>
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteSlide(slide.id)} 
                    className="w-11 h-11 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                      <Trash2 size={20} />
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hidden File Input */}
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={(e) => activeSlideId && handleImageUpload(e, activeSlideId)} 
      />

      {/* ── PROMOTIONS MANAGEMENT ── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                <Tag size={20} />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight">Kampanyalar</h2>
                <p className="text-zinc-400 text-xs font-medium">İndirim kodları ve aktif promosyonlar.</p>
             </div>
          </div>
          <Button onClick={addPromo} className="bg-black text-white rounded-2xl px-6 font-bold h-12 uppercase text-[10px] tracking-widest active:scale-95 transition-all">
            <Plus size={16} className="mr-2" /> Yeni Kod Üret
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {promotions.map((promo) => (
             <div key={promo.id} className="p-6 bg-white border border-zinc-100 rounded-[2.2rem] flex flex-col gap-5 group hover:border-black/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                   <div className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl font-black tracking-widest text-xs">{promo.code}</div>
                   <Button variant="ghost" size="icon" onClick={() => deletePromo(promo.id)} className="w-9 h-9 rounded-xl text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                      <Trash2 size={16} />
                   </Button>
                </div>
                <div>
                   <h4 className="font-black text-zinc-900 text-xl">%{promo.discount_percent} İndirim</h4>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{promo.title}</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-5 border-t border-zinc-50">
                   <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Statü: Aktif</span>
                   <div className={`w-2 h-2 rounded-full ${promo.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-200'}`} />
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
