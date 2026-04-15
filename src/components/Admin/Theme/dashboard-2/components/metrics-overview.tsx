"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  BarChart3 
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdminOrder } from "@/hooks/useAdminData"

interface MetricsOverviewProps {
  orders: AdminOrder[];
  products: any[];
}

export function MetricsOverview({ orders, products }: MetricsOverviewProps) {
  // Calculate real metrics from live data
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalNumeric, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalOrders = orders.length;

  const formattedRevenue = totalRevenue > 0 
    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue)
    : '$0';

  const metrics = [
    {
      title: "Toplam Gelir",
      value: formattedRevenue,
      description: "Toplam satış hacmi",
      change: totalOrders > 0 ? `${totalOrders} sipariş` : "—",
      trend: "up" as const,
      icon: DollarSign,
      footer: "Gerçek zamanlı veriler",
      subfooter: "Tüm siparişlerden hesaplandı"
    },
    {
      title: "Bekleyen Siparişler",
      value: pendingOrders.toString(),
      description: "İşlem bekleyen",
      change: pendingOrders > 0 ? "Aksiyon gerekli" : "Temiz",
      trend: pendingOrders > 3 ? "down" as const : "up" as const,
      icon: ShoppingCart,
      footer: pendingOrders > 0 ? "Hazırlanması gereken siparişler" : "Tüm siparişler hazır",
      subfooter: "Kargo bekleyenler dahil"
    },
    {
      title: "Ürün Sayısı",
      value: products.length.toString(),
      description: "Aktif katalog",
      change: `${products.filter(p => (p.stock_count || 0) > 0).length} stokta`,
      trend: "up" as const,
      icon: BarChart3,
      footer: "Aktif envanter durumu",
      subfooter: "Satışta olan ürünler"
    },
    {
      title: "Teslim Edilen",
      value: deliveredOrders.toString(),
      description: "Başarılı teslimat",
      change: totalOrders > 0 ? `%${Math.round((deliveredOrders / totalOrders) * 100)}` : "—",
      trend: "up" as const,
      icon: Users,
      footer: "Teslimat başarı oranı",
      subfooter: "Müşteri memnuniyeti"
    },
  ]

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className="cursor-pointer border-zinc-100 shadow-none rounded-2xl">
            <CardHeader className="p-4 pt-5">
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{metric.title}</CardDescription>
              <CardTitle className="text-xl font-black tabular-nums">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="px-4 pb-4 pt-0 flex-col items-start gap-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <Badge variant="outline" className="px-1.5 h-5 border-none bg-zinc-50 text-zinc-400">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {metric.change}
                </Badge>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
