import React, { useState, useMemo } from 'react';
import { MetricsOverview } from "../Theme/dashboard-2/components/metrics-overview";
import { RecentTransactions } from "../Theme/dashboard-2/components/recent-transactions";
import { SalesChart } from "../Theme/dashboard-2/components/sales-chart";
import { RevenueBreakdown } from "../Theme/dashboard-2/components/revenue-breakdown";
import type { AdminOrder } from "@/hooks/useAdminData";

interface DashboardTabProps {
  orders: AdminOrder[];
  products: any[];
}

type DateFilter = 'today' | '7d' | '30d' | 'all';

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Bugün' },
  { value: '7d', label: '7 Gün' },
  { value: '30d', label: '30 Gün' },
  { value: 'all', label: 'Tümü' },
];

export function DashboardTab({ orders, products }: DashboardTabProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;
    const now = new Date();
    const cutoff = new Date();
    if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (dateFilter === '7d') cutoff.setDate(now.getDate() - 7);
    else if (dateFilter === '30d') cutoff.setDate(now.getDate() - 30);
    return orders.filter(o => new Date(o.rawDate) >= cutoff);
  }, [orders, dateFilter]);

  return (
    <div className="flex-1 space-y-5 sm:space-y-8 px-0 pt-0">
      {/* Header + Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-none">Stüdyo Nabzı</h1>
          <p className="text-zinc-500 text-[11px] sm:text-xs font-medium uppercase tracking-wider">Operasyonel Özet</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                dateFilter === f.value 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Real-time Metrics System — fed with filtered data */}
        <MetricsOverview orders={filteredOrders} products={products} />

        {/* Dynamic Analytics Pillar */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8">
          <div className="lg:col-span-4 apple-card p-4 sm:p-6">
            <SalesChart orders={filteredOrders} />
          </div>
          <div className="lg:col-span-3 apple-card p-4 sm:p-6">
            <RevenueBreakdown orders={filteredOrders} />
          </div>
        </div>

        {/* Essential Activity Feed — fed with filtered orders */}
        <div className="apple-card p-4 sm:p-6 overflow-hidden">
           <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
                 <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                 Sipariş Akışı
              </h3>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">{filteredOrders.length} Toplam</span>
           </div>
           <RecentTransactions orders={filteredOrders} />
        </div>
      </div>
    </div>
  );
}
