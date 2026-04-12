import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProductInfoSections: React.FC = () => {
  const { t } = useLanguage();

  const INFO_ITEMS = [
    {
      icon: <Truck size={16} />,
      title: t('info.shipping_title'),
      desc: t('info.shipping_desc'),
    },
    {
      icon: <RefreshCw size={16} />,
      title: t('info.returns_title'),
      desc: t('info.returns_desc'),
    },
    {
      icon: <ShieldCheck size={16} />,
      title: t('info.quality_title'),
      desc: t('info.quality_desc'),
    },
  ];

  return (
    <section className="flex flex-col gap-0 border-t border-black/[0.06]">
      {INFO_ITEMS.map((item, i) => (
        <div
          key={i}
          className="group flex flex-col md:flex-row md:items-center justify-between py-6 gap-4 border-b border-black/[0.06] transition-colors hover:bg-black/[0.01] px-2"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/30 group-hover:bg-black group-hover:text-white transition-all duration-300">
              {item.icon}
            </div>
            <h4 className="text-[14px] font-black uppercase tracking-tight text-black">
              {item.title}
            </h4>
          </div>
          
          <p className="text-[13px] md:text-right font-medium leading-relaxed max-w-md text-black/40 group-hover:text-black/60 transition-colors">
            {item.desc}
          </p>
        </div>
      ))}
    </section>
  );
};

export default ProductInfoSections;
