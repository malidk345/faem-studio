import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, ShieldCheck } from 'lucide-react';

// ── Inline SVG Payment Icons (iyzico TR requirements) ──
const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
    <rect width="48" height="32" rx="4" fill="#1A1F71"/>
    <path d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.2-10.2c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.5 1.4-4.5 3.4 0 1.5 1.4 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.2c.6.3 1.8.5 3 .5 2.8 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.3-2.1zm6.8-.3h-2.1c-.6 0-1.1.2-1.4.9l-4 9.6h2.8l.6-1.6h3.5l.3 1.6h2.5l-2.2-10.5zm-3.3 6.8l1.1-3.1.3-.8.2.8.6 3.1h-2.2zM16.3 10.5L13.6 18l-.3-1.4c-.5-1.7-2-3.5-3.8-4.4l2.4 8.8h2.9l4.3-10.5h-2.8z" fill="white"/>
    <path d="M11.5 10.5H7.1l0 .2c3.4.9 5.7 3 6.6 5.5l-1-4.8c-.2-.7-.7-.9-1.2-.9z" fill="#F9A533"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
    <rect width="48" height="32" rx="4" fill="#252525"/>
    <circle cx="19" cy="16" r="8" fill="#EB001B"/>
    <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
    <path d="M24 9.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#FF5F00"/>
  </svg>
);

const TroyIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
    <rect width="48" height="32" rx="4" fill="#00348B"/>
    <text x="24" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="sans-serif">TROY</text>
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
    <rect width="48" height="32" rx="4" fill="#016FD0"/>
    <text x="24" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="sans-serif">AMEX</text>
  </svg>
);

const IyzicoIcon = () => (
  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
    <rect width="48" height="32" rx="4" fill="#1E64FF"/>
    <text x="24" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="sans-serif">iyzico</text>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-neutral-200 pt-10 pb-8 px-4 md:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-bold tracking-tighter lowercase leading-none mb-3 block text-neutral-800">
              faem
            </Link>
            <p className="text-neutral-400 text-[12px] leading-relaxed max-w-[220px]">
              Arşivlik parçalar, tasarım objeleri ve stüdyo seçkileri.
            </p>
          </div>

          {/* Keşfet */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 mb-1">Keşfet</h4>
            <Link to="/shop" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">Tüm Ürünler</Link>
            <Link to="/wishlist" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">Favorilerim</Link>
          </div>

          {/* Hukuki (iyzico zorunlu) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 mb-1">Hukuki</h4>
            <Link to="/legal/about" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">Hakkımızda</Link>
            <Link to="/legal/distance-sales" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">Mesafeli Satış Sözleşmesi</Link>
            <Link to="/legal/returns" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">İade ve İptal</Link>
            <Link to="/legal/privacy" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">Gizlilik Politikası</Link>
          </div>

          {/* İletişim */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 mb-1">İletişim</h4>
            <Link to="/contact" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors">İletişim/Destek</Link>
            <a href="mailto:faembutik@gmail.com" className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors flex items-center gap-1.5">
              <Mail size={12} /> faembutik@gmail.com
            </a>
            <div className="flex gap-3 mt-1">
              <a href="https://instagram.com/faemstudio" target="_blank" rel="noopener noreferrer">
                <Instagram size={15} className="text-neutral-300 hover:text-neutral-800 cursor-pointer transition-colors" />
              </a>
              <a href="https://twitter.com/faemstudio" target="_blank" rel="noopener noreferrer">
                <Twitter size={15} className="text-neutral-300 hover:text-neutral-800 cursor-pointer transition-colors" />
              </a>
            </div>
          </div>

        </div>

        {/* Payment + iyzico strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100">
          
          {/* Payment methods */}
          <div className="flex items-center gap-2">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <TroyIcon />
            <div className="w-px h-5 bg-neutral-200 mx-1" />
            <IyzicoIcon />
            <ShieldCheck size={14} className="text-emerald-500 ml-1" />
          </div>

          {/* Copyright */}
          <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-[0.2em]">
            © {currentYear} Faem Studio. Tüm hakları saklıdır.
          </p>

        </div>
      </div>
    </footer>
  );
}
