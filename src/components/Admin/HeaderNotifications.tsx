import React, { useEffect, useRef } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  Circle,
  ChevronRight,
  Volume2,
  BellOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface HeaderNotificationsProps {
  orders: any[];
}

export function HeaderNotifications({ orders }: HeaderNotificationsProps) {
  const recentOrders = orders.slice(0, 5);
  const unreadCount = orders.filter(o => o.status === 'pending' || o.status === 'new').length;
  const prevCountRef = useRef(unreadCount);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notification sound
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Request notification permissions
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Bildirimler aktif edildi!');
      }
    }
  };

  // Watch for new orders and trigger alerts
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      // 1. Play Sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play blocked'));
      }

      // 2. Browser Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni Sipariş! 🔔', {
          body: 'Mağazanıza yeni bir sipariş düştü. Kontrol etmek için tıklayın.',
          icon: '/manifest.json'
        });
      }

      // 3. UI Toast
      toast('Yeni Sipariş Alındı!', {
        description: 'Detaylar için bildirim merkezini kontrol edin.',
        action: {
          label: 'Görüntüle',
          onClick: () => console.log('Siparişe git')
        },
      });
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  return (
    <div className="flex items-center gap-2">
      {/* Notification Permission Trigger */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={requestPermission}
          className="w-8 h-8 rounded-full hover:bg-amber-50 text-amber-600 animate-pulse"
          title="Bildirim İzni Ver"
        >
          <BellOff size={14} />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-md hover:bg-black/5 transition-all active:scale-95 group">
            <Bell size={19} strokeWidth={2} className="text-black group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[calc(100vw-32px)] sm:w-85 mx-4 sm:mx-0 rounded-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 liquid-header-dark backdrop-blur-3xl"
        >
          <DropdownMenuLabel className="flex items-center justify-between px-4 py-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Yönetim Paneli</span>
              <span className="text-base font-black tracking-tighter text-white">Bildirim Merkezi</span>
            </div>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-[9px] font-black uppercase border-white/20 bg-white text-black px-2 py-0.5">
                {unreadCount} Yeni
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10 mx-2" />
          <div className="py-2 space-y-1 max-h-[400px] overflow-y-auto hide-scrollbar">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, i) => (
                <DropdownMenuItem key={order.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer group transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    order.status === 'pending' 
                      ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                      : 'bg-zinc-900 border-white/10 text-zinc-500'
                  }`}>
                    <ShoppingBag size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[12px] font-bold text-white truncate pr-2">
                        {order.user || 'Misafir Müşteri'}
                      </p>
                      <span className="text-[10px] font-black text-zinc-400 font-mono">
                        {order.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'pending' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                      <p className="text-[11px] text-zinc-500 font-medium">Yeni sipariş detayları</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-12 text-center bg-white/5 rounded-2xl mx-2 border border-white/5">
                <BellOff size={24} className="mx-auto text-zinc-700 mb-3 opacity-20" />
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Kayıtlı bildirim bulunmuyor</p>
              </div>
            )}
          </div>
          <DropdownMenuSeparator className="bg-white/10 mx-2" />
          <div className="p-2">
            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-10 transition-all">
              Tüm Bildirimleri Yönet
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
