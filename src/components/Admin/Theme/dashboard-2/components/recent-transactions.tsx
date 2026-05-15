"use client"

import { useState } from "react"
import { Eye, Package, Truck, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAdminData } from "@/hooks/useAdminData"
import { OrderDetailSheet } from "../../../Modals/OrderDetailSheet"
import type { AdminOrder } from "@/hooks/useAdminData"

interface RecentTransactionsProps {
  orders: AdminOrder[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'delivered':
      return { variant: 'default' as const, label: 'Teslim Edildi', icon: CheckCircle2 };
    case 'shipped':
      return { variant: 'secondary' as const, label: 'Kargoda', icon: Truck };
    case 'processing':
      return { variant: 'secondary' as const, label: 'Hazırlanıyor', icon: Package };
    case 'cancelled':
      return { variant: 'destructive' as const, label: 'İptal', icon: null };
    default:
      return { variant: 'outline' as const, label: 'Beklemede', icon: Clock };
  }
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay < 7) return `${diffDay} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

export function RecentTransactions({ orders }: RecentTransactionsProps) {
  const { updateOrderStatus } = useAdminData();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Show the 5 most recent orders
  const recentOrders = orders.slice(0, 5);

  if (recentOrders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-10 w-10 mx-auto text-zinc-300 mb-4" />
          <p className="text-sm font-medium text-zinc-400">Henüz sipariş bulunmuyor</p>
          <p className="text-xs text-zinc-300 mt-1">Müşteriler sipariş verdiğinde burada görünecek</p>
        </CardContent>
      </Card>
    );
  }

  const handleOrderClick = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <>
      <div className="space-y-3">
        {recentOrders.map((order) => {
          const statusInfo = getStatusBadge(order.status);
          const initials = order.user.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

          return (
            <div 
              key={order.id} 
              onClick={() => handleOrderClick(order)}
              className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-zinc-50/50 hover:bg-zinc-100 transition-all cursor-pointer border border-transparent hover:border-zinc-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                 <Avatar className="h-9 w-9 border-none bg-white shadow-sm transition-transform group-hover:scale-105">
                  <AvatarFallback className="text-[10px] font-semibold text-zinc-600">{initials}</AvatarFallback>
                 </Avatar>
                 <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{order.user}</p>
                    <p className="text-[10px] sm:text-xs font-medium text-zinc-500">#{order.shortId} · {getTimeAgo(order.rawDate)}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                 <Badge variant="secondary" className="h-6 text-[10px] font-medium border-none bg-white shadow-sm text-zinc-600 hidden sm:inline-flex">
                    {statusInfo.label}
                 </Badge>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-900 min-w-[60px] text-right">{order.total}</span>
                    <Eye className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailSheet 
        order={selectedOrder}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdateStatus={updateOrderStatus}
      />
    </>
  );
}
