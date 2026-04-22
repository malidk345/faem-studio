import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { containerVariants, itemVariants } from '../../utils/animations';
import { useLanguage } from '../../context/LanguageContext';

interface MenuPanelProps {
  onClose?: () => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({ onClose }) => {
  const { t } = useLanguage();
  return (
    <motion.div variants={containerVariants} className="menu-content h-full p-2 pt-4 pb-6">
      <div className="relative flex-1">
        <nav className="flex flex-col gap-6">
          
          {/* Categories Section */}
          <div className="flex flex-col gap-1">
            <motion.h3 variants={itemVariants} className="text-[13px] font-normal uppercase tracking-[0.2em] text-white/20 font-['Handjet',sans-serif] px-4 mb-2">
              {t('nav.categories')} // SEC.01
            </motion.h3>
            <motion.ul variants={itemVariants} className="flex flex-col gap-0.5">
              <li>
                <Link to="/shop" onClick={onClose} className="group flex items-center gap-3 px-4 py-2.5 rounded-[4px] hover:bg-white/5 transition-all">
                  <svg className="w-4 h-4 text-white/30 group-hover:text-[#ddff34] transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918" />
                  </svg>
                  <span className="text-[14px] font-medium text-white/80 group-hover:text-white transition-colors">{t('nav.collection')}</span>
                </Link>
              </li>
              <li>
                <Link to="/wishlist" onClick={onClose} className="group flex items-center gap-3 px-4 py-2.5 rounded-[4px] hover:bg-white/5 transition-all">
                  <svg className="w-4 h-4 text-white/30 group-hover:text-[#ddff34] transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  <span className="text-[14px] font-medium text-white/80 group-hover:text-white transition-colors">Seçkilerim</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={onClose} className="group flex items-center gap-3 px-4 py-2.5 rounded-[4px] hover:bg-white/5 transition-all">
                  <svg className="w-4 h-4 text-white/30 group-hover:text-[#ddff34] transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.303.025-.607.047-.912.066a33.313 33.313 0 0 1-13.416 0A30.932 30.932 0 0 1 4.5 17.087c-1.133-.094-1.98-1.057-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097a30.22 30.22 0 0 1 16.25 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                  <span className="text-[14px] font-medium text-white/80 group-hover:text-white transition-colors">İletişim/Destek</span>
                </Link>
              </li>
            </motion.ul>
          </div>

          {/* Corporate Section */}
          <div className="flex flex-col gap-1">
            <motion.h3 variants={itemVariants} className="text-[13px] font-normal uppercase tracking-[0.2em] text-white/20 font-['Handjet',sans-serif] px-4 mb-2">
              Kurumsal // DIR.02
            </motion.h3>
            <motion.ul variants={itemVariants} className="flex flex-col gap-0.5">
              {['Hakkımızda', 'Gizlilik Politikası', 'İptal & İade'].map((item) => (
                <li key={item}>
                  <Link to={`/legal/${item.toLowerCase().replace(/ /g, '-')}`} onClick={onClose} className="group flex items-center px-4 py-2 rounded-[4px] hover:bg-white/5 transition-all text-[13px] font-medium text-white/50 hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Socials Section */}
          <div className="flex flex-col gap-1">
            <motion.h3 variants={itemVariants} className="text-[13px] font-normal uppercase tracking-[0.2em] text-white/20 font-['Handjet',sans-serif] px-4 mb-2">
              {t('nav.socials')} // EXT.03
            </motion.h3>
            <motion.ul variants={itemVariants} className="flex gap-2 px-4 mt-1">
              {['X', 'INSTAGRAM'].map((social) => (
                <li key={social}>
                  <a href="#" className="text-[11px] font-normal uppercase tracking-[0.2em] px-3 py-1.5 border border-white/5 rounded-[4px] hover:bg-[#ddff34] hover:text-black transition-all font-['Handjet',sans-serif] text-white/40">
                    {social}
                  </a>
                </li>
              ))}
            </motion.ul>
          </div>

        </nav>
      </div>
    </motion.div>
  );
};

export default MenuPanel;
