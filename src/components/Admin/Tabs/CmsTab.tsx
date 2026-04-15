import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Layout, Megaphone, Tag, Save, X, ArrowUpDown } from 'lucide-react';

export function CmsTab() {
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addSlide = async () => {
    const newSlide = {
      title: 'New Narrative',
      subtitle: 'Summer 26 Collection',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      priority: heroSlides.length + 1
    };
    await supabase.from('site_content').insert([newSlide]);
    fetchData();
  };

  const updateSlide = async (id: string, updates: any) => {
    await supabase.from('site_content').update(updates).eq('id', id);
    fetchData();
  };

  const deleteSlide = async (id: string) => {
    await supabase.from('site_content').delete().eq('id', id);
    fetchData();
  };

  const addPromo = async () => {
    const newPromo = {
      title: 'New Discount',
      code: `SAVE${Math.floor(Math.random()*100)}`,
      discount_percent: 15,
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
    <div className="space-y-16">
      {/* ── HERO MANAGEMENT ── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                <Layout size={20} />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight">Vitrini Düzenle</h2>
                <p className="text-zinc-400 text-xs font-medium">Ana sayfa Hero görselleri ve sloganları.</p>
             </div>
          </div>
          <Button onClick={addSlide} className="bg-black text-white rounded-2xl px-6 font-bold h-12 uppercase text-[10px] tracking-widest shadow-xl shadow-black/10">
            <Plus size={16} className="mr-2" /> Yeni Slide Ekle
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {heroSlides.map((slide, idx) => (
            <div key={slide.id} className="bg-white border rounded-[2rem] p-6 flex flex-col md:flex-row gap-8 group hover:border-black transition-all">
              <div className="w-full md:w-64 aspect-[4/5] md:aspect-video rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="secondary" size="sm" className="rounded-xl font-bold text-[10px] uppercase">Görseli Değiştir</Button>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Başlık</Label>
                    <Input 
                      value={slide.title} 
                      onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                      className="rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Alt Başlık</Label>
                    <Input 
                      value={slide.subtitle} 
                      onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Öncelik</Label>
                        <Input 
                          type="number" 
                          value={slide.priority} 
                          className="w-20 rounded-xl font-black h-10"
                          onChange={(e) => updateSlide(slide.id, { priority: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center gap-2 self-end pb-1 ml-4">
                         <span className="text-[10px] font-bold text-zinc-400">Durum:</span>
                         <Badge 
                           onClick={() => updateSlide(slide.id, { is_active: !slide.is_active })}
                           className={`rounded-lg cursor-pointer transition-all ${slide.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}
                         >
                           {slide.is_active ? 'YAYINDA' : 'PASİF'}
                         </Badge>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => deleteSlide(slide.id)} className="w-12 h-12 rounded-2xl hover:bg-rose-50 hover:text-rose-500 self-end">
                      <Trash2 size={18} />
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROMOTIONS MANAGEMENT ── */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                <Tag size={20} />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight">Kampanyalar</h2>
                <p className="text-zinc-400 text-xs font-medium">İndirim kodları ve promosyon yönetimi.</p>
             </div>
          </div>
          <Button onClick={addPromo} className="bg-black text-white rounded-2xl px-6 font-bold h-12 uppercase text-[10px] tracking-widest">
            <Plus size={16} className="mr-2" /> Yeni Kod Üret
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {promotions.map((promo) => (
             <div key={promo.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex flex-col gap-4 group hover:bg-white hover:border-black/10 transition-all">
                <div className="flex items-center justify-between">
                   <Badge className="bg-black text-white rounded-lg font-black tracking-widest px-3">{promo.code}</Badge>
                   <Button variant="ghost" size="icon" onClick={() => deletePromo(promo.id)} className="w-8 h-8 rounded-lg text-zinc-300 hover:text-rose-500">
                      <Trash2 size={14} />
                   </Button>
                </div>
                <div>
                   <h4 className="font-black text-zinc-900 text-lg">%{promo.discount_percent} İndirim</h4>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{promo.title}</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-black/5">
                   <span className="text-[10px] font-bold text-zinc-300">OTOMATİK AKTİF</span>
                   <div className={`w-2 h-2 rounded-full ${promo.is_active ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-zinc-200'}`} />
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
