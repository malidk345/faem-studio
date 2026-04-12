import React from 'react';
import { MetricsOverview } from "../Theme/dashboard-2/components/metrics-overview";
import { SalesChart } from "../Theme/dashboard-2/components/sales-chart";
import { RecentTransactions } from "../Theme/dashboard-2/components/recent-transactions";
import { TopProducts } from "../Theme/dashboard-2/components/top-products";
import { CustomerInsights } from "../Theme/dashboard-2/components/customer-insights";
import { QuickActions } from "../Theme/dashboard-2/components/quick-actions";
import { RevenueBreakdown } from "../Theme/dashboard-2/components/revenue-breakdown";

interface DashboardTabProps {
  orders: any[];
  products: any[];
}

export function DashboardTab({ orders, products }: DashboardTabProps) {
  return (
    <div className="flex-1 space-y-10 px-0 lg:px-4 pt-0">
      {/* Hyper-Compact Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter leading-none">Studio Pulse</h1>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Essence</p>
      </div>

      <div className="space-y-10">
        {/* Real-time Metrics System */}
        <MetricsOverview />

        {/* Essential Activity Feed */}
        <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-4 md:p-10 shadow-sm overflow-hidden">
           <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-black rounded-full" />
              Recent Dispatch Flow
           </h3>
           <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
