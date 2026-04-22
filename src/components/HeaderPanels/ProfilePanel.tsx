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
    <motion.div variants={containerVariants} className="p-6 flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <UserIcon size={24} className="text-white/30" />
              </div>
              <h3 className="text-white font-bold text-[18px] tracking-tight">{t('auth.studio_access')}</h3>
              <p className="text-white/40 text-[13px] font-medium leading-relaxed max-w-[200px] mt-1">{t('auth.studio_access_desc')}</p>
            </div>
            
            <button onClick={handleSignInClick} className="w-full bg-white text-black py-4 rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl">
              {t('auth.title')}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
              <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-4 border-2 border-white/20 shadow-xl">
                <span className="text-[20px] font-bold tracking-tighter">{user.name.charAt(0)}</span>
              </div>
              <h3 className="text-white font-bold text-[18px] tracking-tight">{user.name}</h3>
              <p className="text-white/30 text-[12px] font-medium mt-1">{user.email}</p>
            </div>
            
            <div className="flex flex-col gap-1">
               {[
                 { label: t('account.my_orders'), path: '/account' },
                 { label: t('account.wishlist'), path: '/wishlist' },
                 { label: t('account.studio_profile'), path: '/account' },
                 ...(user.role === 'admin' || ['dursunkayamustafa@gmail.com', 'fatihduymus21@gmail.com'].includes(user.email) ? [{ label: t('account.admin_portal'), path: '/fatihveemirinadminportali' }] : [])
               ].map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => { onClose?.(); navigate(item.path); }}
                  className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all group ${item.label === t('account.admin_portal') ? 'bg-white text-black hover:bg-white/90 my-2' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="text-[14px] font-bold tracking-tight">{item.label}</span>
                  <ArrowRight size={14} className={`opacity-20 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${item.label === t('account.admin_portal') ? 'text-black' : 'text-white'}`} />
                </button>
              ))}
            </div>

            <button onClick={logout} className="mt-2 w-full flex items-center justify-center gap-2 bg-white/5 text-white/50 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
              <LogOut size={14} /> {t('account.signout_short')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePanel;
