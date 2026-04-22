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
      <div className="flex flex-col gap-1 sm:gap-1.5 mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-none">Stüdyo Nabzı</h1>
        <p className="text-zinc-500 text-[11px] sm:text-xs font-medium uppercase tracking-wider">Operasyonel Özet</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Real-time Metrics System — fed with live data */}
        <MetricsOverview orders={orders} products={products} />

        {/* Dynamic Analytics Pillar */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8">
          <div className="lg:col-span-4 apple-card p-4 sm:p-6">
            <SalesChart orders={orders} />
          </div>
          <div className="lg:col-span-3 apple-card p-4 sm:p-6">
            <RevenueBreakdown orders={orders} />
          </div>
        </div>

        {/* Essential Activity Feed — fed with live orders */}
        <div className="apple-card p-4 sm:p-6 overflow-hidden">
           <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
                 <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                 Sipariş Akışı
              </h3>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">{orders.length} Toplam</span>
           </div>
           <RecentTransactions orders={orders} />
        </div>
      </div>
    </div>
  );
}
