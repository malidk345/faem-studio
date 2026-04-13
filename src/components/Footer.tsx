import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-12 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand section */}
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-black tracking-tighter lowercase leading-none mb-6 block">
              faem
            </Link>
            <p className="text-zinc-400 text-[13px] font-medium leading-relaxed max-w-[240px]">
              Arşivlik parçalar, tasarım objeleri ve stüdyo seçkileri. Bir Fatih & Emir kolektifidir.
            </p>
          </div>

          {/* Shop links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Keşfet</h4>
            <Link to="/shop" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors">Tüm Ürünler</Link>
            <Link to="/wishlist" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors">Favorilerim</Link>
          </div>

          {/* Legal links (Crucial for iyzico) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Hukuki & Bilgi</h4>
            <Link to="/legal/about" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors">Hakkımızda</Link>
            <Link to="/legal/distance-sales" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors">Mesafeli Satış Sözleşmesi</Link>
            <Link to="/legal/returns" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors">İade ve İptal Koşulları</Link>
            <Link to="/legal/privacy" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors">Gizlilik Politikası</Link>
          </div>

          {/* Support section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">İletişim</h4>
            <div className="flex flex-col gap-2">
               <a href="mailto:info@faemstudio.com" className="text-sm font-bold text-zinc-400 hover:text-black transition-colors flex items-center gap-2">
                 <Mail size={14} /> info@faemstudio.com
               </a>
               <div className="flex gap-4 mt-4">
                 <Instagram size={18} className="text-zinc-300 hover:text-black cursor-pointer transition-colors" />
                 <Twitter size={18} className="text-zinc-300 hover:text-black cursor-pointer transition-colors" />
               </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            © {currentYear} FAEM STUDIO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
             <ShieldCheck size={16} className="text-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-widest">iyzico Safe Payment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
