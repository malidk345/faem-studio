import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { containerVariants, itemVariants } from '../utils/animations';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const cartTotal = cartItems.reduce((total, item) => {
    const cleanPrice = item.price.replace(/[^\d.,]/g, '').replace(',', '.');
    const priceNum = parseFloat(cleanPrice) || 0;
    return total + (priceNum * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <section className="pt-32 pb-16 px-6 sm:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <span className="text-[10px] font-normal uppercase tracking-[0.4em] text-black/30 font-['Handjet',sans-serif]">Shopping Bag</span>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-none italic">Sepetiniz.</h1>
          <p className="text-black/40 text-sm max-w-sm font-medium mt-4">
            Ekipmanlarınızı gözden geçirin ve maceraya hazır olduğunuzdan emin olun.
          </p>
        </motion.div>
      </section>

      <section className="px-6 sm:px-12 max-w-7xl mx-auto pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Item List */}
          <div className="lg:col-span-8">
            <AnimatePresence mode='popLayout'>
              {cartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 border-y border-black/5 flex flex-col items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                    <ShoppingBag className="text-black/20" size={24} />
                  </div>
                  <p className="text-black/30 uppercase font-bold tracking-widest text-xs">Sepetiniz şu an boş</p>
                  <Link to="/shop" className="text-sm font-black underline underline-offset-8 decoration-1 hover:text-black/60 transition-colors">
                    ALIŞVERİŞE BAŞLA
                  </Link>
                </motion.div>
              ) : (
                <div className="flex flex-col">
                  <div className="hidden sm:grid grid-cols-12 pb-6 border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-black/30 font-['Handjet',sans-serif]">
                    <div className="col-span-6">Ürün</div>
                    <div className="col-span-2 text-center">Adet</div>
                    <div className="col-span-4 text-right">Fiyat</div>
                  </div>

                  {cartItems.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 sm:grid-cols-12 py-10 border-b border-black/5 gap-8 sm:gap-0 items-center bg-white"
                    >
                      {/* Product */}
                      <div className="col-span-6 flex gap-8">
                        <div className="w-32 h-40 bg-black/[0.02] rounded-[4px] overflow-hidden border border-black/5 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="text-lg font-bold tracking-tight">{item.name}</h3>
                          <div className="flex flex-col gap-1 mt-3">
                             <span className="text-[10px] font-normal uppercase tracking-widest text-black/40 font-['Handjet',sans-serif]">Beden: {item.size}</span>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-widest text-red-500/60 hover:text-red-500 mt-6 transition-colors font-['Handjet',sans-serif]"
                          >
                            <Trash2 size={12} /> Kaldır
                          </button>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border border-black/10 rounded-[2px] h-10 px-1 gap-4">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-sm transition-colors"
                          >
                            <span className="text-lg font-light">−</span>
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-sm transition-colors"
                          >
                            <span className="text-lg font-light">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-4 text-right">
                        <p className="text-xl font-bold tracking-tighter">{item.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-black/[0.02] border border-black/5 p-10 rounded-[4px]">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 text-black/40 font-['Handjet',sans-serif]">Özet</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-black/60">Ara Toplam</span>
                  <span className="font-bold">₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-black/60">Kargo</span>
                  <span className="text-[10px] font-normal uppercase tracking-widest font-['Handjet',sans-serif]">ÜCRETSİZ</span>
                </div>
                <div className="pt-6 border-t border-black/5 flex justify-between items-baseline">
                  <span className="text-lg font-black italic">Toplam</span>
                  <span className="text-3xl font-black tracking-tighter">₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#ddff34] text-black py-6 rounded-[2px] flex items-center justify-between px-6 group transition-transform active:scale-[0.98]"
                >
                  <span className="text-[20px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">ÖDEMEYE GEÇ</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link 
                   to="/shop"
                   className="w-full bg-black text-white py-6 rounded-[2px] flex items-center justify-between px-6 group transition-transform active:scale-[0.98]"
                >
                  <span className="text-[20px] font-normal uppercase tracking-[0.05em] font-['Handjet',sans-serif]">ALIŞVERİŞE DEVAM ET</span>
                  <ArrowLeft size={18} className="order-first group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="mt-10 pt-10 border-t border-black/5">
                <p className="text-[10px] leading-relaxed text-black/30 font-medium italic">
                  * Vergiler ve kargo ücretleri bu aşamada kesinleşir. İade politikamızı okumayı unutmayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
