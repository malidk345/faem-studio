import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, FileText, RefreshCcw, Info } from 'lucide-react';

const LEGAL_CONTENT: Record<string, { title: string, icon: any, content: React.ReactNode }> = {
  'distance-sales': {
    title: 'Mesafeli Satış Sözleşmesi',
    icon: <FileText size={24} />,
    content: (
      <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
        <p><strong>1. TARAFLAR</strong></p>
        <p>İşbu Sözleşme, Faem Studio (Satıcı) ile ürünü satın alan kullanıcı (Alıcı) arasında, elektronik ortamda onaylandığı tarih itibariyle yürürlüğe girmiştir.</p>
        <p><strong>2. KONU</strong></p>
        <p>İşbu Sözleşme'nin konusu, Alıcı'nın Satıcı'ya ait internet sitesinden elektronik ortamda siparişini verdiği ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
        <p><strong>3. TESLİMAT VE ÖDEME</strong></p>
        <p>Ürünler, Alıcı'nın sipariş formunda belirttiği adrese, ilgili kargo firması aracılığıyla teslim edilecektir. Kargo ücreti, aksi belirtilmedikçe Alıcı'ya aittir.</p>
      </div>
    )
  },
  'returns': {
    title: 'İptal ve İade Koşulları',
    icon: <RefreshCcw size={24} />,
    content: (
      <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
        <p><strong>CAYMA HAKKI</strong></p>
        <p>Alıcı, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içerisinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir.</p>
        <p><strong>İADE SÜRECİ</strong></p>
        <p>İade edilecek ürünlerin ambalajının açılmamış, bozulmamış ve ürünün kullanılmamış olması şarttır. İade talebi, iletişim kanallarımız üzerinden Satıcı'ya ulaştırılmalıdır.</p>
      </div>
    )
  },
  'privacy': {
    title: 'Gizlilik ve Güvenlik',
    icon: <ShieldCheck size={24} />,
    content: (
      <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
        <p>Faem Studio, kullanıcıların kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) uygun olarak işlemektedir.</p>
        <p>Ödeme aşamasında kullanılan kart bilgileri, iyzico 256-bit SSL korumalı altyapısı ile korunmakta olup, sistemimiz tarafından asla kaydedilmemektedir.</p>
      </div>
    )
  },
  'about': {
    title: 'Hakkımızda',
    icon: <Info size={24} />,
    content: (
      <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
        <p>Faem Studio, küratörlüğünü Fatih ve Emir'in üstlendiği bir tasarım kolektifidir. Minimalizm ve brutalizm arasındaki dengeyi arayan, arşivlik parçalar sunan bir stüdyo olarak 2026 yılında kurulmuştur.</p>
      </div>
    )
  }
};

export default function Legal() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').pop() || '';
  const data = LEGAL_CONTENT[slug] || LEGAL_CONTENT['about'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-[10px] font-black uppercase tracking-widest leading-none">
        <ChevronLeft size={14} /> Geri Dön
      </Link>

      <div className="flex items-center gap-4 mb-10">
         <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-100">
            {data.icon}
         </div>
         <h1 className="text-[32px] md:text-[44px] font-black tracking-tighter leading-none text-black">
           {data.title}
         </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="prose prose-zinc prose-sm max-w-none bg-zinc-50/50 p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 font-medium"
      >
        {data.content}
      </motion.div>
    </div>
  );
}
