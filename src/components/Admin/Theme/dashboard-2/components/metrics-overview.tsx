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
    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalRevenue)
    : '₺0';

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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className="apple-card cursor-pointer border-none shadow-none rounded-2xl group">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center justify-between mb-1">
                 <CardDescription className="text-xs font-medium text-zinc-500">{metric.title}</CardDescription>
                 <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <metric.icon className="w-4 h-4" />
                 </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-semibold tabular-nums text-zinc-900 tracking-tight">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="px-5 pb-5 pt-3 flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 h-6 border-none bg-zinc-100 text-zinc-600 font-medium text-[11px]">
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
