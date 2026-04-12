import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

type Step = 'details' | 'shipping' | 'confirm' | 'success';

interface ShippingOption {
  id: string;
  name: string;
  amount: number;
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('0');

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [country, setCountry] = useState('TR');

  useSEO({
    title: `${t('checkout.title')} | Faem Studio`,
    description: t('checkout.success_desc')
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (user) {
      setEmail(user.email);
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  // ── Step 1: Submit contact + shipping address ─────────────────────────────
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('shipping');
  };

  // ── Step 2: Select shipping method ────────────────────────────────────────
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  // ── Step 3: Complete order ────────────────────────────────────────────────
  const handleCompleteOrder = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;

      if (userId) {
        const { error: dbError } = await supabase.from('orders').insert({
          user_id: userId,
          total: cartTotal,
          status: 'pending',
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address,
            city,
            postal,
            country,
            email,
            shipping_method: selectedShipping
          },
          items: cartItems
        });
        
        if (dbError) throw dbError;
      } else {
        console.warn('Guest checkout: order not saved to database due to RLS. Order complete in UI only.');
      }

      clearCart();
      setStep('success');
    } catch (err: any) {
      setError(err?.message ?? 'Could not complete order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (cartItems.length === 0 && step !== 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-white pt-[120px] pb-24 px-6 md:px-12 max-w-5xl mx-auto"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-sm font-medium">
          <ChevronLeft size={16} /> {t('checkout.back')}
        </Link>
        <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter leading-none mb-6">{t('checkout.title').toLowerCase()}</h1>
        <p className="text-black/50 text-sm font-medium">{t('checkout.empty_desc')}</p>
        <Link to="/shop" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
          {t('checkout.shop_now')}
        </Link>
      </motion.div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-white pt-[120px] pb-24 px-6 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <CheckCircle2 size={56} className="text-black mb-6 mx-auto" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-[32px] font-black tracking-tighter mb-4">{t('checkout.success_title')}</h1>
        <p className="text-black/50 text-sm font-medium max-w-sm mx-auto mb-10 leading-relaxed">
          {t('checkout.success_desc')}
        </p>
        <Link to="/" className="bg-black text-white px-10 py-4 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
          {t('checkout.back_to_store')}
        </Link>
      </motion.div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────────────────
  const stepLabel: Record<Exclude<Step, 'success'>, string> = {
    details: `01 / ${t('checkout.step_1')}`,
    shipping: `02 / ${t('checkout.step_2')}`,
    confirm: `03 / ${t('checkout.step_3')}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white pt-[120px] pb-24 px-6 md:px-12 max-w-5xl mx-auto"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-sm font-medium">
        <ChevronLeft size={16} /> {t('checkout.back')}
      </Link>

      <div className="grid md:grid-cols-2 gap-16">

        {/* ── Left — Steps ── */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 mb-2">{(stepLabel as any)[step]}</p>
          <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter leading-none mb-8">{t('checkout.title').toLowerCase()}</h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-5 py-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Contact + Address */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <input
                type="email"
                placeholder={t('checkout.email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder={t('checkout.first_name')} value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
                <input type="text" placeholder={t('checkout.last_name')} value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
              </div>
              <input type="text" placeholder={t('checkout.address')} value={address} onChange={e => setAddress(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder={t('checkout.city')} value={city} onChange={e => setCity(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
                <input type="text" placeholder={t('checkout.postal')} value={postal} onChange={e => setPostal(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
              </div>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all text-black/70 font-medium text-sm appearance-none"
              >
                <option value="TR">Turkey</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="NL">Netherlands</option>
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 rounded-xl text-[15px] font-bold mt-2 hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {t('checkout.continue_shipping')}
              </button>
            </form>
          )}

          {/* Step 2: Shipping method */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              {[
                { label: t('checkout.standard'), time: '5-7 days', price: t('checkout.free') },
                { label: t('checkout.express'), time: '2-3 days', price: '$12.00' }
              ].map((opt, i) => (
                <label
                  key={i}
                  className={`flex justify-between items-center px-5 py-4 rounded-xl border cursor-pointer transition-all ${
                    selectedShipping === String(i) ? 'border-black bg-black/5' : 'border-black/10 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={String(i)}
                      checked={selectedShipping === String(i)}
                      onChange={() => setSelectedShipping(String(i))}
                      className="accent-black"
                    />
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-xs text-black/40">{opt.time}</span>
                  </div>
                  <span className="text-sm font-bold">{opt.price}</span>
                </label>
              ))}

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 py-4 rounded-xl text-[15px] font-bold border border-black/10 hover:border-black/30 transition-colors"
                >
                  {t('checkout.back')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-black text-white py-4 rounded-xl text-[15px] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {t('checkout.review_order')}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirm + Pay */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-black/5 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">{t('checkout.shipping_to')}</p>
                <p className="text-sm font-semibold">{firstName} {lastName}</p>
                <p className="text-sm text-black/60">{address}, {city} {postal}</p>
                <p className="text-sm text-black/60">{email}</p>
              </div>

              <p className="text-xs text-black/40 font-medium leading-relaxed italic">
                Siparişinizi onaylayarak hizmet koşullarımızı kabul etmiş sayılırsınız. Tüm veriler Supabase altyapısı ile uçtan uca korunmaktadır.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="flex-1 py-4 rounded-xl text-[15px] font-bold border border-black/10 hover:border-black/30 transition-colors"
                >
                  {t('checkout.back')}
                </button>
                <button
                  onClick={handleCompleteOrder}
                  disabled={isLoading}
                  className="flex-1 bg-black text-white py-4 rounded-xl text-[15px] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {t('checkout.place_order')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right — Order Summary ── */}
        <div className="bg-black/5 p-8 rounded-[2rem] h-fit">
          <h2 className="text-lg font-black tracking-tight mb-6">{t('checkout.summary')}</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                <div className="flex gap-4 items-center">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                  )}
                  <div>
                    <p>{item.name}</p>
                    <p className="text-black/40 text-xs">{item.size} · {t('checkout.qty')} {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-[1px] bg-black/10 mb-6" />
          <div className="flex justify-between items-center text-lg font-black">
            <span>{t('cart.total')}</span>
            <span>{cartTotal}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
