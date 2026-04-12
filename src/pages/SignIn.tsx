import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, Loader2, Mail } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useSEO({
    title: `${t('auth.title')} | Faem Studio`,
    description: t('auth.desc')
  });

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error: mlError } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (mlError) {
        throw mlError;
      }
      
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || t('auth.error_sending'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        
        <Link to="/" className="inline-flex items-center gap-2 text-black/30 hover:text-black transition-colors mb-12 text-[10px] uppercase font-bold tracking-widest">
          <ChevronLeft size={14} /> {t('auth.back_to_store')}
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter leading-none mb-3">
              {t('auth.title')}
            </h1>
            <p className="text-black/40 text-sm font-medium leading-relaxed uppercase tracking-tighter">
              {t('auth.instant_entry')}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {!magicLinkSent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-black/5 focus:border-black outline-none transition-all placeholder:text-black/20 text-lg font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl shadow-black/10 disabled:opacity-40 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {loading ? t('auth.sending') : t('auth.send_link')}
              </button>
            </form>
          ) : (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="bg-black text-white p-8 rounded-3xl"
            >
              <h2 className="text-xl font-bold mb-2">{t('auth.check_mail')}</h2>
              <p className="text-sm opacity-50 mb-6 leading-relaxed">
                <span className="text-white opacity-100 font-bold">{email}</span> {t('auth.link_sent_desc')}
              </p>
              <button 
                onClick={() => setMagicLinkSent(false)}
                className="text-[10px] uppercase font-black tracking-widest bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                {t('auth.change_email')}
              </button>
            </motion.div>
          )}

          <div className="mt-12 text-center">
            <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest leading-loose">
              {t('nav.about')} <br/>
              <span className="text-black/40">{t('auth.privacy_terms')}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
