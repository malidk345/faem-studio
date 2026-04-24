import React from 'react';
import { motion } from 'motion/react';
import { X, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { containerVariants, itemVariants } from '../../utils/animations';

interface CartPanelProps {
  onClose?: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ onClose }) => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const cartTotal = cartItems.reduce((total, item) => {
    const cleanPrice = item.price.replace(/[^\d.,]/g, '').replace(',', '.');
    const priceNum = parseFloat(cleanPrice) || 0;
    return total + (priceNum * item.quantity);
  }, 0);

  return (
    <motion.div variants={containerVariants} className="flex flex-col w-full text-white">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 flex flex-col gap-8 max-h-[50vh] custom-scrollbar">
        {cartItems.length === 0 ? (
          <div className="py-16 text-center">
             <span className="text-[14px] font-normal uppercase tracking-[0.4em] text-white/10 font-['Handjet',sans-serif]">
               {t('cart.empty_msg')} // NULL.00
             </span>
          </div>
        ) : (
          cartItems.map(item => (
            <motion.div variants={itemVariants} key={item.id} className="flex gap-5 relative group">
              {/* Product Image Square */}
              <div className="w-24 h-28 bg-white/[0.03] border border-white/5 rounded-[2px] flex items-center justify-center overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-1 pt-0.5">
                <div className="flex justify-between items-start">
                  <h3 className="text-[14px] font-bold tracking-tight text-white/90 leading-none">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-[2px] hover:bg-white/10 transition-colors">
                     <X size={12} className="text-white/30" />
                  </button>
                </div>
                <p className="text-[16px] font-bold mt-1 text-white font-['Handjet',sans-serif]">
                   {item.price}
                </p>
                <div className="mt-4 flex flex-col gap-1">
                  <p className="text-[10px] uppercase font-normal tracking-widest text-white/30 font-['Handjet',sans-serif]">
                    Beden: <span className="text-white/80">{item.size}</span>
                  </p>
                  <p className="text-[10px] uppercase font-normal tracking-widest text-white/30 font-['Handjet',sans-serif]">
                    Adet: <span className="text-white/80">{item.quantity}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer / Total */}
      <div className="p-6 pt-4 border-t border-white/5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-3xl font-bold tracking-tighter text-white">{t('cart.total')}</span>
          <span className="text-3xl font-bold tracking-tighter text-white">₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
        </div>
        <p className="text-[10px] text-white/20 font-medium mb-8">{t('cart.notice')}</p>

        <div className="grid grid-cols-2 gap-2 pb-2">
          <button 
            onClick={() => { if(onClose) onClose(); navigate('/cart'); }}
            className="flex items-center justify-between px-5 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/5 rounded-[2px] group transition-all active:scale-[0.98]"
          >
            <span className="text-[18px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">{t('cart.view_cart')}</span>
            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-30 group-hover:opacity-100" />
          </button>
          <button 
            onClick={() => { if(onClose) onClose(); navigate('/checkout'); }}
            className="flex items-center justify-between px-5 py-4 bg-[#ddff34] text-black rounded-[2px] group transition-all active:scale-[0.98]"
          >
            <span className="text-[18px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">{t('cart.checkout')}</span>
            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPanel;
