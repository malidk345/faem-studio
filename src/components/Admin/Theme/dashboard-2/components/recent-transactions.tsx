"use client"

import { Eye, MoreHorizontal, Package, Truck, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

    <div className="space-y-2">
      {recentOrders.map((order) => {
        const statusInfo = getStatusBadge(order.status);
        const initials = order.user.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        return (
          <div key={order.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-white transition-all cursor-pointer">
            <div className="flex items-center gap-3 min-w-0">
               <Avatar className="h-7 w-7 border">
                <AvatarFallback className="text-[9px] font-black">{initials}</AvatarFallback>
               </Avatar>
               <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{order.user}</p>
                  <p className="text-[9px] font-medium text-zinc-400">#{order.shortId} · {getTimeAgo(order.rawDate)}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
               <Badge variant="outline" className={`h-6 text-[9px] font-bold border-none bg-zinc-100 text-zinc-500`}>
                  {statusInfo.label}
               </Badge>
               <span className="text-xs font-black text-zinc-900 min-w-[60px] text-right">{order.total}</span>
            </div>
          </div>
        );
      })}
    </div>
}
