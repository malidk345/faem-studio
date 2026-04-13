import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Loader2, ShieldCheck, Truck, CreditCard, Info } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

type Step = 'details' | 'shipping' | 'confirm';

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
  const [phone, setPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState(''); // Required for iyzico (Individual)
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
      setEmail(user.email || '');
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  // Price calculations
  const prices = useMemo(() => {
    // Standardize total calculation by removing currency symbol and converting to float
    const rawTotal = parseFloat(cartTotal.replace(/[^\d.]/g, '')) || 0;
    const shipping = selectedShipping === '1' ? 45 : 0; // Express 45 TL
    const tax = rawTotal * 0.20; // 20% VAT included approach
    return {
      subtotal: rawTotal - tax,
      tax,
      shipping,
      total: rawTotal + shipping
    };
  }, [cartTotal, selectedShipping]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !identityNumber) {
      setError("Telefon ve T.C. Kimlik numarası iyzico ödeme sistemimiz için zorunludur.");
      return;
    }
    setError(null);
    setStep('shipping');
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleCompleteOrder = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const orderData = {
        user_id: userId || null,
        total: `₺${prices.total.toFixed(2)}`,
        status: 'pending',
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone,
          identity_number: identityNumber,
          address,
          city,
          postal,
          country,
          email,
          shipping_method: selectedShipping === '1' ? 'Express' : 'Standard'
        },
        items: cartItems,
        payment_provider: 'iyzico',
        payment_status: 'pending'
      };

      const { data: newOrder, error: dbError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (dbError) throw dbError;

      // Simulate a small delay for premium feel
      await new Promise(r => setTimeout(r, 1500));
      
      clearCart();
      navigate(`/order/success/${newOrder.id}`);
    } catch (err: any) {
      console.error(err);
      navigate('/order/error', { state: { message: err.message || "Sipariş oluşturulurken bir hata oluştu." } });
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-[120px] px-6 text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black tracking-tighter mb-4">Sepetiniz Boş</h1>
        <p className="text-zinc-400 mb-8 max-w-xs font-medium">Satın almak istediğiniz parçaları ekleyerek başlayabilirsiniz.</p>
        <Link to="/shop" className="bg-black text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest">
          Alışverişe Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[120px] pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-[10px] font-black uppercase tracking-widest leading-none">
        <ChevronLeft size={14} /> Geri Dön
      </Link>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-16 overflow-x-auto hide-scrollbar">
        {[
          { id: 'details', label: '01 Bilgiler', icon: Info },
          { id: 'shipping', label: '02 Teslimat', icon: Truck },
          { id: 'confirm', label: '03 Ödeme', icon: CreditCard }
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex items-center gap-3 whitespace-nowrap transition-all duration-500 ${step === s.id ? 'opacity-100' : 'opacity-30'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${step === s.id ? 'bg-black text-white border-black' : 'border-zinc-200 text-black'}`}>
                <s.icon size={14} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
            {i < 2 && <div className="hidden md:block w-8 h-[1px] bg-zinc-100" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr,380px] gap-16 items-start">
        {/* FORM SIDE */}
        <div className="space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[12px] font-bold">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.form 
                key="details"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleDetailsSubmit} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">İletişim & Kimlik</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <input type="text" placeholder="T.C. Kimlik Numarası (Zorunlu)" value={identityNumber} onChange={e => setIdentityNumber(e.target.value.replace(/\D/g, ''))} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" maxLength={11} />
                       <p className="text-[9px] text-zinc-400 uppercase tracking-widest ml-2 italic">iyzico altyapısı için gereklidir</p>
                    </div>
                    <input type="tel" placeholder="Telefon (05xx...)" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" />
                  </div>
                  <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Teslimat Adresi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" />
                    <input type="text" placeholder="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" />
                  </div>
                  <textarea placeholder="Adres (Sokak, Bina, No, Daire)" value={address} onChange={e => setAddress(e.target.value)} required className="w-full h-32 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm resize-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Şehir" value={city} onChange={e => setCity(e.target.value)} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" />
                    <input type="text" placeholder="Posta Kodu" value={postal} onChange={e => setPostal(e.target.value)} required className="w-full h-14 px-6 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all">
                  Kargo Seçimine Geç
                </button>
              </motion.form>
            )}

            {step === 'shipping' && (
              <motion.form 
                key="shipping"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleShippingSubmit} 
                className="space-y-8"
              >
                <div className="space-y-4">
                  {[
                    { id: '0', label: 'Standart Teslimat', price: 'Ücretsiz', time: '3-5 İş Günü' },
                    { id: '1', label: 'VIP Express', price: '₺45.00', time: '24-48 Saat' }
                  ].map(opt => (
                    <label 
                      key={opt.id}
                      className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedShipping === opt.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <input type="radio" checked={selectedShipping === opt.id} onChange={() => setSelectedShipping(opt.id)} className="w-4 h-4 accent-black" />
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight">{opt.label}</p>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">{opt.time}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black">{opt.price}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4">
                    <button type="button" onClick={() => setStep('details')} className="flex-1 h-16 bg-zinc-100 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">Geri</button>
                    <button type="submit" className="flex-[2] h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all">Siparişi İncele</button>
                </div>
              </motion.form>
            )}

            {step === 'confirm' && (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-3">Teslimat Adresi</h4>
                    <p className="text-sm font-bold text-black">{firstName} {lastName}</p>
                    <p className="text-sm font-medium text-zinc-500 mt-1">{address}, {city} {postal}</p>
                    <p className="text-sm font-medium text-zinc-500">{phone}</p>
                  </div>
                  <div className="pt-6 border-t border-zinc-200">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-3">Güvenlik Önsözü</h4>
                    <div className="flex items-start gap-4 text-emerald-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                       <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                       <p className="text-[11px] font-bold leading-relaxed tracking-tight">
                         Ödemeniz iyzico 256-bit SSL korumalı altyapısı ile gerçekleşecektir. Kart bilgileriniz asla sisteme kaydedilmez.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={() => setStep('shipping')} className="flex-1 h-16 bg-zinc-100 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">Geri</button>
                    <button onClick={handleCompleteOrder} disabled={isLoading} className="flex-[2] h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Ödemeyi Başlat <ChevronLeft size={16} className="rotate-180" /></>}
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SUMMARY SIDE */}
        <div className="bg-zinc-50/50 p-8 pt-10 rounded-[2.5rem] border border-zinc-100 h-fit sticky top-32">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 border-b border-zinc-100 pb-4">Sipariş Özeti</h2>
          
          <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-20 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <p className="text-[13px] font-black tracking-tight leading-tight">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{item.size} · {item.quantity} Adet</p>
                  </div>
                  <p className="text-[13px] font-black">{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-zinc-100 pt-6">
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <span>Ara Toplam</span>
                <span>₺{prices.subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <span>KDV (20%)</span>
                <span>₺{prices.tax.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <span>Kargo</span>
                <span className={prices.shipping === 0 ? 'text-emerald-500' : 'text-black'}>
                  {prices.shipping === 0 ? 'Ücretsiz' : `₺${prices.shipping.toFixed(2)}`}
                </span>
             </div>
             <div className="h-[1px] bg-zinc-200 my-4" />
             <div className="flex justify-between items-end">
                <span className="text-[12px] font-black uppercase tracking-[0.2em]">Toplam</span>
                <span className="text-2xl font-black tracking-tighter leading-none">₺{prices.total.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
