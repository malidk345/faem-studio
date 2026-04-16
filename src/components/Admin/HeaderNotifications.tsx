import React from 'react';
import { 
  Bell, 
  ShoppingBag, 
  Circle,
  ChevronRight
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

interface HeaderNotificationsProps {
  orders: any[];
}

export function HeaderNotifications({ orders }: HeaderNotificationsProps) {
  const recentOrders = orders.slice(0, 5);
  const unreadCount = orders.filter(o => o.status === 'pending' || o.status === 'new').length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-xl hover:bg-zinc-100 transition-all active:scale-95">
          <Bell size={19} strokeWidth={2} className="text-zinc-600" />
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
      <DropdownMenuContent align="end" className="w-80 rounded-2xl border-zinc-100 shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Canlı Akış</span>
            <span className="text-sm font-black tracking-tight">Bildirimler</span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="outline" className="text-[9px] font-black uppercase border-none bg-zinc-100 text-zinc-600">
              {unreadCount} Yeni
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-50 mx-2" />
        <div className="py-2 space-y-1">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, i) => (
              <DropdownMenuItem key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 cursor-pointer group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  order.status === 'pending' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'
                }`}>
                  <ShoppingBag size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[11px] font-bold text-zinc-900 truncate pr-2">
                       {order.customer_name || 'Misafir Müşteri'}
                    </p>
                    <span className="text-[9px] font-bold text-zinc-400 font-mono">
                      {order.total_amount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Circle size={4} className={order.status === 'pending' ? 'fill-emerald-500 text-emerald-500' : 'fill-zinc-300 text-zinc-300'} />
                    <p className="text-[10px] text-zinc-500 font-medium">Yeni sipariş oluşturuldu</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-8 text-center bg-zinc-50/50 rounded-xl mx-2">
               <p className="text-[10px] uppercase font-black tracking-widest text-zinc-300">Henüz bildirim yok</p>
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="bg-zinc-50 mx-2" />
        <DropdownMenuItem className="w-full p-2 justify-center">
          <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-lg h-8">
            Tüm Etkinlikleri Gör
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
