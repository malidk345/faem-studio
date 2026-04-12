import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProductInfoSections: React.FC = () => {
  const { t } = useLanguage();

  const INFO_ITEMS = [
    {
      icon: <Truck size={22} />,
      title: t('info.shipping_title'),
      desc: t('info.shipping_desc'),
      dark: true,
    },
    {
      icon: <RefreshCw size={22} />,
      title: t('info.returns_title'),
      desc: t('info.returns_desc'),
      dark: false,
    },
    {
      icon: <ShieldCheck size={22} />,
      title: t('info.quality_title'),
      desc: t('info.quality_desc'),
      dark: false,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {INFO_ITEMS.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-5 p-7 rounded-2xl"
          style={
            item.dark
              ? { backgroundColor: '#1A1A1A', color: '#F0EDE8', border: 'none' }
              : { backgroundColor: '#FFFFFF', color: '#0C0C0C', border: '1px solid rgba(0,0,0,0.06)' }
          }
        >
          <div style={{ color: item.dark ? 'rgba(240,237,232,0.35)' : 'rgba(0,0,0,0.25)' }}>
            {item.icon}
          </div>
          <h4 className="text-[15px] font-bold tracking-tight">{item.title}</h4>
          <p className="text-[13px] leading-relaxed font-light"
            style={{ color: item.dark ? 'rgba(240,237,232,0.4)' : 'rgba(0,0,0,0.45)' }}>
            {item.desc}
          </p>
        </div>
      ))}
    </section>
  );
};

export default ProductInfoSections;
