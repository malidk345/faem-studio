import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, TrendingUp, Users, ShoppingCart, ArrowUpRight } from 'lucide-react';

interface DashboardTabProps {
  orders: any[];
  products: any[];
}

export function DashboardTab({ orders, products }: DashboardTabProps) {
  return (
    <div className="space-y-6 md:space-y-12">
      {/* KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Toplam Ciro" value="68.450 ₺" trend="+14.5%" trendUp icon={<TrendingUp size={20} />} />
        <KpiCard title="Aktif Sipariş" value={orders.length.toString()} trend="+2.4%" trendUp icon={<ShoppingCart size={20} />} />
        <KpiCard title="Ziyaretçi" value="8.405" trend="-1.2%" trendUp={false} icon={<Users size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SON SİPARİŞLER */}
        <div className="lg:col-span-2 bg-white border border-black/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.01] rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-black/5 transition-colors duration-1000" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-black tracking-tight">Son Siparişler</h2>
              <p className="text-[10px] uppercase font-bold text-black/30 tracking-widest mt-1">Gerçek Zamanlı Takİp</p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              Tümünü Gör <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto hide-scrollbar -mx-6 md:mx-0 px-6 md:px-0 relative z-10">
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-black/30 border-b border-black/5">
                  <th className="pb-4 font-black">Sipariş</th>
                  <th className="pb-4 font-black">Müşteri</th>
                  <th className="pb-4 font-black">Durum</th>
                  <th className="pb-4 font-black text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.slice(0, 5).map((o, i) => (
                  <tr key={i} className="group/row">
                    <td className="py-5 font-bold tracking-tight group-hover/row:translate-x-1 transition-transform">{o.id}</td>
                    <td className="py-5 text-black/60 font-medium">{o.user}</td>
                    <td className="py-5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-5 text-right font-black">{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EN ÇOK SATANLAR */}
        <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black/20 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-black tracking-tight mb-2">En Çok Satanlar</h2>
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-8">Koleksiyon Performansı</p>
            
            <div className="space-y-6">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="flex gap-4 items-center group/item cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl w-14 h-14 bg-white/5 flex-shrink-0">
                    <img src={p.image_url || p.image} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight truncate">{p.name}</p>
                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-bold">{p.category} · {p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
              <button className="w-full py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all">Stok Analizi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, trendUp, icon }: any) {
  return (
    <div className="bg-white border border-black/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-500">
                {icon}
            </div>
            <span className={`text-[11px] font-black tracking-tighter px-2 py-1 rounded-lg ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {trend}
            </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/30 font-bold mb-1">{title}</p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
      </div>
      
      {/* Background Graphic */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black/[0.01] rounded-full group-hover:scale-150 transition-transform duration-1000" />
    </div>
  )
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
