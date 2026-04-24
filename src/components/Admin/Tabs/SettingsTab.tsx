import React, { useState } from 'react';
import { Store, Globe, CreditCard, Mail, Truck, Save, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Sistem Ayarları</h2>
           <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider mt-1">Mağaza, Kargo ve Operasyon Konfigürasyonu</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-zinc-900 text-white rounded-xl px-6 font-semibold h-11 uppercase text-[10px] tracking-wider active:scale-95 transition-all">
          {loading ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
          Değişiklikleri Kaydet
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
                <p className="text-xs text-zinc-500 font-medium mt-1">iyzico API anahtarları.</p>
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
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">iyzico API Key</Label>
                  <Input 
                    type="password"
                    value={settings.stripe_public_key}
                    onChange={(e) => setSettings({...settings, stripe_public_key: e.target.value})}
                    placeholder="sandbox-..."
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">iyzico Secret Key</Label>
                  <Input 
                    type="password"
                    value={settings.stripe_secret_key}
                    onChange={(e) => setSettings({...settings, stripe_secret_key: e.target.value})}
                    placeholder="sandbox-..."
                    className="h-11 border-zinc-200 focus:border-zinc-400 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
