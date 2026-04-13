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
    <motion.div variants={containerVariants} className="p-6 flex flex-col gap-5">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center text-center pb-4 border-b border-black/5">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-3">
                <UserIcon size={24} className="text-black/30" />
              </div>
              <h3 className="text-black font-bold text-[18px]">{t('auth.studio_access')}</h3>
              <p className="text-black/40 text-[13px] font-medium leading-relaxed max-w-[200px] mt-1">{t('auth.studio_access_desc')}</p>
            </div>
            
            <button onClick={handleSignInClick} className="w-full bg-black text-white py-3.5 rounded-xl text-[14px] font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10">
              {t('auth.title')}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center text-center pb-4 border-b border-black/5">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-black/20">
                <span className="text-[20px] font-bold tracking-tighter">{user.name.charAt(0)}</span>
              </div>
              <h3 className="text-black font-bold text-[18px] tracking-tight">{user.name}</h3>
              <p className="text-black/40 text-[12px] font-medium mt-1">{user.email}</p>
            </div>
            
            <div className="flex flex-col gap-1">
               {[
                 { label: t('account.my_orders'), path: '/account' },
                 { label: t('account.wishlist'), path: '/wishlist' },
                 { label: t('account.studio_profile'), path: '/account' },
                 // Force check: if role is admin OR if the email is in our master admin list
                 ...(user.role === 'admin' || ['dursunkayamustafa@gmail.com', 'fatihduymus21@gmail.com'].includes(user.email) ? [{ label: t('account.admin_portal'), path: '/fatihveemirinadminportali' }] : [])
               ].map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => { onClose?.(); navigate(item.path); }}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all group ${item.label === t('account.admin_portal') ? 'bg-black text-white hover:bg-zinc-800 my-2' : 'text-black/70 hover:text-black hover:bg-black/5'}`}
                >
                  <span className="text-[14px] font-semibold">{item.label}</span>
                  <ArrowRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${item.label === t('account.admin_portal') ? 'text-white' : 'text-black/30'}`} />
                </button>
              ))}
            </div>

            <button onClick={logout} className="mt-2 w-full flex items-center justify-center gap-2 bg-black/5 text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-black/10 transition-colors">
              <LogOut size={14} /> {t('account.signout_short')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePanel;
