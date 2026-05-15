import React, { useState } from 'react';
import { Store, CreditCard, Mail, Truck, Save, RefreshCw, Shield, Bell } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { subscribeToPushNotifications } from '../../../utils/notifications';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsTab({ settings: dbSettings, onUpdateSettings }: any) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    store_name: dbSettings?.store_name || 'FAEM Studio',
    contact_email: dbSettings?.contact_email || 'admin@faem.studio',
    currency: dbSettings?.currency || 'TRY',
    tax_rate: dbSettings?.tax_rate || '18',
    shipping_fee: dbSettings?.shipping_fee || '25.00',
    free_shipping_threshold: dbSettings?.free_shipping_threshold || '500.00',
    stripe_public_key: dbSettings?.stripe_public_key || '',
    stripe_secret_key: dbSettings?.stripe_secret_key || ''
  });

  const handleSave = async () => {
    if (!dbSettings) return;
    setLoading(true);
    await onUpdateSettings(settings);
    setLoading(false);
  };

  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Yönetici şifreniz başarıyla güncellendi!');
      setNewPassword('');
    } catch (err: any) {
      toast.error('Şifre güncellenemedi: ' + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 sm:pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-900">Sistem Ayarları</h2>
           <p className="text-zinc-500 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest mt-1">Mağaza ve Operasyon Konfigürasyonu</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto bg-black text-white rounded-xl px-6 font-black h-11 uppercase text-[10px] tracking-wider active:scale-95 transition-all shadow-lg">
          {loading ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
          Kaydet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolon 1: Mağaza ve İletişim */}
        <div className="space-y-6">
          <div className="apple-card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 flex-shrink-0">
              <Store size={18} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 leading-none">Genel Mağaza</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Sitenizin temel bilgileri.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Mağaza Adı</Label>
                  <Input 
                    value={settings.store_name}
                    onChange={(e) => setSettings({...settings, store_name: e.target.value})}
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">İletişim E-Postası</Label>
                  <Input 
                    value={settings.contact_email}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolon 2: Kargo ve Vergi */}
        <div className="space-y-6">
          <div className="apple-card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Truck size={18} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 leading-none">Operasyon</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Kargo ve vergi (KDV) hesaplamaları.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Standart Kargo Ücreti (₺)</Label>
                  <Input 
                    value={settings.shipping_fee}
                    onChange={(e) => setSettings({...settings, shipping_fee: e.target.value})}
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Ücretsiz Kargo Limiti (₺)</Label>
                  <Input 
                    value={settings.free_shipping_threshold}
                    onChange={(e) => setSettings({...settings, free_shipping_threshold: e.target.value})}
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Standart KDV Oranı (%)</Label>
                  <Input 
                    value={settings.tax_rate}
                    onChange={(e) => setSettings({...settings, tax_rate: e.target.value})}
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolon 3: Ödeme Sistemleri */}
        <div className="space-y-6">
          <div className="apple-card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CreditCard size={18} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 leading-none">Ödeme Altyapısı</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Tami API anahtarları.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Varsayılan Para Birimi</Label>
                  <Input 
                    value={settings.currency}
                    disabled
                    className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium text-zinc-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Tami Merchant Number</Label>
                  <Input 
                    type="text"
                    value={settings.stripe_public_key}
                    onChange={(e) => setSettings({...settings, stripe_public_key: e.target.value})}
                    placeholder="7700..."
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Tami Secret Key (JWK K)</Label>
                  <Input 
                    type="password"
                    value={settings.stripe_secret_key}
                    onChange={(e) => setSettings({...settings, stripe_secret_key: e.target.value})}
                    placeholder="Şifreniz..."
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolon 4: Güvenlik (Yönetici Şifresi) */}
        <div className="space-y-6">
          <div className="apple-card p-6 flex items-start gap-4 h-full">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
              <Shield size={18} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 leading-none">Güvenlik Ayarları</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Yönetici paneli giriş şifresi.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Yeni Şifre Belirle</Label>
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="h-11 border-zinc-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl font-medium"
                  />
                </div>
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={passwordLoading || !newPassword}
                  className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 transition-all"
                >
                  {passwordLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Şifreyi Güncelle'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolon 5: Bildirimler */}
        <div className="space-y-6">
          <div className="apple-card p-6 flex items-start gap-4 h-full">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Bell size={18} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 leading-none">Anlık Bildirimler</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Yeni sipariş ve mesaj uyarıları.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    iOS (16.4+) ve Android cihazlarda anlık bildirim almak için uygulamayı <strong>ana ekrana eklemeniz</strong> gerekmektedir.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Button 
                    onClick={async () => {
                      try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) throw new Error('Oturum bulunamadı.');
                        await subscribeToPushNotifications(user.id);
                        toast.success('Bildirimler bu cihaz için aktif edildi!');
                      } catch (err: any) {
                        toast.error('Bildirim hatası: ' + err.message);
                      }
                    }}
                    className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-200"
                  >
                    1. Bu Cihazda Bildirimleri Aç
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('notify-admins', {
                          body: {
                            title: 'Test Bildirimi 🔔',
                            body: 'Faem Studio bildirim sistemi başarıyla çalışıyor!',
                            url: '/fatihveemirinadminportali'
                          }
                        });

                        if (error) throw error;
                        toast.success('Test bildirimi gönderildi!');
                      } catch (err: any) {
                        toast.error('Test hatası: ' + err.message);
                        console.error('Edge Function Error:', err);
                      }
                    }}
                    className="w-full h-11 border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    2. Test Bildirimi Gönder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
