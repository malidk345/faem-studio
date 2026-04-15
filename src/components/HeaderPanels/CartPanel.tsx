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
    const cleanPrice = item.price.replace(/[^\d.,]/g, '').replace(',', '.');
    const priceNum = parseFloat(cleanPrice) || 0;
    return total + (priceNum * item.quantity);
  }, 0);

  return (
    <motion.div variants={containerVariants} className="flex flex-col max-h-[60vh]">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {cartItems.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-10 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
            {t('cart.empty_msg')}
          </motion.div>
        ) : (
          cartItems.map(item => (
            <motion.div variants={itemVariants} key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5">
              <img src={item.image} alt={item.name} className="w-14 h-18 object-cover rounded-xl shadow-lg border border-white/10" referrerPolicy="no-referrer" />
              <div className="flex-1 flex flex-col pt-0.5">
                <span className="text-white/90 text-[13px] font-bold leading-tight tracking-tight">{item.name}</span>
                <span className="text-white/30 text-[10px] mt-1 font-bold uppercase tracking-widest">
                  {item.size} · {item.quantity} ADET
                </span>
                <span className="text-white text-[13px] font-bold mt-2">{item.price}</span>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="w-9 h-9 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 rounded-xl transition-all mr-1 shrink-0">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <motion.div variants={itemVariants} className="px-6 py-6 border-t border-white/10 bg-white/5">
          <div className="flex justify-between text-white mb-6 items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t('cart.total')}</span>
            <span className="text-2xl font-black tracking-tighter">₺{cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => {
              if(onClose) onClose();
              navigate('/checkout');
            }}
            className="w-full bg-white text-black py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98] shadow-xl"
          >
            {t('cart.checkout')}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CartPanel;
