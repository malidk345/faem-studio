import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { ChevronLeft, Loader2 } from 'lucide-react';

type Mode = 'signin' | 'register';

export default function SignIn() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { user, login, register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: 'Sign In | Faem Studio',
    description: 'Access your Faem Studio account to view orders, track shipments, and manage preferences.'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Clear API errors when user edits fields
  useEffect(() => {
    if (error) clearError();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password, firstName, lastName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'signin') {
        // Explicitly hit Supabase OTP for sign-in
        const { error: mlError } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (mlError) {
          setError(mlError.message);
          return;
        }
        setMagicLinkSent(true);
      } else {
        await register(email, password, firstName, lastName);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const toggleMode = () => {
    clearError();
    setMagicLinkSent(false);
    setMode(m => m === 'signin' ? 'register' : 'signin');
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-sm font-medium">
          <ChevronLeft size={16} /> back to store
        </Link>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter leading-none mb-4 text-center">
            {mode === 'signin' ? 'welcome back' : 'create account'}
          </h1>
          <p className="text-black/50 text-sm font-medium text-center mb-10 leading-relaxed px-4">
            {mode === 'signin'
              ? 'Enter your email to receive a magic link for instant, secure access.'
              : 'Join Faem Studio to enjoy a seamless checkout experience and order tracking.'}
          </p>

          {/* Error message */}
          {(error || (mode === 'register' && error)) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-5 py-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-4">

              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full px-5 py-4 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 text-[15px] font-medium"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full px-5 py-4 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 text-[15px] font-medium"
                      required
                    />
                  </div>
                   <input
                    type="password"
                    placeholder="Create Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 text-[15px] font-medium"
                    required
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 text-[15px] font-medium"
                required
              />
            </div>

            {magicLinkSent && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-6 bg-black text-white rounded-2xl">
                  <p className="text-sm font-bold mb-1">Check your inbox!</p>
                  <p className="text-[11px] opacity-60">We sent a secure link to {email}.</p>
               </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || magicLinkSent}
              className="w-full bg-black text-white py-4 mt-2 rounded-xl text-[15px] font-bold hover:bg-zinc-800 transition-colors shadow-2xl shadow-black/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {(isLoading) && <Loader2 size={16} className="animate-spin" />}
              {magicLinkSent ? 'Waiting for link...' : mode === 'signin' ? 'Send Magic Link' : 'Create Account'}
            </button>
            {magicLinkSent && <p className="text-center text-[11px] text-black/40 font-bold uppercase tracking-widest mt-2">Email dispatched. Please verify.</p>}
          </form>

          <div className="mt-10 pt-8 border-t border-black/5 text-center text-sm font-medium text-black/40">
            {mode === 'signin'
              ? <>New to Faem Studio? <button onClick={toggleMode} className="text-black hover:underline ml-1">Create an account</button></>
              : <>Already have an account? <button onClick={toggleMode} className="text-black hover:underline ml-1">Sign in</button></>
            }
          </div>
        </motion.div>
      </div>
    </div>
  );
}
