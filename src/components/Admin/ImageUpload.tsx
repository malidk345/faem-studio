import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onUploadComplete, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create local preview
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Yükleme sırasında bir hata oluştu.');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold text-black/40 tracking-widest block px-1">Görsel Materyal</label>
      
      <div 
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`relative group cursor-pointer transition-all duration-500 rounded-[2rem] overflow-hidden border-2 border-dashed ${
          dragActive ? 'border-black bg-black/5 scale-[0.98]' : 'border-black/5 bg-black/[0.01] hover:bg-black/[0.03] hover:border-black/10'
        } ${preview ? 'aspect-[4/5]' : 'h-48'}`}
      >
        <input 
          type="file" 
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
          accept="image/*"
        />

        {preview ? (
          <div className="relative w-full h-full group/preview">
            <img src={preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full">Görseli Değiştir</p>
            </div>
            
            <button 
              onClick={removeImage}
              className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90"
            >
              <X size={16} />
            </button>

            {uploading && (
              <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <Loader2 size={32} className="animate-spin text-black" />
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </motion.div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">Yükleniyor...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="relative">
              <UploadCloud size={40} className="text-black/10 transition-transform group-hover:-translate-y-1 duration-500" />
              <motion.div 
                 animate={{ y: [0, -4, 0] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute -top-1 -right-1"
              >
                  <div className="w-2 h-2 bg-black rounded-full shadow-lg shadow-black/20" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Görseli sürükleyin veya seçin</p>
              <p className="text-[10px] text-black/30 font-medium mt-1 uppercase tracking-widest">PNG, JPG veya WEBP (Max 5MB)</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-100 p-3 rounded-2xl flex items-center gap-3 z-30"
            >
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-[11px] font-bold text-red-600 leading-none">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
