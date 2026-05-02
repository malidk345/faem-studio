import React, { useState } from 'react';
import { 
  ArrowUpRight, Clock, MoreHorizontal, Eye,
  CheckCircle2, Truck, Package, XCircle, RefreshCw,
  Search, Filter, ArrowDownWideZap, ChevronDown,
  RotateCw, MoreVertical, Square, GripVertical,
  CheckCircle, ChevronLeft, ChevronRight, ShoppingCart,
  Keyboard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { AdminOrder } from "@/hooks/useAdminData";
import { OrderDetailSheet } from "../Modals/OrderDetailSheet";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OrdersTabProps {
  orders: AdminOrder[];
  onUpdateStatus: (id: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Beklemede', icon: Clock, color: 'text-amber-600' },
  { value: 'processing', label: 'Hazırlanıyor', icon: Package, color: 'text-blue-600' },
  { value: 'shipped', label: 'Kargoda', icon: Truck, color: 'text-indigo-600' },
  { value: 'delivered', label: 'Teslim Edildi', icon: CheckCircle, color: 'text-emerald-600' },
  { value: 'cancelled', label: 'İptal Edildi', icon: XCircle, color: 'text-red-500' },
];

export function OrdersTab({ orders, onUpdateStatus }: OrdersTabProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activeOrder = orders.find(o => o.id === selectedOrderId) || null;

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return o.status === 'pending' || o.status === 'processing';
    if (activeFilter === 'shipped') return o.status === 'shipped';
    if (activeFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const openDetail = (order: AdminOrder) => {
    setSelectedOrderId(order.id);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Sipariş Yönetimi</h2>
           <p className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Operasyonel Akış ve Lojistik</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 sm:px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-end shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-tighter">Toplam</span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 leading-tight">{orders.length}</span>
          </div>
          <div className="px-3 sm:px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-end shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Aktif</span>
            <span className="text-base sm:text-lg font-bold text-gray-700 leading-tight">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</span>
          </div>
        </div>
      </div>

      {/* Orders Feed Area */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col text-[14px] shadow-sm min-h-[500px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-gray-200 text-gray-600 bg-white">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
              <Square className="w-4 h-4" />
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors" title="Yenile">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-2 sm:gap-4 text-sm font-medium">
            <div className="flex flex-1 sm:flex-none items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Siparişlerde ara..." 
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full sm:w-48 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden xs:flex items-center gap-1">
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronLeft className="w-4.5 h-4.5 text-gray-400" />
              </div>
              <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Filtering */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-4 py-3.5 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'all' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-bold uppercase tracking-tight text-[11px] sm:text-xs">Hepsi</span>
          </button>
          <button 
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-2 px-4 py-3.5 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'pending' ? 'border-amber-500 text-amber-600 bg-amber-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-tight text-[11px] sm:text-xs">Bekleyen</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
              </span>
            </div>
          </button>
          <button 
            onClick={() => setActiveFilter('shipped')}
            className={`flex items-center gap-2 px-4 py-3.5 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'shipped' ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="font-bold uppercase tracking-tight text-[11px] sm:text-xs">Kargo</span>
          </button>
          <button 
            onClick={() => setActiveFilter('delivered')}
            className={`flex items-center gap-2 px-4 py-3.5 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'delivered' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-bold uppercase tracking-tight text-[11px] sm:text-xs">Tamam</span>
          </button>
        </div>

        {/* List View */}
        <div className="flex flex-col bg-white">
          {filteredOrders.map((order) => {
            const statusInfo = STATUS_OPTIONS.find(s => s.value === order.status);
            return (
              <div 
                key={order.id} 
                onClick={() => openDetail(order)}
                className="group flex items-center gap-3 px-3 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-all active:scale-[0.995]"
              >
                <div className="hidden xs:flex items-center gap-2 shrink-0 text-gray-300 pl-1">
                  <GripVertical className="w-4.5 h-4.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-6">
                  <div className="flex flex-col w-24 sm:w-28 shrink-0">
                    <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tighter truncate ${statusInfo?.color || 'text-gray-500'}`}>
                      {statusInfo?.label || order.status}
                    </span>
                    <span className="font-mono text-[10px] sm:text-[12px] font-bold text-gray-400">#{order.id?.slice(0,8).toUpperCase()}</span>
                  </div>
 
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-gray-900 truncate text-[12px] sm:text-[14px]">{order.user || 'Misafir'}</span>
                    <span className="text-[10px] text-gray-400 truncate opacity-70 hidden xs:inline">{format(new Date(order.rawDate), 'HH:mm • dd MMMM yyyy', { locale: tr })}</span>
                  </div>
                  
                  <div className="flex flex-col w-16 sm:w-32 shrink-0 text-right">
                    <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Toplam Tutar</span>
                    <span className="font-black text-gray-900 text-[12px] sm:text-[15px]">{order.total}</span>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center pr-1 sm:pr-2">
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 italic">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm font-medium">Bu kriterlere uygun sipariş bulunmuyor</p>
            </div>
          )}
        </div>
      </div>

      <OrderDetailSheet
        order={activeOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
