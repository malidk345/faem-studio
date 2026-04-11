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
    <div className="flex-1 space-y-6 px-1 lg:px-6 pt-0">
      {/* Enhanced Header - Birebir Business Dashboard Style */}
      <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tighter">Business Intelligence</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Strategic performance overview and key retail metrics.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Main Dashboard Grid - High-End Business Standards */}
      <div className="@container/main space-y-6">
        
        {/* Top Row - Key Metrics (Real-time) */}
        <MetricsOverview />

        {/* Second Row - Charts (Business Visualization) */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <SalesChart />
          <RevenueBreakdown />
        </div>

        {/* Third Row - Activity & Performance */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <RecentTransactions />
          <TopProducts />
        </div>

        {/* Fourth Row - Strategic Insights */}
        <div className="bg-zinc-900 text-white rounded-3xl p-1 overflow-hidden shadow-2xl">
           <CustomerInsights />
        </div>
      </div>
    </div>
  );
}
