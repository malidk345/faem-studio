import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Percent, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Promotion {
  id: string;
  code: string;
  percent: number;
  min_amount: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  usage_count: number;
}

export function PromotionsTab() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    percent: '10',
    min_amount: '0',
    expires_at: '',
  });

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setPromotions(data);
    } catch (err) {
      console.warn('Promotions table might be missing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = async () => {
    if (!formData.code.trim()) {
      toast.error('İndirim kodu boş olamaz.');
      return;
    }
    const payload = {
      code: formData.code.toUpperCase().trim(),
      percent: parseInt(formData.percent) || 10,
      min_amount: parseFloat(formData.min_amount) || 0,
      active: true,
      expires_at: formData.expires_at || null,
      usage_count: 0,
    };

    const { error } = await supabase.from('promotions').insert([payload]);
    if (error) {
      toast.error('İndirim kodu oluşturulamadı: ' + error.message);
    } else {
      toast.success(`"${payload.code}" indirim kodu oluşturuldu.`);
      setFormData({ code: '', percent: '10', min_amount: '0', expires_at: '' });
      setShowForm(false);
      fetchPromotions();
    }
  };

  const toggleActive = async (promo: Promotion) => {
    const { error } = await supabase
      .from('promotions')
      .update({ active: !promo.active })
      .eq('id', promo.id);
    if (!error) {
      toast.success(promo.active ? 'İndirim kodu devre dışı bırakıldı.' : 'İndirim kodu aktifleştirildi.');
      fetchPromotions();
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Bu indirim kodunu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (!error) {
      toast.success('İndirim kodu silindi.');
      fetchPromotions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">İndirim Kodları</h2>
          <p className="text-zinc-500 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest mt-1">Kampanya Yönetimi</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white hover:bg-zinc-800 rounded-xl sm:rounded-2xl px-4 sm:px-5 h-10 sm:h-11 font-bold flex items-center justify-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2.5} />
          Yeni Kod
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="apple-card p-4 sm:p-6 space-y-4 sm:space-y-5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight">Yeni İndirim Tanımla</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ml-1">Kod</Label>
                  <Input 
                    placeholder="FAEM20"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="h-10 sm:h-11 rounded-lg sm:rounded-xl font-black uppercase text-[11px] sm:text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ml-1">İndirim (%)</Label>
                  <Input 
                    type="number"
                    placeholder="10"
                    value={formData.percent}
                    onChange={(e) => setFormData({...formData, percent: e.target.value})}
                    className="h-10 sm:h-11 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ml-1">Min. Tutar (₺)</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                    className="h-10 sm:h-11 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ml-1">Son Gün</Label>
                  <Input 
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="h-10 sm:h-11 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreate} className="flex-1 sm:flex-none bg-black text-white rounded-lg sm:rounded-xl px-6 h-10 sm:h-11 font-black text-[10px] uppercase tracking-wider">
                  Oluştur
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none rounded-lg sm:rounded-xl h-10 sm:h-11 font-black text-[10px] uppercase tracking-wider">
                  İptal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="apple-card p-3 sm:p-4 flex flex-col gap-1">
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-zinc-400">Toplam</span>
          <span className="text-xl sm:text-2xl font-black tracking-tight">{promotions.length}</span>
        </div>
        <div className="apple-card p-3 sm:p-4 flex flex-col gap-1">
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-zinc-400">Aktif</span>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600">{promotions.filter(p => p.active).length}</span>
        </div>
        <div className="apple-card p-3 sm:p-4 flex flex-col gap-1">
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-zinc-400">Pasif</span>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-300">{promotions.filter(p => !p.active).length}</span>
        </div>
        <div className="apple-card p-3 sm:p-4 flex flex-col gap-1">
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-zinc-400">Kullanım</span>
          <span className="text-xl sm:text-2xl font-black tracking-tight">{promotions.reduce((s, p) => s + (p.usage_count || 0), 0)}</span>
        </div>
      </div>

      {/* Promotions List */}
      <div className="space-y-2 sm:space-y-3">
        <AnimatePresence>
          {promotions.map(promo => {
            const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`apple-card p-4 sm:p-5 flex flex-row items-center justify-between gap-4 ${!promo.active || isExpired ? 'opacity-50' : ''} active:scale-[0.99] transition-all`}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${promo.active && !isExpired ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Tag size={18} sm:size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-lg font-black tracking-tight uppercase">{promo.code}</span>
                      <Badge variant="secondary" className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${
                        isExpired ? 'bg-rose-50 text-rose-500' :
                        promo.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {isExpired ? 'Doldu' : promo.active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1 text-[9px] sm:text-[11px] text-zinc-400 font-black uppercase tracking-tight">
                      <span className="flex items-center gap-0.5 text-zinc-600 font-black">%{promo.percent}</span>
                      {promo.min_amount > 0 && <span className="hidden xs:inline">Min ₺{promo.min_amount}</span>}
                      {promo.expires_at && (
                        <span className="hidden sm:flex items-center gap-1">
                          <Calendar size={10} /> {new Date(promo.expires_at).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                      <span>{promo.usage_count || 0} kullanım</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                      promo.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-400'
                    }`}
                  >
                    {promo.active ? <ToggleRight size={18} sm:size={20} /> : <ToggleLeft size={18} sm:size={20} />}
                  </button>
                  <button
                    onClick={() => deletePromo(promo.id)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-50 text-zinc-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} sm:size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {promotions.length === 0 && !loading && (
          <div className="h-40 sm:h-48 flex flex-col items-center justify-center border border-dashed border-zinc-200 bg-zinc-50/50 rounded-[1.5rem] sm:rounded-[2rem]">
            <Tag className="text-zinc-200 mb-3 sm:mb-4" size={32} sm:size={40} />
            <p className="text-zinc-400 font-black text-[9px] sm:text-[11px] uppercase tracking-wider">Henüz kayıt bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
