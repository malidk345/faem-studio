import React from 'react';
import { ShoppingBag, Search, Filter, ArrowUpRight, Clock, MapPin } from 'lucide-react';

interface OrdersTabProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export function OrdersTab({ orders, onUpdateStatus }: OrdersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <FilterButton label="Tümü" active />
          <FilterButton label="Bekleyen" />
          <FilterButton label="Hazırlanıyor" />
          <FilterButton label="Tamamlanan" />
        </div>
        
        <div className="relative group w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors" />
          <input 
              type="text" 
              placeholder="Sipariş veya Müşteri No..." 
              className="pl-11 pr-6 py-3 bg-black/[0.03] border border-transparent rounded-2xl text-xs font-bold focus:outline-none focus:bg-white focus:border-black/10 transition-all w-full"
          />
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-black/[0.01] border-b border-black/5">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Sipariş Bilgisi</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Müşteri</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-center">Ürünler</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30">Durum</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-right">Tutar</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-black/30 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-black/[0.01] transition-colors group/row cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="font-black tracking-tighter text-base">#{o.id}</span>
                        <div className="flex items-center gap-2 text-[10px] text-black/30 font-bold uppercase tracking-widest mt-1">
                            <Clock size={10} />
                            {o.date}
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center font-black text-[10px]">{o.user.charAt(0)}</div>
                        <span className="font-bold text-black/70">{o.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[10px] font-black bg-black/5 px-2.5 py-1 rounded-lg">{o.items} Adet</span>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={o.status} 
                      onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                      className={`text-[9px] uppercase font-black tracking-[0.15em] px-3 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/20 ${
                        o.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : 
                        o.status === 'pending' || o.status === 'beklemede' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 font-black text-right tracking-tight text-base">{o.total}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl bg-black/5 hover:bg-black hover:text-white transition-all opacity-0 group-hover/row:opacity-100">
                        <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    beklemede: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    kargolandi: 'bg-blue-50 text-blue-700 border-blue-100',
    shipped: 'bg-blue-50 text-blue-700 border-blue-100',
    teslim_edildi: 'bg-green-50 text-green-700 border-green-100',
    delivered: 'bg-green-50 text-green-700 border-green-100',
  };
  return (
    <span className={`text-[9px] uppercase font-black tracking-[0.15em] px-3 py-1.5 rounded-full border ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function FilterButton({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-black/40 hover:bg-black/5 hover:text-black'
    }`}>
      {label}
    </button>
  )
}
