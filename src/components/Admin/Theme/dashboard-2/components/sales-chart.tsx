"use client"

import { useState, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { AdminOrder } from "@/hooks/useAdminData"

interface LiveSalesChartProps {
  orders: AdminOrder[];
}

export function SalesChart({ orders }: LiveSalesChartProps) {
  const [timeRange, setTimeRange] = useState("6m")

  const chartData = useMemo(() => {
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const now = new Date();
    const data: Record<string, { month: string; sales: number; sortKey: number }> = {};

    // Initialize the last 12 months with 0
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      data[key] = {
        month: months[d.getMonth()],
        sales: 0,
        sortKey: d.getTime()
      };
    }

    // Aggregate real order data
    orders.forEach(order => {
      const d = new Date(order.rawDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (data[key]) {
        data[key].sales += order.totalNumeric;
      }
    });

    return Object.values(data).sort((a, b) => a.sortKey - b.sortKey);
  }, [orders]);

  const chartConfig = {
    sales: {
      label: "Satışlar",
      color: "var(--primary)",
    }
  };

  return (
    <Card className="cursor-pointer border-zinc-100 shadow-sm rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-8">
        <div>
          <CardTitle className="text-xl font-black tracking-tight">Satış Performansı</CardTitle>
          <CardDescription className="text-xs font-medium text-zinc-400">Gerçekleşen aylık ciro akışı</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-zinc-50 font-bold text-[10px] uppercase border-none">Canlı</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="px-4 pb-6">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-zinc-400 font-bold"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-zinc-400 font-bold"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="var(--color-sales)"
                strokeWidth={3}
                fill="url(#colorSales)"
                animationDuration={1500}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function Badge({ children, className, variant }: any) {
  return <span className={`px-2.5 py-1 rounded-full ${className}`}>{children}</span>
}
