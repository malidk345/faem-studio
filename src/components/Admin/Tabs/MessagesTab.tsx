import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Trash2, CheckCircle, Clock, User, 
  MessageSquare, Search, ChevronDown, RotateCw, 
  MoreVertical, Square, GripVertical, ChevronLeft, 
  ChevronRight, Star
} from 'lucide-react';

interface MessagesTabProps {
  messages: any[];
  onToggleRead: (id: string, isRead: boolean) => void;
  onDelete: (id: string) => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ messages, onToggleRead, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter(m => 
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Gelen Mesajlar</h2>
           <p className="text-gray-500 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest mt-1">Müşteri İletişimi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 sm:px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-end shrink-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Okunmamış</span>
            <span className="text-sm sm:text-lg font-bold text-blue-700 leading-tight">{messages.filter(m => !m.is_read).length}</span>
          </div>
          <div className="px-2 sm:px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-end shrink-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Toplam</span>
            <span className="text-sm sm:text-lg font-bold text-gray-700 leading-tight">{messages.length}</span>
          </div>
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col text-[13px] shadow-sm min-h-[500px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-gray-200 text-gray-600 bg-white">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
              <Square className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-2 sm:gap-4 text-xs font-medium">
            <div className="flex flex-1 sm:flex-none items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Ara..." 
                className="bg-transparent border-none outline-none text-[11px] sm:text-xs w-full sm:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden xs:flex items-center gap-1">
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </div>
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Filtering (Visual only for now) */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
          <button className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 border-emerald-600 text-emerald-600 min-w-max cursor-pointer bg-emerald-50/30 transition-all">
            <Mail className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-tight text-[10px] sm:text-xs">Gelen Kutusu</span>
          </button>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 border-transparent text-gray-600 hover:bg-gray-50 min-w-max cursor-pointer transition-all">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-tight text-[10px] sm:text-xs">Yıldızlılar</span>
          </button>
        </div>

        {/* List View */}
        <div className="flex flex-col bg-white">
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`group flex items-center gap-3 px-3 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-all active:scale-[0.995] ${
                msg.is_read ? 'bg-gray-50/20' : 'bg-white'
              }`}
            >
              <div className="hidden xs:flex items-center gap-2 shrink-0 text-gray-300 pl-1">
                <GripVertical className="w-4.5 h-4.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Star className={`w-4 h-4 hover:text-amber-400 transition-colors ${msg.is_starred ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-6">
                <div className="w-20 sm:w-40 shrink-0">
                  <span className={`text-[12px] sm:text-sm truncate block leading-tight ${msg.is_read ? 'text-gray-500 font-medium' : 'text-gray-900 font-black'}`}>
                    {msg.name}
                  </span>
                </div>
                
                <div className="flex-1 truncate">
                  <span className={`text-[12px] sm:text-sm truncate block leading-tight ${msg.is_read ? 'text-gray-500' : 'text-gray-900 font-bold'}`}>
                    {msg.subject}
                  </span>
                  <span className="text-gray-400 text-[11px] sm:text-xs truncate hidden sm:inline opacity-70">{msg.message}</span>
                </div>
                
                <div className="shrink-0 w-16 sm:w-24 text-right text-[10px] sm:text-[12px] font-black text-gray-400 uppercase tracking-tighter">
                  {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </div>
              </div>
              
              <div className="shrink-0 flex items-center pr-1 sm:pr-2">
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm font-medium">Henüz mesaj bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
