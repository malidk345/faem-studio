import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import {
  setCheckoutDetails,
  getShippingOptions,
  addShippingMethod,
  completeCart,
  type ShippingAddress,
} from '../lib/medusa-api';

const IS_BACKEND_CONFIGURED = Boolean(import.meta.env.VITE_MEDUSA_BACKEND_URL);

type Step = 'details' | 'shipping' | 'confirm' | 'success';

interface ShippingOption {
  id: string;
  name: string;
  amount: number;
}

export default function Checkout() {
  const { cartItems, cartTotal, medusaCartId, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [country, setCountry] = useState('TR');

  useSEO({
    title: 'Checkout | Faem Studio',
    description: 'Complete your purchase securely. Enter shipping address and details to finalize your Faem Studio order.'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // ── Step 1: Submit contact + shipping address ─────────────────────────────

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!IS_BACKEND_CONFIGURED || !medusaCartId) {
      // Offline: just move to next step
      if (IS_BACKEND_CONFIGURED && !medusaCartId) {
        setError('Cart not initialised. Please add items and try again.');
        return;
      }
      setStep('shipping');
      return;
    }

    setIsLoading(true);
    try {
      const shippingAddress: ShippingAddress = {
        first_name: firstName,
        last_name: lastName,
        address_1: address,
        city,
        country_code: country.toLowerCase(),
        postal_code: postal,
      };
      await setCheckoutDetails(medusaCartId, email, shippingAddress);

      // Fetch shipping options for the next step
      const options = await getShippingOptions(medusaCartId);
      setShippingOptions(
        options.map((o: any) => ({
          id: o.id,
          name: o.name,
          amount: o.amount ?? 0,
        }))
      );
      if (options.length > 0) setSelectedShipping(options[0].id);

      setStep('shipping');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save shipping details.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Select shipping method ────────────────────────────────────────

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!IS_BACKEND_CONFIGURED || !medusaCartId) {
      setStep('confirm');
      return;
    }

    setIsLoading(true);
    try {
      await addShippingMethod(medusaCartId, selectedShipping);
      setStep('confirm');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to add shipping method.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Complete order ────────────────────────────────────────────────

  const handleCompleteOrder = async () => {
    setError(null);

    if (!IS_BACKEND_CONFIGURED || !medusaCartId) {
      // Offline simulation
      setStep('success');
      clearCart();
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeCart(medusaCartId);
      if (result.type === 'order') {
        clearCart();
        setStep('success');
      } else {
        setError('Payment not completed. Please check your payment details.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not complete order. Please try again.');
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
          <ChevronLeft size={16} /> back to storefront
        </Link>
        <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter leading-none mb-6">checkout</h1>
        <p className="text-black/50 text-sm font-medium">Your cart is empty. Return to store to add products.</p>
        <Link to="/shop" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
          Shop Now
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
        <h1 className="text-[32px] font-black tracking-tighter mb-4">Order Placed!</h1>
        <p className="text-black/50 text-sm font-medium max-w-sm mx-auto mb-10 leading-relaxed">
          Thank you for your order. You'll receive a confirmation email shortly.
        </p>
        <Link to="/" className="bg-black text-white px-10 py-4 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
          Back to Store
        </Link>
      </motion.div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────────────────

  const stepLabel: Record<Step, string> = {
    details: '01 / Contact & Shipping',
    shipping: '02 / Delivery Method',
    confirm: '03 / Review & Pay',
    success: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white pt-[120px] pb-24 px-6 md:px-12 max-w-5xl mx-auto"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-sm font-medium">
        <ChevronLeft size={16} /> back to storefront
      </Link>

      <div className="grid md:grid-cols-2 gap-16">

        {/* ── Left — Steps ── */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 mb-2">{stepLabel[step]}</p>
          <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter leading-none mb-8">checkout</h1>

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
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
                <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
              </div>
              <input type="text" placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
                <input type="text" placeholder="Postal code" value={postal} onChange={e => setPostal(e.target.value)} required className="w-full px-5 py-3.5 bg-black/5 rounded-xl border border-transparent focus:border-black/20 focus:bg-transparent outline-none transition-all placeholder:text-black/30 font-medium text-sm" />
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
                Continue to Delivery
              </button>
            </form>
          )}

          {/* Step 2: Shipping method */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              {shippingOptions.length > 0 ? (
                shippingOptions.map(opt => (
                  <label
                    key={opt.id}
                    className={`flex justify-between items-center px-5 py-4 rounded-xl border cursor-pointer transition-all ${
                      selectedShipping === opt.id
                        ? 'border-black bg-black/5'
                        : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => setSelectedShipping(opt.id)}
                        className="accent-black"
                      />
                      <span className="text-sm font-semibold">{opt.name}</span>
                    </div>
                    <span className="text-sm font-bold">
                      {opt.amount === 0 ? 'Free' : `$${(opt.amount / 100).toFixed(2)}`}
                    </span>
                  </label>
                ))
              ) : (
                /* Offline fallback shipping */
                ['Standard Shipping — 5-7 days', 'Express Shipping — 2-3 days'].map((label, i) => (
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
                      <span className="text-sm font-semibold">{label.split('—')[0].trim()}</span>
                      <span className="text-xs text-black/40">{label.split('—')[1]?.trim()}</span>
                    </div>
                    <span className="text-sm font-bold">{i === 0 ? 'Free' : '$12.00'}</span>
                  </label>
                ))
              )}

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 py-4 rounded-xl text-[15px] font-bold border border-black/10 hover:border-black/30 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-black text-white py-4 rounded-xl text-[15px] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  Review Order
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirm + Pay */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-black/5 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">Shipping to</p>
                <p className="text-sm font-semibold">{firstName} {lastName}</p>
                <p className="text-sm text-black/60">{address}, {city} {postal}</p>
                <p className="text-sm text-black/60">{email}</p>
              </div>

              <p className="text-xs text-black/40 font-medium leading-relaxed">
                {IS_BACKEND_CONFIGURED
                  ? 'By clicking "Place Order", your payment will be processed via Medusa\'s payment provider.'
                  : 'Payment integration is not yet configured. Clicking "Place Order" will simulate a successful order.'
                }
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="flex-1 py-4 rounded-xl text-[15px] font-bold border border-black/10 hover:border-black/30 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteOrder}
                  disabled={isLoading}
                  className="flex-1 bg-black text-white py-4 rounded-xl text-[15px] font-bold hover:bg-zinc-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right — Order Summary ── */}
        <div className="bg-black/5 p-8 rounded-[2rem] h-fit">
          <h2 className="text-lg font-black tracking-tight mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                <div className="flex gap-4 items-center">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                  )}
                  <div>
                    <p>{item.name}</p>
                    <p className="text-black/40 text-xs">{item.size} · qty {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-[1px] bg-black/10 mb-6" />
          <div className="flex justify-between items-center text-lg font-black">
            <span>Total</span>
            <span>{cartTotal}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
