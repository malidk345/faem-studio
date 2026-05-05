import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, Loader2, Mail } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const isAdminMode = redirectUrl === '/fatihveemirinadminportali';

  useSEO({
    title: `${t('auth.title')} | Faem Studio`,
    description: t('auth.desc')
  });

  useEffect(() => {
    if (user) navigate(redirectUrl);
  }, [user, navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isAdminMode && password.trim().length > 0) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      } else {
        const { error: mlError } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectUrl}`,
          }
        });
        
        if (mlError) throw mlError;
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      setError(err.message || t('auth.error_sending'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4] pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Technical Background Elements */}
      <div className="absolute top-10 left-10 hidden md:flex flex-col gap-1 opacity-20 pointer-events-none">
        <span className="text-[12px] font-normal text-black font-['Handjet',sans-serif] uppercase tracking-[0.4em]">Auth System // Access</span>
        <span className="text-[12px] font-normal text-black/50 font-['Handjet',sans-serif] uppercase tracking-[0.2em]">Protocol: V.2.0.4</span>
      </div>
      <div className="absolute bottom-10 right-10 hidden md:flex flex-col items-end gap-1 opacity-20 pointer-events-none text-right">
        <span className="text-[12px] font-normal text-black font-['Handjet',sans-serif] uppercase tracking-[0.4em]">Status: Waiting</span>
        <span className="text-[12px] font-normal text-black/50 font-['Handjet',sans-serif] uppercase tracking-[0.2em]">Faem Studio Archive Control</span>
      </div>

      <div className="w-full max-w-sm relative z-10">
        
        <Link to="/" className="inline-flex items-center gap-3 text-black/40 hover:text-black transition-all mb-16 text-[12px] font-normal uppercase tracking-[0.2em] font-['Handjet',sans-serif] group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('auth.back_to_store')}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.4em]">
                {isAdminMode ? 'Elevated Access' : 'Secure Entrance'}
              </span>
              <div className="h-[1px] flex-grow bg-black/5" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-none mb-6 text-black">
              {isAdminMode ? 'Admin Portal' : t('auth.title')}
            </h1>
            <p className="text-black/40 text-[14px] font-medium leading-relaxed max-w-[300px]">
              {isAdminMode ? 'Admin credentials required for system access.' : t('auth.instant_entry')}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-6 bg-rose-50 text-rose-600 text-[13px] font-bold rounded-[1px] border-l-4 border-rose-500 shadow-sm"
            >
              {error}
            </motion.div>
          )}

          {!magicLinkSent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="flex flex-col gap-8">
                <div className="group">
                  <label className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-2 transition-colors group-focus-within:text-black">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@archive.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-5 bg-white border border-black/[0.05] focus:border-black rounded-[1px] outline-none transition-all placeholder:text-black/10 text-lg font-bold tracking-tight shadow-sm"
                    required
                  />
                </div>

                {isAdminMode && (
                  <div className="group">
                    <label className="text-[11px] font-normal text-black/30 font-['Handjet',sans-serif] uppercase tracking-[0.3em] block mb-2 transition-colors group-focus-within:text-black">
                      System Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-5 bg-white border border-black/[0.05] focus:border-black rounded-[1px] outline-none transition-all placeholder:text-black/10 text-lg font-bold tracking-tight shadow-sm"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-[1px] text-[13px] font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all shadow-2xl shadow-black/10 disabled:opacity-40 flex items-center justify-center gap-4 font-['Handjet',sans-serif] active:scale-[0.98]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                {loading ? 'Processing...' : (isAdminMode ? 'Enter System' : t('auth.send_link'))}
              </button>
            </form>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="bg-black text-white p-10 rounded-[1px] border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-normal text-white/40 font-['Handjet',sans-serif] uppercase tracking-[0.3em]">Transmission Sent</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">{t('auth.check_mail')}</h2>
                <p className="text-[14px] text-white/40 leading-relaxed mb-10">
                  A secure access link has been transmitted to <span className="text-white opacity-100 font-bold border-b border-white/20 pb-0.5">{email}</span>. Please verify your inbox.
                </p>
                <button 
                  onClick={() => setMagicLinkSent(false)}
                  className="text-[11px] font-bold uppercase tracking-[0.15em] border border-white/20 px-6 py-3 rounded-[1px] hover:bg-white hover:text-black transition-all font-['Handjet',sans-serif]"
                >
                  {t('auth.change_email')}
                </button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Mail size={120} strokeWidth={1} />
              </div>
            </motion.div>
          )}

          <div className="mt-16 pt-10 border-t border-black/5 text-center">
            <p className="text-[11px] text-black/20 font-normal uppercase tracking-[0.3em] leading-loose font-['Handjet',sans-serif]">
              Faem Studio Archive // Legal <br/>
              <span className="text-black/40 hover:text-black transition-colors cursor-pointer">{t('auth.privacy_terms')}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

