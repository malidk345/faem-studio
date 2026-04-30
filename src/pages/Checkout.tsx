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
    <div className="min-h-screen bg-zinc-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={() => step === 'payment' ? setStep('shipping') : navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-black font-bold uppercase text-[10px] tracking-widest transition-colors"
          >
            <ArrowLeft size={16} />
            {step === 'payment' ? 'Teslimat Bilgilerine Dön' : 'Alışverişe Dön'}
          </Button>
          
          <div className="flex items-center gap-8">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-black' : 'text-zinc-300'}`}>
              <Truck size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Teslimat</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-black' : 'text-zinc-300'}`}>
              <CreditCard size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Ödeme</span>
            </div>
          </div>
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
                className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <Truck className="text-black" size={20} />
                  </div>
                  <h2 className="text-lg font-black tracking-tight">Teslimat Bilgileri</h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Ad</Label>
                      <Input 
                        placeholder="Örn: Mustafa" 
                        required 
                        value={addressData.firstName}
                        onChange={e => setAddressData({...addressData, firstName: e.target.value})}
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Soyad</Label>
                      <Input 
                        placeholder="Örn: Dursun" 
                        required 
                        value={addressData.lastName}
                        onChange={e => setAddressData({...addressData, lastName: e.target.value})}
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">E-Posta</Label>
                    <Input 
                      type="email" 
                      placeholder="mustafa@example.com" 
                      required 
                      value={addressData.email}
                      onChange={e => setAddressData({...addressData, email: e.target.value})}
                      className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Açık Adres</Label>
                    <Input 
                      placeholder="Mahalle, Sokak, No, Daire..." 
                      required 
                      value={addressData.address}
                      onChange={e => setAddressData({...addressData, address: e.target.value})}
                      className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Şehir</Label>
                      <Input 
                        placeholder="İstanbul" 
                        required 
                        value={addressData.city}
                        onChange={e => setAddressData({...addressData, city: e.target.value})}
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Posta Kodu</Label>
                      <Input 
                        placeholder="34000" 
                        required 
                        value={addressData.postalCode}
                        onChange={e => setAddressData({...addressData, postalCode: e.target.value})}
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-14 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all mt-4">
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
                  orderId={`ORD-${Math.floor(Math.random() * 1000000)}`} // Temporary, will be updated by PaymentForm during insert
                  cartItems={cartItems}
                  shippingAddress={addressData}
                  onSuccess={handlePaymentSuccess}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sağ Kolon: Özet */}
          <div className="lg:pl-12 sticky top-12">
            <div className="p-10 rounded-[2.5rem] bg-black text-white shadow-2xl shadow-black/20 overflow-hidden relative">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Sipariş Özeti</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{cartCount} Ürün</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase">{item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-xs font-black">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-white/50">Kargo</span>
                  <span className="font-black text-emerald-400">ÜCRETSİZ</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-white/50 text-xs uppercase tracking-widest">Toplam</span>
                  <div className="text-right">
                    <span className="block text-4xl font-black tracking-tighter leading-none mb-1">{orderDetails.displayAmount}</span>
                  </div>
                </div>
              </div>

              {step === 'payment' && (
                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Teslimat Adresi Onaylandı</p>
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
