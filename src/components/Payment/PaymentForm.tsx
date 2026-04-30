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

      // Only add user_id if logged in
      if (user) {
        insertData.user_id = user.id;
      }

      console.log('Inserting to Supabase:', insertData);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single();

      if (orderError) {
        console.error('CRITICAL_DATABASE_ERROR:', orderError);
        // WE SHOW THE EXACT ERROR TO THE USER NOW
        throw new Error(`Veritabanı Hatası: ${orderError.message} (${orderError.code}) - Lütfen yöneticiye bildirin.`);
      }

      if (!orderData) throw new Error('Sipariş oluşturuldu ancak yanıt alınamadı.');

      console.log('Order created successfully:', orderData.id);

      const [expiryMonth, expiryYear] = formData.expiryDate.split('/');
      
      const response = await PaymentService.initiate3DPayment({
        orderId: orderData.id,
        amount: numericAmount,
        cardHolderName: formData.cardHolderName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth,
        expiryYear: `20${expiryYear}`,
        cvv: formData.cvv,
        callbackUrl: `https://idqnxgtleerpanujcdfn.supabase.co/functions/v1/tami-callback`
      });

      console.log('Payment API Response Received:', response);
      
      const actualHtmlContent = response.data?.htmlContent || response.htmlContent;
      const isSuccess = response.success || (response.data && response.success);

      if (isSuccess && actualHtmlContent) {
        console.log('3D Secure HTML Content found, triggering onSuccess...');
        onSuccess(actualHtmlContent);
      } else {
        const errorMsg = response.message || response.error || (response.data && response.data.message) || 'Tami ödeme başlatma hatası verdi.';
        console.error('Payment Error Detail:', response);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Payment Error Catch:', error);
      toast.error(error.message, {
        duration: 8000, // Show longer to read
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <CreditCard className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Güvenli Ödeme</h2>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Tami Sanal POS</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-black border-zinc-100 bg-zinc-50 py-1">
          {amount} TL
        </Badge>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
        <Info className="text-amber-600 shrink-0" size={18} />
        <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
          Şu an <strong>Test Modu</strong> aktif. Lütfen Tami test kartlarını kullanarak deneme yapınız.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="cardHolderName" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Kart Üzerindeki İsim</Label>
          <Input 
            id="cardHolderName" 
            placeholder="AD SOYAD" 
            required
            className="h-12 rounded-xl border-zinc-100 focus:ring-black bg-zinc-50/50 font-medium"
            value={formData.cardHolderName}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cardNumber" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Kart Numarası</Label>
          <div className="relative">
            <Input 
              id="cardNumber" 
              placeholder="0000 0000 0000 0000" 
              required
              className="h-12 rounded-xl border-zinc-100 focus:ring-black bg-zinc-50/50 font-mono text-base tracking-wider"
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
            <Label htmlFor="expiryDate" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Sona Erme</Label>
            <Input 
              id="expiryDate" 
              placeholder="AA/YY" 
              required
              className="h-12 rounded-xl border-zinc-100 focus:ring-black bg-zinc-50/50 font-mono"
              value={formData.expiryDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cvv" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">CVC</Label>
            <Input 
              id="cvv" 
              placeholder="000" 
              required
              type="password"
              className="h-12 rounded-xl border-zinc-100 focus:ring-black bg-zinc-50/50 font-mono"
              value={formData.cvv}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-widest mt-4 group overflow-hidden relative"
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
          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Secure</span>
          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Checkout</span>
        </div>
      </div>
    </motion.div>
  );
};
