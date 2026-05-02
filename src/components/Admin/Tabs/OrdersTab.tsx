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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sipariş Yönetimi</h2>
           <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Operasyonel Akış ve Lojistik</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-end">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Toplam Sipariş</span>
            <span className="text-lg font-bold text-emerald-700 leading-tight">{orders.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Aktif İşlem</span>
            <span className="text-lg font-bold text-gray-700 leading-tight">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</span>
          </div>
        </div>
      </div>

      {/* Orders Feed Area */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col text-[13px] shadow-sm min-h-[500px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 text-gray-600 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
              <Square className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors" title="Yenile">
              <RotateCw className="w-4 h-4" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Siparişlerde ara..." 
                className="bg-transparent border-none outline-none text-xs w-32 sm:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline">1-{Math.min(filteredOrders.length, 16)} of {filteredOrders.length}</span>
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

        {/* Tabs for Filtering */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-3 px-4 py-3 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'all' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-bold uppercase tracking-tight text-xs">Tüm Siparişler</span>
          </button>
          <button 
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-3 px-4 py-3 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'pending' ? 'border-amber-500 text-amber-600 bg-amber-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-tight text-xs">Bekleyenler</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
              </span>
            </div>
          </button>
          <button 
            onClick={() => setActiveFilter('shipped')}
            className={`flex items-center gap-3 px-4 py-3 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'shipped' ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="font-bold uppercase tracking-tight text-xs">Kargodakiler</span>
          </button>
          <button 
            onClick={() => setActiveFilter('delivered')}
            className={`flex items-center gap-3 px-4 py-3 min-w-max cursor-pointer transition-all border-b-2 ${
              activeFilter === 'delivered' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-bold uppercase tracking-tight text-xs">Tamamlananlar</span>
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
                className="group flex items-center gap-2 px-2 py-2.5 border-b border-gray-100 cursor-pointer hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0,0_1px_3px_1px_rgba(60,64,67,.15)] hover:z-10 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-1.5 shrink-0 text-gray-400 pl-1">
                  <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Square className="w-4 h-4 hover:text-gray-600 opacity-60" onClick={(e) => e.stopPropagation()} />
                </div>
                
                <div className={`w-24 shrink-0 truncate text-[10px] font-bold uppercase tracking-wider ${statusInfo?.color || 'text-gray-500'}`}>
                  {statusInfo?.label || order.status}
                </div>
                
                <div className="flex-1 truncate flex items-center gap-2">
                  <span className="font-bold text-gray-900 w-[90px] shrink-0 font-mono text-[11px]">#{order.order_number}</span>
                  <span className="font-medium text-gray-700 w-[120px] shrink-0 truncate">{order.customer_name || 'Misafir'}</span>
                  
                  <span className="font-bold text-gray-900 shrink-0 hidden md:inline w-[100px] text-right">{order.total}</span>
                  
                  <span className="text-gray-300 hidden sm:inline">-</span>
                  <span className="text-gray-500 truncate hidden lg:inline text-xs">{order.items?.map(i => i.product_name).join(', ')}</span>
                </div>
                
                <div className="shrink-0 w-16 sm:w-20 text-right text-[11px] font-bold text-gray-400 group-hover:hidden uppercase tracking-tighter">
                  {format(new Date(order.rawDate), 'HH:mm')}
                </div>
                
                <div className="shrink-0 items-center gap-3 text-gray-500 hidden group-hover:flex pr-2">
                  <Package className="w-4 h-4 hover:text-gray-900 transition-colors" />
                  <Truck className="w-4 h-4 hover:text-gray-900 transition-colors" />
                  <CheckCircle className="w-4 h-4 hover:text-gray-900 transition-colors" />
                  <Eye className="w-4 h-4 hover:text-gray-900 transition-colors" />
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
