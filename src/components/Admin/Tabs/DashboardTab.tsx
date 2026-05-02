import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Landmark, 
  TrendingUp, 
  Clock, 
  Package, 
  ShoppingCart,
  ChevronDown,
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Square,
  GripVertical,
  CheckCircle,
  Truck
} from 'lucide-react';
import type { AdminOrder } from "@/hooks/useAdminData";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DashboardTabProps {
  orders: AdminOrder[];
  products: any[];
}

export function DashboardTab({ orders, products }: DashboardTabProps) {
  // Metrics calculations from real data
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalNumeric, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  
  const lastProduct = products.length > 0 ? products[products.length - 1] : null;

  const formattedRevenue = new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY', 
    maximumFractionDigits: 0 
  }).format(totalRevenue);

  const dailyRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders
      .filter(o => new Date(o.rawDate) >= today)
      .reduce((sum, o) => sum + o.totalNumeric, 0);
  }, [orders]);

  const formattedDailyRevenue = new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY', 
    maximumFractionDigits: 0 
  }).format(dailyRevenue);

  return (
    <div className="flex flex-col gap-8">
      {/* Last Product Area */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 shrink-0">
          <Package className="w-4 h-4" />
        </div>
        <div className="flex-1 border-b-[1.5px] border-dotted border-gray-300 pb-1 overflow-hidden flex items-center justify-between">
          <span className="text-[13px] text-gray-600 font-medium truncate block">
            Eklenen Son Ürün:{' '}
            <span className="font-bold text-gray-900 mx-1">{lastProduct?.name || '—'}</span>
            {lastProduct && (
              <span className="text-blue-600 hover:underline cursor-pointer font-mono">/products/{lastProduct.id.slice(0, 8)}</span>
            )}
          </span>
          <span className="text-[12px] text-gray-400 font-mono hidden sm:block">
            {format(new Date(), 'EEE, MMM d, HH:mm', { locale: tr })}
          </span>
        </div>
      </div>

      {/* E-Commerce Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Revenue */}
        <div className="flex items-center gap-4">
          <div className="w-[56px] h-[56px] flex items-center justify-center border border-gray-200 rounded-xl shrink-0 text-emerald-600 bg-emerald-50">
            <DollarSign className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase mb-0.5">Günlük Ciro</span>
            <span className="text-[17px] font-medium text-gray-900">{formattedDailyRevenue}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="flex items-center gap-4">
          <div className="w-[56px] h-[56px] flex items-center justify-center border border-gray-200 rounded-xl shrink-0 text-blue-600 bg-blue-50">
            <Landmark className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase mb-0.5">Toplam Ciro</span>
            <span className="text-[17px] font-medium text-gray-900">{formattedRevenue}</span>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="flex items-center gap-4">
          <div className="w-[56px] h-[56px] flex items-center justify-center border border-gray-200 rounded-xl shrink-0 text-indigo-600 bg-indigo-50">
            <TrendingUp className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase mb-0.5">Büyüme Hızı</span>
            <span className="text-[17px] font-medium text-indigo-600">+12.5% M/o/M</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="flex items-center gap-4">
          <div className="w-[56px] h-[56px] flex items-center justify-center border border-gray-200 rounded-xl shrink-0 text-amber-500 bg-amber-50">
            <Clock className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase mb-0.5">Bekleyenler</span>
            <span className="text-[17px] font-medium text-gray-900">{pendingOrdersCount} İşlem Bekliyor</span>
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col text-[13px] shadow-sm min-h-[400px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 text-gray-600 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <Square className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
              <RotateCw className="w-4 h-4" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
              <MoreVertical className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline">1-{Math.min(orders.length, 16)} of {orders.length}</span>
            <div className="flex items-center gap-1">
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </div>
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <Keyboard className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
          <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-emerald-600 text-emerald-600 min-w-max cursor-pointer bg-emerald-50/30">
            <ShoppingCart className="w-4 h-4" />
            <span className="font-medium">Tüm Siparişler</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 cursor-pointer min-w-max">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Bekleyen</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">{pendingOrdersCount}</span>
          </div>
        </div>

        {/* List Content */}
        <div className="flex flex-col bg-white">
          {orders.slice(0, 15).map((order) => (
            <div 
              key={order.id} 
              className="group flex items-center gap-2 px-2 py-2 border-b border-gray-100 cursor-pointer hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0,0_1px_3px_1px_rgba(60,64,67,.15)] hover:z-10 hover:bg-white"
            >
              <div className="flex items-center gap-1.5 shrink-0 text-gray-400 pl-1">
                <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Square className="w-4 h-4 hover:text-gray-600 opacity-60" />
              </div>
              
              <div className={`w-24 shrink-0 truncate text-[10px] font-bold uppercase tracking-wider ${
                order.status === 'pending' ? 'text-amber-600' : 
                order.status === 'delivered' ? 'text-emerald-600' : 
                'text-blue-600'
              }`}>
                {order.status === 'pending' ? 'Bekliyor' : order.status === 'delivered' ? 'Teslim Edildi' : 'İşlemde'}
              </div>
              
              <div className="flex-1 truncate flex items-center gap-2">
                <span className="font-bold text-gray-900 w-[90px] shrink-0 font-mono text-[11px]">#{order.order_number}</span>
                <span className="text-gray-700 w-[120px] shrink-0 truncate">{order.customer_name || 'Misafir'}</span>
                
                <span className="font-medium text-gray-700 shrink-0 hidden md:inline w-[100px] text-right">{order.total}</span>
                
                <span className="text-gray-400 hidden sm:inline">-</span>
                <span className="text-gray-500 truncate hidden lg:inline text-xs">
                  {order.items?.map(i => i.product_name).join(', ')}
                </span>
              </div>
              
              <div className="shrink-0 w-16 sm:w-20 text-right text-[11px] font-bold text-gray-400 group-hover:hidden">
                {format(new Date(order.rawDate), 'HH:mm')}
              </div>
              
              <div className="shrink-0 items-center gap-3 text-gray-500 hidden group-hover:flex pr-2">
                <Package className="w-4 h-4 hover:text-gray-900" />
                <Truck className="w-4 h-4 hover:text-gray-900" />
                <CheckCircle className="w-4 h-4 hover:text-gray-900" />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="flex items-center justify-center py-20 text-gray-400 italic">
              Henüz bir sipariş kaydı bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
