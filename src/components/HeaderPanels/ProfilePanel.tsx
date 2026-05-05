import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, ArrowRight, LogOut } from 'lucide-react';
import { containerVariants, itemVariants } from '../../utils/animations';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ProfilePanelProps {
  onClose?: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignInClick = () => {
    if (onClose) onClose();
    navigate('/signin');
  };

  return (
    <motion.div variants={containerVariants} className="p-4 sm:p-8 flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center text-center pb-8 border-b border-white/5">
              <div className="w-20 h-20 bg-white/5 rounded-[2px] flex items-center justify-center mb-6 border border-white/10 relative group">
                <UserIcon size={28} className="text-white/20 group-hover:text-white/40 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
              </div>
              <h3 className="text-white font-bold text-xl tracking-tighter mb-2">{t('auth.studio_access')}</h3>
              <p className="text-white/30 text-[13px] font-medium leading-relaxed max-w-[240px] font-['Handjet',sans-serif] uppercase tracking-wider">{t('auth.studio_access_desc')}</p>
            </div>
            
            <button 
              onClick={handleSignInClick} 
              className="w-full bg-white text-black py-4 rounded-[1px] text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#ddff34] transition-all font-['Handjet',sans-serif] active:scale-95"
            >
              {t('auth.title')}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-6 pb-8 border-b border-white/5">
              <div className="w-16 h-16 bg-white text-black rounded-[2px] flex items-center justify-center border border-white/20 shadow-2xl relative overflow-hidden shrink-0">
                <span className="text-[24px] font-bold tracking-tighter relative z-10">{user.name.charAt(0)}</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
              </div>
              <div className="flex flex-col overflow-hidden text-left gap-0.5">
                <h3 className="text-white font-bold text-lg tracking-tight truncate w-full">{user.name}</h3>
                <p className="text-white/30 text-[12px] font-medium truncate w-full">{user.email}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
               {[
                 { label: t('account.my_orders'), path: '/account', count: null },
                 { label: t('account.wishlist'), path: '/wishlist', count: null },
                 { label: t('account.studio_profile'), path: '/account', count: null },
                 ...(user.role === 'admin' || ['dursunkayamustafa@gmail.com', 'fatihduymus21@gmail.com'].includes(user.email) ? [{ label: t('account.admin_portal'), path: '/fatihveemirinadminportali', count: 'SYS' }] : [])
               ].map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => { onClose?.(); navigate(item.path); }}
                  className={`flex items-center justify-between py-3.5 px-4 rounded-[1px] transition-all group ${
                    item.label === t('account.admin_portal') 
                      ? 'bg-[#ddff34] text-black hover:bg-white my-2' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold uppercase tracking-tight">{item.label}</span>
                    {item.count && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-black/10 rounded-[1px] font-['Handjet',sans-serif] tracking-widest">{item.count}</span>
                    )}
                  </div>
                  <ArrowRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${item.label === t('account.admin_portal') ? 'text-black' : 'text-white'}`} />
                </button>
              ))}
            </div>

            <button 
              onClick={logout} 
              className="mt-2 w-full flex items-center justify-center gap-3 bg-white/5 text-white/30 py-4 rounded-[1px] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-rose-500/10 hover:text-rose-500 transition-all font-['Handjet',sans-serif] border border-white/5"
            >
              <LogOut size={14} /> {t('account.signout_short')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default ProfilePanel;
