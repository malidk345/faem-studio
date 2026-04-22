import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Mesaj gönderilirken hata oluştu:', err);
      setStatus('idle');
      alert('Mesaj gönderilemedi, lütfen tekrar deneyin.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 bg-white text-black">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Contact Info */}
          <div className="space-y-12">
            <motion.div variants={itemVariants}>
              <h1 className="text-[48px] font-bold tracking-tighter leading-none mb-6 lowercase text-neutral-900">iletişim/destek</h1>
              <p className="text-neutral-500 text-[16px] max-w-md leading-relaxed">
                Her türlü soru, iş birliği veya teknik destek talebiniz için bu formu kullanabilirsiniz. Ekibimiz size en kısa sürede dönüş sağlayacaktır.
              </p>
            </motion.div>

            <div className="space-y-10">
              <motion.div variants={itemVariants} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100">
                  <Mail size={20} className="text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 font-['Handjet',sans-serif] mb-1.5">E-Posta</h3>
                  <p className="text-[16px] font-medium text-neutral-800">hello@nivisgear.com</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100">
                  <Phone size={20} className="text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 font-['Handjet',sans-serif] mb-1.5">Telefon</h3>
                  <p className="text-[16px] font-medium text-neutral-800">+90 (212) 555 0100</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100">
                  <MapPin size={20} className="text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 font-['Handjet',sans-serif] mb-1.5">Adres</h3>
                  <p className="text-[16px] font-medium text-neutral-800 leading-relaxed">
                    Maslak Mah. Ahi Evran Cad.<br />
                    No: 42 D: 12, Sarıyer<br />
                    İstanbul, Türkiye
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            variants={itemVariants}
            className="bg-neutral-50/50 backdrop-blur-3xl p-8 md:p-10 rounded-[24px] border border-neutral-100 shadow-xl shadow-neutral-200/40"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-['Handjet',sans-serif] ml-1">İsim Soyisim</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-4 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-black transition-all focus:ring-4 focus:ring-black/5"
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-['Handjet',sans-serif] ml-1">E-Posta Adresi</label>
                <input 
                  required
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-4 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-black transition-all focus:ring-4 focus:ring-black/5"
                  placeholder="eposta@adresiniz.com"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-['Handjet',sans-serif] ml-1">Konu</label>
                <input 
                  required
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-4 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-black transition-all focus:ring-4 focus:ring-black/5"
                  placeholder="Mesajınızın konusu"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-['Handjet',sans-serif] ml-1">Mesajınız</label>
                <textarea 
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-4 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-black transition-all focus:ring-4 focus:ring-black/5 resize-none"
                  placeholder="Buraya notunuzu bırakın..."
                />
              </div>

              <button 
                type="submit"
                disabled={status !== 'idle'}
                className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {status === 'idle' && (
                  <>
                    Gönder
                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
                {status === 'sending' && (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                )}
                {status === 'success' && (
                  <>
                    Gönderildi
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
