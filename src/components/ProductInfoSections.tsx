import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProductInfoSections: React.FC = () => {
  const { t } = useLanguage();

  const INFO_ITEMS = [
    { icon: <Truck size={14} />, label: t('info.shipping_title'), desc: t('info.shipping_desc') },
    { icon: <RefreshCw size={14} />, label: t('info.returns_title'), desc: t('info.returns_desc') },
    { icon: <ShieldCheck size={14} />, label: t('info.quality_title'), desc: t('info.quality_desc') },
  ];

  return (
    <div className="flex items-center justify-center gap-6 py-6 border-t border-zinc-100">
      {INFO_ITEMS.map((item, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2 text-zinc-400">
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{item.label}</span>
          </div>
          {i < INFO_ITEMS.length - 1 && <div className="w-px h-4 bg-zinc-200" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProductInfoSections;
