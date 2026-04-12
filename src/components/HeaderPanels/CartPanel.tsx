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
    // Robust parsing: Remove any non-numeric characters EXCEPT decimals
    const priceNum = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    return total + (priceNum * item.quantity);
  }, 0);

  return (
    <motion.div variants={containerVariants} className="flex flex-col max-h-[60vh]">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {cartItems.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-8 text-black/30 text-sm font-medium">
            {t('cart.empty_msg')}
          </motion.div>
        ) : (
          cartItems.map(item => (
            <motion.div variants={itemVariants} key={item.id} className="flex gap-3 items-center bg-black/5 p-2 rounded-xl border border-black/5">
              <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" referrerPolicy="no-referrer" />
              <div className="flex-1 flex flex-col">
                <span className="text-black text-sm font-bold leading-tight">{item.name}</span>
                <span className="text-black/40 text-[11px] mt-0.5 font-medium">
                  {t('cart.size')}: {item.size} · {t('cart.qty')}: {item.quantity}
                </span>
                <span className="text-black text-sm font-bold mt-1">{item.price}</span>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-black/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mr-1 shrink-0">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <motion.div variants={itemVariants} className="p-5 pt-0 mt-2">
          <div className="w-full h-[1px] bg-black/5 mb-4"></div>
          <div className="flex justify-between text-black mb-4 items-center px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black/30">{t('cart.total')}</span>
            <span className="text-xl font-extrabold">${cartTotal.toFixed(2)}</span>
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
