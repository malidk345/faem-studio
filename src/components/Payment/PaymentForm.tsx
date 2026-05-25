import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PaymentService } from '@/services/PaymentService';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { CartItem } from '@/context/CartContext';

interface PaymentFormProps {
  amount: string;
  numericAmount: string;
  orderId: string;
  cartItems: CartItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  onSuccess: (htmlContent: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ amount, numericAmount, orderId, cartItems, shippingAddress, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Formatting logic
    let formattedValue = value;
    if (id === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    } else if (id === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim().substring(0, 5);
      if (formattedValue.endsWith('/')) formattedValue = formattedValue.slice(0, -1);
    } else if (id === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setFormData(prev => ({ ...prev, [id]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('--- Payment Process Started ---');
      
      // --- Step 1: Create Order ---
      toast.info("Siparişiniz hazırlanıyor...", { id: 'payment-status' });
      
      // Get current user if any
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData: any = {
        total: String(numericAmount),
        payment_status: 'pending',
        payment_provider: 'tami',
        status: 'pending', 
        items: cartItems,
        shipping_address: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal: shippingAddress.postalCode,
          email: shippingAddress.email,
          phone: shippingAddress.phone
        }
      };

      if (user) insertData.user_id = user.id;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Veritabanı Hatası: ${orderError.message}`);
      }

      // --- Step 2: Initiate Payment ---
      toast.info("Ödeme kanalı ile bağlantı kuruluyor...", { id: 'payment-status' });

      const [expiryMonth, expiryYear] = formData.expiryDate.split('/');
      
      const response = await PaymentService.initiate3DPayment({
        orderId: orderData.id,
        amount: numericAmount,
        cardHolderName: formData.cardHolderName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth,
        expiryYear: `20${expiryYear}`,
        cvv: formData.cvv,
        callbackUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tami-callback`,
        // Pass mandatory buyer details for V3
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone
      });

      console.log('Full Payment Response:', response);
      
      // Tami V3 returns threeDSHtmlContent when 3D is required
      const resData = response.data || response;
      const htmlContent = resData.threeDSHtmlContent || resData.htmlContent;
      const paymentUrl = resData.paymentUrl || resData.url;
      const isSuccess = response.success === true || resData.success === true || (resData.status === 'success');

      if (isSuccess && (htmlContent || paymentUrl)) {
        toast.success("Banka onay sayfasına yönlendiriliyorsunuz...", { id: 'payment-status' });
        
        if (paymentUrl) {
          // If a direct URL is provided, redirect the whole page
          // Validate the URL to prevent Open Redirect vulnerabilities
          try {
            const parsedUrl = new URL(paymentUrl);
            if (
              parsedUrl.protocol !== 'https:' ||
              !(parsedUrl.hostname === 'tami.com.tr' || parsedUrl.hostname.endsWith('.tami.com.tr'))
            ) {
              throw new Error('Güvenli olmayan ödeme bağlantısı tespit edildi.');
            }
            window.location.href = parsedUrl.toString();
          } catch (e: any) {
            console.error('URL Validation Error:', e);
            throw new Error('Geçersiz veya güvenli olmayan ödeme bağlantısı.');
          }
        } else {
          // If HTML form is provided (usually Base64 in V3), show the modal
          console.log('3D HTML found, passing to modal...');
          onSuccess(htmlContent);
        }
      } else {
        const errorMsg = response.message || resData.message || response.error || "Ödeme başlatılamadı. Lütfen kart bilgilerinizi kontrol edin.";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Payment Error Catch:', error);
      toast.error(error.message, { 
        id: 'payment-status',
        duration: 6000 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 rounded-xl bg-white border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
            <CreditCard className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Güvenli Ödeme</h2>
            <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest">Tami Sanal POS</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-zinc-100 bg-zinc-50 py-1">
          {amount} TL
        </Badge>
      </div>

      {import.meta.env.VITE_TAMI_IS_PRODUCTION !== 'true' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
          <Info className="text-amber-600 shrink-0" size={18} />
          <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
            Şu an <strong>Test Modu</strong> aktif. Lütfen Tami test kartlarını kullanarak deneme yapınız.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="cardHolderName" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Kart Üzerindeki İsim</Label>
          <Input 
            id="cardHolderName" 
            placeholder="AD SOYAD" 
            required
            className="h-12 rounded-lg border-zinc-100 focus:ring-black bg-zinc-50/50 font-medium"
            value={formData.cardHolderName}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cardNumber" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Kart Numarası</Label>
          <div className="relative">
            <Input 
              id="cardNumber" 
              placeholder="0000 0000 0000 0000" 
              required
              className="h-12 rounded-lg border-zinc-100 focus:ring-black bg-zinc-50/50 font-mono text-base tracking-wider"
              value={formData.cardNumber}
              onChange={handleInputChange}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              <CreditCard size={18} className="text-zinc-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">Sona Erme</Label>
            <Input 
              id="expiryDate" 
              placeholder="AA/YY" 
              required
              className="h-12 rounded-lg border-zinc-100 focus:ring-black bg-zinc-50/50 font-mono"
              value={formData.expiryDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cvv" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ml-1">CVC</Label>
            <Input 
              id="cvv" 
              placeholder="000" 
              required
              type="password"
              className="h-12 rounded-lg border-zinc-100 focus:ring-black bg-zinc-50/50 font-mono"
              value={formData.cvv}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-widest mt-4 group overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                İşleniyor...
              </motion.div>
            ) : (
              <motion.div 
                key="normal"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                Ödemeyi Onayla
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </form>

      <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
        <ShieldCheck size={24} />
        <div className="h-4 w-px bg-zinc-300" />
        <Lock size={20} />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-tighter leading-none">Secure</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter leading-none">Checkout</span>
        </div>
      </div>
    </motion.div>
  );
};
