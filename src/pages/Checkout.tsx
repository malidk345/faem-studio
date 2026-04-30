import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaymentForm } from '@/components/Payment/PaymentForm';
import { Payment3DSModal } from '@/components/Payment/Payment3DSModal';
import { ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { useCart } from '@/context/CartContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount } = useCart();
  const [show3DS, setShow3DS] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  
  // Convert currency string (₺1.250,00) to API-friendly amount (1250.00)
  const numericAmount = cartTotal.replace(/[^0-9,.]/g, '').replace(',', '.');
  
  const orderDetails = {
    amount: numericAmount,
    displayAmount: cartTotal,
    orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
    itemsCount: cartCount
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-black font-bold uppercase text-[10px] tracking-widest transition-colors"
          >
            <ArrowLeft size={16} />
            Alışverişe Dön
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">256-bit SSL Güvenli Ödeme</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Sol: Ödeme Formu */}
          <div>
            <PaymentForm 
              amount={orderDetails.displayAmount} 
              numericAmount={orderDetails.amount}
              orderId={orderDetails.orderId}
              cartItems={cartItems}
              onSuccess={handlePaymentSuccess}
            />
          </div>

          {/* Sağ: Sipariş Özeti */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:pl-12"
          >
            <div className="p-10 rounded-[2.5rem] bg-black text-white shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Sipariş Özeti</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{orderDetails.orderId}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-white/50">Ürün Sayısı</span>
                  <span className="font-black">{orderDetails.itemsCount} Adet</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-white/50">Kargo</span>
                  <span className="font-black text-emerald-400">ÜCRETSİZ</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-bold text-white/50 text-xs uppercase tracking-widest">Ödenecek Tutar</span>
                  <div className="text-right">
                    <span className="block text-4xl font-black tracking-tighter leading-none mb-1">{orderDetails.displayAmount}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Türk Lirası</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[11px] leading-relaxed text-white/60 font-medium italic">
                  * "Ödemeyi Onayla" butonuna bastığınızda Tami güvenli ödeme sayfasına yönlendirileceksiniz. Ödemeniz başarıyla tamamlandığında siparişiniz anında işleme alınacaktır.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3D Secure Modal */}
      <Payment3DSModal 
        isOpen={show3DS}
        onClose={() => setShow3DS(false)}
        htmlContent={htmlContent}
      />
    </div>
  );
};

export default CheckoutPage;
