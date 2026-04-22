"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { AdminOrder } from "@/hooks/useAdminData"

interface RevenueBreakdownProps {
  orders: AdminOrder[];
}

export function RevenueBreakdown({ orders }: RevenueBreakdownProps) {
  const id = "revenue-breakdown"

  const categoryData = React.useMemo(() => {
    const categories: Record<string, { category: string; amount: number; fill: string }> = {};
    const colors = [
      "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", 
      "var(--chart-4)", "var(--chart-5)"
    ];

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const cat = item.category || "Genel";
        const priceNum = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        const total = priceNum * (item.quantity || 1);

        if (!categories[cat]) {
          categories[cat] = {
            category: cat,
            amount: 0,
            fill: colors[Object.keys(categories).length % colors.length]
          };
        }
        categories[cat].amount += total;
      });
    });

    return Object.values(categories).sort((a, b) => b.amount - a.amount);
  }, [orders]);

  const totalRevenue = React.useMemo(() => 
    categoryData.reduce((acc, curr) => acc + curr.amount, 0), 
  [categoryData]);

  const chartConfig = React.useMemo(() => {
    const config: any = { revenue: { label: "Ciro" } };
    categoryData.forEach(d => {
      config[d.category] = { label: d.category, color: d.fill };
    });
    return config;
  }, [categoryData]);

  return (
    <Card data-chart={id} className="apple-card border-none flex flex-col overflow-hidden h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="p-5 sm:p-6 lg:p-8 pb-2">
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">Kategori Dağılımı</CardTitle>
        <CardDescription className="text-xs font-medium text-zinc-500 mt-1">Ürün kategorilerine göre ciro paylaşımı</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center p-5 sm:p-6 lg:p-8 pt-2">
        <div className="mx-auto aspect-square w-full max-w-[250px] mb-8">
          <ChartContainer
            id={id}
            config={chartConfig}
            className="w-full h-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                innerRadius={65}
                outerRadius={90}
                strokeWidth={5}
                stroke="white"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-zinc-900 text-2xl font-semibold"
                          >
                            ${Math.round(totalRevenue)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-zinc-500 text-[10px] font-medium uppercase tracking-widest"
                          >
                            Toplam
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {categoryData.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.fill }} />
                <span className="text-sm font-semibold text-zinc-600 truncate max-w-[100px]">{item.category}</span>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900">${Math.round(item.amount)}</span>
                <span className="text-[10px] font-medium text-zinc-500 bg-white px-1.5 py-0.5 rounded-md shadow-sm">
                  %{Math.round((item.amount / totalRevenue) * 100)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
