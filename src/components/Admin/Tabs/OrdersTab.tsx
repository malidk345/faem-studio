import React, { useState } from 'react';
import { 
  Clock, Package, Truck, XCircle, Search, Filter, 
  RotateCw, GripVertical, ChevronRight, ShoppingCart, CheckCircle
} from 'lucide-react';
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
      o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shortId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="flex flex-col gap-5 pb-20">
      {/* ── Page Header (More Compact) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-0.5">
           <h2 className="text-2xl font-black tracking-tight text-gray-900">Siparişler</h2>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Operasyonel Akış</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Toplam</span>
            <span className="text-sm font-black text-emerald-700">{orders.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Aktif</span>
            <span className="text-sm font-black text-gray-700">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</span>
          </div>
        </div>
      </div>

      {/* ── Compact Filter Pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5 px-1">
        {[
          { id: 'all', label: 'Hepsi', icon: ShoppingCart, count: orders.length },
          { id: 'pending', label: 'Bekleyen', icon: Clock, count: orders.filter(o => o.status === 'pending' || o.status === 'processing').length },
          { id: 'shipped', label: 'Kargoda', icon: Truck, count: orders.filter(o => o.status === 'shipped').length },
          { id: 'delivered', label: 'Tamamlanan', icon: CheckCircle, count: orders.filter(o => o.status === 'delivered').length },
        ].map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all whitespace-nowrap border ${
                isActive 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {filter.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Compact Orders Feed Container ── */}
      <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden flex flex-col shadow-sm min-h-[500px]">
        {/* Toolbar (Sleek) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex-1 max-w-sm flex items-center gap-2.5 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Ara..." 
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-1.5 ml-3">
            <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content (Tight) */}
        <div className="flex flex-col bg-white">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusInfo = STATUS_OPTIONS.find(s => s.value === order.status);
              return (
                <div 
                  key={order.id} 
                  onClick={() => openDetail(order)}
                  className="group flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50/80 transition-all active:scale-[0.998]"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-6">
                    {/* Status Indicator */}
                    <div className="flex flex-col w-20 sm:w-28 shrink-0">
                      <span className={`text-[9px] font-black uppercase tracking-tighter truncate ${statusInfo?.color || 'text-gray-500'}`}>
                        {statusInfo?.label || order.status}
                      </span>
                      <span className="font-mono text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors tracking-tighter">#{order.id?.slice(0,6).toUpperCase()}</span>
                    </div>

                    {/* Customer Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-gray-900 truncate text-[13px] tracking-tight">{order.user || 'Misafir'}</span>
                      <span className="text-[10px] text-gray-400 font-medium opacity-70">
                        {format(new Date(order.rawDate), 'HH:mm • dd MMM', { locale: tr })}
                      </span>
                    </div>
                    
                    {/* Total Amount */}
                    <div className="flex flex-col w-16 sm:w-24 shrink-0 text-right">
                      <span className="font-black text-gray-900 text-[13px] tracking-tighter">{order.total}</span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Tutar</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center opacity-30 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300">
              <ShoppingCart className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Sipariş Yok</p>
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
