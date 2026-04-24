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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">İndirim Kodları</h2>
          <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider mt-1">Promosyon ve Kampanya Yönetimi</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white hover:bg-zinc-800 rounded-2xl px-5 h-11 font-semibold flex items-center gap-2 text-[11px] uppercase tracking-wider shadow-lg shadow-black/10 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Yeni Kod Oluştur
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
            <div className="apple-card p-6 space-y-5">
              <h3 className="text-sm font-bold tracking-tight">Yeni İndirim Kodu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Kod</Label>
                  <Input 
                    placeholder="FAEM20"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="h-11 rounded-xl font-bold uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">İndirim Oranı (%)</Label>
                  <Input 
                    type="number"
                    placeholder="10"
                    value={formData.percent}
                    onChange={(e) => setFormData({...formData, percent: e.target.value})}
                    className="h-11 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Min. Tutar (₺)</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                    className="h-11 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Son Kullanma</Label>
                  <Input 
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="h-11 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreate} className="bg-black text-white rounded-xl px-6 h-11 font-bold text-[10px] uppercase tracking-wider">
                  Oluştur
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl h-11 font-bold text-[10px] uppercase tracking-wider">
                  İptal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="apple-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Toplam</span>
          <span className="text-2xl font-semibold tracking-tight">{promotions.length}</span>
        </div>
        <div className="apple-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Aktif</span>
          <span className="text-2xl font-semibold tracking-tight text-emerald-600">{promotions.filter(p => p.active).length}</span>
        </div>
        <div className="apple-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Pasif</span>
          <span className="text-2xl font-semibold tracking-tight text-zinc-400">{promotions.filter(p => !p.active).length}</span>
        </div>
        <div className="apple-card p-4 flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Kullanım</span>
          <span className="text-2xl font-semibold tracking-tight">{promotions.reduce((s, p) => s + (p.usage_count || 0), 0)}</span>
        </div>
      </div>

      {/* Promotions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {promotions.map(promo => {
            const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`apple-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!promo.active || isExpired ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promo.active && !isExpired ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black tracking-tight">{promo.code}</span>
                      <Badge variant="secondary" className={`text-[9px] font-bold uppercase tracking-wider ${
                        isExpired ? 'bg-rose-50 text-rose-500' :
                        promo.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {isExpired ? 'Süresi Doldu' : promo.active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-[11px] text-zinc-500 font-medium">
                      <span className="flex items-center gap-1"><Percent size={12} /> %{promo.percent} İndirim</span>
                      {promo.min_amount > 0 && <span>Min. ₺{promo.min_amount}</span>}
                      {promo.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(promo.expires_at).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                      <span>{promo.usage_count || 0} kullanım</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      promo.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                    }`}
                    title={promo.active ? 'Devre dışı bırak' : 'Aktifleştir'}
                  >
                    {promo.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button
                    onClick={() => deletePromo(promo.id)}
                    className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {promotions.length === 0 && !loading && (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-zinc-200 bg-zinc-50/50 rounded-[2rem]">
            <Tag className="text-zinc-300 mb-4" size={40} />
            <p className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider">Henüz indirim kodu bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
