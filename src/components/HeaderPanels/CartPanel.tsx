import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { containerVariants, itemVariants } from '../../utils/animations';

interface CartPanelProps {
  onClose?: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ onClose }) => {
  const { cartItems, removeFromCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const cartTotal = cartItems.reduce((total, item) => {
    // Enhanced parsing: Handles both dot and comma as decimal separators
    const cleanPrice = item.price.replace(/[^\d.,]/g, '').replace(',', '.');
    const priceNum = parseFloat(cleanPrice) || 0;
    return total + (priceNum * item.quantity);
  }, 0);

  return (
    <motion.div variants={containerVariants} className="flex flex-col max-h-[60vh]">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
        {cartItems.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-8 text-black/30 text-xs font-black uppercase tracking-widest">
            {t('cart.empty_msg')}
          </motion.div>
        ) : (
          cartItems.map(item => (
            <motion.div variants={itemVariants} key={item.id} className="flex gap-4 items-center bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100">
              <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-xl shadow-sm" referrerPolicy="no-referrer" />
              <div className="flex-1 flex flex-col">
                <span className="text-black text-[13px] font-black leading-tight tracking-tight">{item.name}</span>
                <span className="text-zinc-400 text-[10px] mt-1 font-bold uppercase tracking-widest">
                  {item.size} · {item.quantity} Adet
                </span>
                <span className="text-black text-sm font-black mt-2">{item.price}</span>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all mr-1 shrink-0">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <motion.div variants={itemVariants} className="p-6 pt-2 mt-2 bg-white border-t border-zinc-100">
          <div className="flex justify-between text-black mb-6 items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('cart.total')}</span>
            <span className="text-2xl font-black tracking-tighter">₺{cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => {
              if(onClose) onClose();
              navigate('/checkout');
            }}
            className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg"
          >
            {t('cart.checkout')}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CartPanel;
