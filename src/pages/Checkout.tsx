import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentForm } from '@/components/Payment/PaymentForm';
import { Payment3DSModal } from '@/components/Payment/Payment3DSModal';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [show3DS, setShow3DS] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  
  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const numericAmount = cartTotal.replace(/[^0-9,.]/g, '').replace(',', '.');
  
  const orderDetails = {
    amount: numericAmount,
    displayAmount: cartTotal,
    itemsCount: cartCount
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSuccess = (html: string) => {
    setHtmlContent(html);
    setShow3DS(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-32 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col items-center gap-12 mb-16">
          {/* Top Level: Step Indicators (Full Width / Centered) */}
          <div className="flex items-center gap-10 md:gap-24 relative">
            {/* Progress Line Background */}
            <div className="absolute left-0 right-0 top-[20px] h-[1px] bg-zinc-200" />
            
            {/* Step 1: Shipping */}
            <div 
              className={`relative z-10 flex flex-col items-center gap-3 transition-all duration-500 ${step === 'shipping' ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep('shipping')}
              style={{ cursor: 'pointer' }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step === 'shipping' || step === 'payment' ? 'bg-black border-black text-white shadow-lg shadow-black/10' : 'bg-white border-zinc-200 text-zinc-400'}`}>
                {step === 'payment' ? <CheckCircle2 size={18} /> : <Truck size={18} />}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${step === 'shipping' ? 'text-black' : 'text-zinc-400'}`}>
                01. Teslimat
              </span>
            </div>

            {/* Step 2: Payment */}
            <div className={`relative z-10 flex flex-col items-center gap-3 transition-all duration-500 ${step === 'payment' ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step === 'payment' ? 'bg-black border-black text-white shadow-lg shadow-black/10' : 'bg-white border-zinc-200 text-zinc-400'}`}>
                <CreditCard size={18} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${step === 'payment' ? 'text-black' : 'text-zinc-400'}`}>
                02. Ödeme
              </span>
            </div>

            {/* Step 3: Confirmation */}
            <div className="relative z-10 flex flex-col items-center gap-3 transition-all duration-500 opacity-20">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white border-zinc-200 text-zinc-400">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap text-zinc-400">
                03. Onay
              </span>
            </div>

            {/* Dynamic Progress Line Overlay */}
            <motion.div 
              className="absolute left-0 top-[20px] h-[2px] bg-black origin-left"
              initial={false}
              animate={{ 
                width: step === 'payment' ? '50%' : '0%',
                opacity: 1
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Second Level: Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => step === 'payment' ? setStep('shipping') : navigate(-1)}
            className="flex items-center gap-3 text-zinc-400 hover:text-black font-semibold uppercase text-[10px] tracking-[0.3em] transition-all group border-b border-transparent hover:border-black/10 pb-1 px-0 rounded-none h-auto"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {step === 'payment' ? 'Teslimat Bilgilerine Dön' : 'Alışverişe Dön'}
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Sol Kolon: Formlar */}
          <AnimatePresence mode="wait">
            {step === 'shipping' ? (
              <motion.div 
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-xl border border-zinc-100 shadow-xl shadow-zinc-200/50"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <Truck className="text-black" size={20} />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">Teslimat Bilgileri</h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Ad</Label>
                      <Input 
                        placeholder="Adınız" 
                        required 
                        value={addressData.firstName}
                        onChange={e => setAddressData({...addressData, firstName: e.target.value})}
                        className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Soyad</Label>
                      <Input 
                        placeholder="Soyadınız" 
                        required 
                        value={addressData.lastName}
                        onChange={e => setAddressData({...addressData, lastName: e.target.value})}
                        className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">E-Posta</Label>
                      <Input 
                        type="email" 
                        placeholder="adiniz@example.com" 
                        required 
                        value={addressData.email}
                        onChange={e => setAddressData({...addressData, email: e.target.value})}
                        className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Telefon</Label>
                      <Input 
                        type="tel" 
                        placeholder="05XX XXX XX XX" 
                        required 
                        value={addressData.phone}
                        onChange={e => setAddressData({...addressData, phone: e.target.value})}
                        className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Açık Adres</Label>
                    <Input 
                      placeholder="Mahalle, Sokak, No, Daire..." 
                      required 
                      value={addressData.address}
                      onChange={e => setAddressData({...addressData, address: e.target.value})}
                      className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Şehir</Label>
                      <Input 
                        placeholder="İstanbul" 
                        required 
                        value={addressData.city}
                        onChange={e => setAddressData({...addressData, city: e.target.value})}
                        className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Posta Kodu</Label>
                      <Input 
                        placeholder="34000" 
                        required 
                        value={addressData.postalCode}
                        onChange={e => setAddressData({...addressData, postalCode: e.target.value})}
                        className="h-12 rounded-lg border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-14 rounded-xl bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all mt-4">
                    Ödeme Bilgilerine Geç
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PaymentForm 
                  amount={orderDetails.displayAmount} 
                  numericAmount={orderDetails.amount}
                  orderId={`ORD-${crypto.randomUUID()}`} // Temporary, will be updated by PaymentForm during insert
                  cartItems={cartItems}
                  shippingAddress={addressData}
                  onSuccess={handlePaymentSuccess}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sağ Kolon: Özet */}
          <div className="lg:pl-12 sticky top-28">
            <div className="p-10 rounded-2xl bg-black text-white shadow-2xl shadow-black/20 overflow-hidden relative">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Sipariş Özeti</h3>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{cartCount} Ürün</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-white/40 font-semibold uppercase">{item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-white/50">Kargo</span>
                  <span className="font-bold text-emerald-400">ÜCRETSİZ</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-white/50 text-xs uppercase tracking-widest">Toplam</span>
                  <div className="text-right">
                    <span className="block text-4xl font-bold tracking-tighter leading-none mb-1">{orderDetails.displayAmount}</span>
                  </div>
                </div>
              </div>

              {step === 'payment' && (
                <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Teslimat Adresi Onaylandı</p>
                    <p className="text-[11px] text-white/70 font-medium">
                      {addressData.firstName} {addressData.lastName}, {addressData.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Payment3DSModal 
        isOpen={show3DS}
        onClose={() => setShow3DS(false)}
        htmlContent={htmlContent}
      />
    </div>
  );
};

export default CheckoutPage;
