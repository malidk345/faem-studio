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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Last Product Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 shrink-0">
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="flex-1 border-b-[1px] sm:border-b-[1.5px] border-dotted border-gray-300 pb-1 overflow-hidden flex items-center justify-between">
          <span className="text-[11px] sm:text-[13px] text-gray-600 font-medium truncate block">
            Son Ürün:{' '}
            <span className="font-bold text-gray-900 mx-1">{lastProduct?.name || '—'}</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden xs:block">
            {format(new Date(), 'HH:mm', { locale: tr })}
          </span>
        </div>
      </div>

      {/* E-Commerce Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Daily Revenue */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-[56px] sm:h-[56px] flex items-center justify-center border border-gray-200 rounded-lg sm:rounded-xl shrink-0 text-emerald-600 bg-emerald-50">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[8px] sm:text-[10px] font-semibold tracking-[0.1em] text-gray-500 uppercase mb-0.5 truncate">Günlük</span>
            <span className="text-sm sm:text-[17px] font-black text-gray-900 truncate">{formattedDailyRevenue}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-[56px] sm:h-[56px] flex items-center justify-center border border-gray-200 rounded-lg sm:rounded-xl shrink-0 text-blue-600 bg-blue-50">
            <Landmark className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[8px] sm:text-[10px] font-semibold tracking-[0.1em] text-gray-500 uppercase mb-0.5 truncate">Toplam</span>
            <span className="text-sm sm:text-[17px] font-black text-gray-900 truncate">{formattedRevenue}</span>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-[56px] sm:h-[56px] flex items-center justify-center border border-gray-200 rounded-lg sm:rounded-xl shrink-0 text-indigo-600 bg-indigo-50">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[8px] sm:text-[10px] font-semibold tracking-[0.1em] text-gray-500 uppercase mb-0.5 truncate">Büyüme</span>
            <span className="text-sm sm:text-[17px] font-black text-indigo-600 truncate">+12.5%</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-[56px] sm:h-[56px] flex items-center justify-center border border-gray-200 rounded-lg sm:rounded-xl shrink-0 text-amber-500 bg-amber-50">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[8px] sm:text-[10px] font-semibold tracking-[0.1em] text-gray-500 uppercase mb-0.5 truncate">Bekleyen</span>
            <span className="text-sm sm:text-[17px] font-black text-gray-900 truncate">{pendingOrdersCount} Adet</span>
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col text-[13px] shadow-sm min-h-[400px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-gray-200 text-gray-600 bg-white">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <Square className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-2 sm:gap-4 text-xs">
            <span className="font-bold text-[10px] uppercase tracking-tighter text-gray-400">Son Hareketler</span>
            <div className="flex items-center gap-1">
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </div>
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex flex-col bg-white">
          {orders.slice(0, 15).map((order) => (
            <div 
              key={order.id} 
              className="group flex items-center gap-2 px-2 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-all active:scale-[0.99]"
            >
              <div className="hidden xs:flex items-center gap-1.5 shrink-0 text-gray-300 pl-1">
                <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col w-20 sm:w-24 shrink-0">
                  <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter truncate ${
                    order.status === 'pending' ? 'text-amber-600' : 
                    order.status === 'delivered' ? 'text-emerald-600' : 
                    'text-blue-600'
                  }`}>
                    {order.status === 'pending' ? 'Bekliyor' : order.status === 'delivered' ? 'Teslim' : 'İşlemde'}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[11px] font-bold text-gray-400">#{order.order_number?.slice(0,6).toUpperCase()}</span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-gray-900 truncate text-[11px] sm:text-[13px]">{order.customer_name || 'Misafir'}</span>
                  <span className="text-[9px] text-gray-400 truncate opacity-60 hidden xs:inline">{format(new Date(order.rawDate), 'HH:mm • dd MMM', { locale: tr })}</span>
                </div>
                
                <div className="flex flex-col w-14 sm:w-24 shrink-0 text-right">
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tutar</span>
                  <span className="font-black text-gray-900 text-[11px] sm:text-[13px]">{order.total}</span>
                </div>
              </div>
              
              <div className="shrink-0 flex items-center pr-1 sm:pr-2">
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
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
