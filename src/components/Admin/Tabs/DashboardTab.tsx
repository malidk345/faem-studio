import React from 'react';
import { MetricsOverview } from "../Theme/dashboard-2/components/metrics-overview";
import { RecentTransactions } from "../Theme/dashboard-2/components/recent-transactions";
import { SalesChart } from "../Theme/dashboard-2/components/sales-chart";
import { RevenueBreakdown } from "../Theme/dashboard-2/components/revenue-breakdown";
import type { AdminOrder } from "@/hooks/useAdminData";

interface DashboardTabProps {
  orders: AdminOrder[];
  products: any[];
}

export function DashboardTab({ orders, products }: DashboardTabProps) {
  return (
    <div className="flex-1 space-y-5 sm:space-y-8 px-0 pt-0">
      {/* Hyper-Compact Header */}
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">Stüdyo Nabzı</h1>
        <p className="text-zinc-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em]">Operasyonel Özet</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Real-time Metrics System — fed with live data */}
        <MetricsOverview orders={orders} products={products} />

        {/* Dynamic Analytics Pillar */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4">
            <SalesChart orders={orders} />
          </div>
          <div className="lg:col-span-3">
            <RevenueBreakdown orders={orders} />
          </div>
        </div>

        {/* Essential Activity Feed — fed with live orders */}
        <div className="bg-white border-y sm:border border-zinc-100 rounded-none sm:rounded-[2rem] p-4 sm:p-6 shadow-sm overflow-hidden -mx-3 sm:mx-0">
           <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                 <span className="w-1 h-4 sm:h-5 bg-black rounded-full" />
                 Sipariş Akışı
              </h3>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-400">{orders.length} toplam</span>
           </div>
           <RecentTransactions orders={orders} />
        </div>
      </div>
    </div>
  );
}
