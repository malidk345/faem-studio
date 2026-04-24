import React from 'react';
import { motion } from 'motion/react';
import { Mail, Trash2, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';

interface MessagesTabProps {
  messages: any[];
  onToggleRead: (id: string, isRead: boolean) => void;
  onDelete: (id: string) => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ messages, onToggleRead, onDelete }) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <MessageSquare size={40} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Henüz mesaj bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Gelen Mesajlar</h2>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mt-1">İletişim Formu Başvuruları</p>
        </div>
        <div className="bg-zinc-50 px-4 py-2 rounded-xl border-none shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Toplam: {messages.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative apple-card ${msg.is_read ? 'opacity-60' : 'opacity-100'} p-5 sm:p-6 transition-all`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${msg.is_read ? 'bg-zinc-200' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-1">{msg.subject}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{msg.message}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User size={14} />
                    <span className="text-xs font-medium text-zinc-700">{msg.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mail size={14} />
                    <a href={`mailto:${msg.email}`} className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline transition-colors">{msg.email}</a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:self-start">
                <a
                  href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: ' + (msg.subject || 'İletişim'))}&body=${encodeURIComponent(`Sayın ${msg.name},\n\nMesajınız için teşekkür ederiz.\n\n---\nOrijinal Mesaj: "${msg.message}"\n\nSaygılarımızla,\nFaem Studio`)}`}
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 transition-all"
                  title="E-posta ile yanıtla"
                >
                  <Mail size={18} />
                </a>
                <button
                  onClick={() => onToggleRead(msg.id, !msg.is_read)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    msg.is_read ? 'bg-neutral-50 text-neutral-400' : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                  title={msg.is_read ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}
                >
                  {msg.is_read ? <Clock size={18} /> : <CheckCircle size={18} />}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
                      onDelete(msg.id);
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
