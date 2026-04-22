import React from 'react';
import { Book, LifeBuoy, FileText, MessageCircle, ExternalLink } from 'lucide-react';

export function HelpTab() {
  const docs = [
    {
      title: "Ürün Yönetimi ve Varyantlar",
      description: "Yeni ürün ekleme, stok takibi ve varyant (renk, beden) ayarlamaları nasıl yapılır?",
      icon: Book,
      time: "5 dk okuma"
    },
    {
      title: "Sipariş ve Kargo Süreçleri",
      description: "Gelen siparişlerin durum güncellemeleri, kargo takibi ve iade süreçleri yönetimi.",
      icon: FileText,
      time: "8 dk okuma"
    },
    {
      title: "Vitrin ve CMS Ayarları",
      description: "Anasayfa slider görsellerini değiştirme ve güncel kampanyaları yayına alma.",
      icon: Book,
      time: "4 dk okuma"
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Yardım Merkezi</h2>
           <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider mt-1">Dokümantasyon ve Destek Talepleri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolon 1: Dokümanlar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4">
            {docs.map((doc, i) => (
              <div key={i} className="apple-card p-5 group hover:border-zinc-300 transition-all cursor-pointer flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-colors shrink-0">
                    <doc.icon size={18} />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 leading-tight mb-1">{doc.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{doc.description}</p>
                 </div>
                 <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{doc.time}</span>
                    <ExternalLink size={14} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolon 2: Canlı Destek */}
        <div className="space-y-6">
          <div className="apple-card p-6 bg-zinc-900 text-white rounded-[2rem] border-none shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <LifeBuoy size={80} />
             </div>
             
             <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                   <MessageCircle size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-xl tracking-tight mb-2">Canlı Destek</h3>
                   <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">
                      Admin paneli kullanımıyla ilgili teknik bir sorun yaşıyorsanız destek ekibimize ulaşın.
                   </p>
                   <button className="w-full h-11 bg-white text-zinc-900 rounded-xl font-semibold text-[11px] uppercase tracking-wider hover:bg-zinc-100 transition-all active:scale-95 shadow-lg">
                      Destek Talebi Oluştur
                   </button>
                </div>
             </div>
          </div>
          
          <div className="apple-card p-6">
             <h3 className="font-semibold text-zinc-900 text-sm mb-4">Sistem Durumu</h3>
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <span className="text-xs text-zinc-500 font-medium">Veritabanı Bağlantısı</span>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Aktif</span>
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-zinc-500 font-medium">Ödeme Altyapısı</span>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Aktif</span>
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-zinc-500 font-medium">Sürüm</span>
                   <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">v2.4.0</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
