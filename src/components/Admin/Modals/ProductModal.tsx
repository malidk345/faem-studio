import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { ImageUpload } from '../ImageUpload';

interface ProductModalProps {
  onClose: () => void;
  categories: string[];
  onPublish: (product: any) => void;
  initialData?: any;
}

export function ProductModal({ onClose, categories, onPublish, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price?.replace(' ₺', '') || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    stock_count: initialData?.stock_count?.toString() || '24',
    image_url: initialData?.image_url || initialData?.image || ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image_url) {
      alert('Lütfen temel alanları doldurun.');
      return;
    }

    onPublish({
        ...formData,
        price: formData.price.includes('₺') ? formData.price : `${formData.price} ₺`,
        category: formData.category || categories[0]
    });

    setIsSuccess(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.95 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 100, opacity: 0, scale: 0.95 }} 
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} 
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-200"
            >
              <CheckCircle2 size={48} className="text-white" />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Ürün Yayınlandı</h2>
            <p className="text-black/40 font-medium max-w-xs">Mağaza koleksiyonuna başarıyla dahil edildi.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center px-10 py-8 border-b border-black/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
                      <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{initialData ? 'Ürün Revizyonu' : 'Yeni Ürün Kürasyonu'}</h2>
                    <p className="text-[10px] uppercase font-bold text-black/30 tracking-widest mt-0.5">{initialData ? 'Envanterİ Güncelle' : 'Studio Envanterİne Ekle'}</p>
                  </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 hide-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Sol Taraf: Görsel */}
                <div className="lg:col-span-5">
                   <ImageUpload 
                      onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))} 
                      currentImage={formData.image_url}
                   />
                </div>

                {/* Sağ Taraf: Detaylar */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block px-1 tracking-widest">Ürün Kimliği</label>
                      <input 
                        value={formData.name} 
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        type="text" 
                        placeholder="Örn: Noir Minimalist Trenchcoat" 
                        className="w-full px-6 py-4 bg-black/[0.03] border border-transparent rounded-[1.5rem] text-sm font-bold focus:outline-none focus:bg-white focus:border-black/10 transition-all" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block px-1 tracking-widest">Fiyat (₺)</label>
                        <input 
                          value={formData.price} 
                          onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                          type="text" 
                          placeholder="8.500" 
                          className="w-full px-6 py-4 bg-black/[0.03] border border-transparent rounded-[1.5rem] text-sm font-bold focus:outline-none focus:bg-white focus:border-black/10 transition-all" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block px-1 tracking-widest">Koleksiyon</label>
                        <select 
                          value={formData.category} 
                          onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-6 py-4 bg-black/[0.03] border border-transparent rounded-[1.5rem] text-sm font-bold focus:outline-none focus:bg-white focus:border-black/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Seçiniz</option>
                          {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block px-1 tracking-widest">Anlatım & Detaylar</label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Ürünün felsefesini ve materyal detaylarını yazın..." 
                        className="w-full h-32 px-6 py-4 bg-black/[0.03] border border-transparent rounded-[1.5rem] text-sm font-bold focus:outline-none focus:bg-white focus:border-black/10 transition-all resize-none" 
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                    <p className="text-[10px] text-black/30 font-bold max-w-[200px]">Ürün yayınlanmadan önce tüm detayları kontrol ettiğinizden emin olun.</p>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">İptal</button>
                        <button type="submit" className="bg-black text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20 active:scale-95">Ürünü Yayınla</button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
