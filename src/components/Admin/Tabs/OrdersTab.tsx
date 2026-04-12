import React from 'react';
import { DataTable } from "../Theme/tasks/components/data-table";
import { 
  ShoppingBag, Search, Filter, ArrowUpRight, Clock, MapPin, MoreHorizontal 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrdersTabProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export function OrdersTab({ orders, onUpdateStatus }: OrdersTabProps) {
  // Business Columns for Sales Management
  const columns = [
    {
      accessorKey: "id",
      header: "Invoice",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 leading-tight">#{row.getValue("id")?.slice(0, 8)}</span>
          <span className="text-[10px] text-zinc-400 font-medium">Digital Receipt</span>
        </div>
      )
    },
    {
      accessorKey: "user",
      header: "Strategic Client",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-[10px] border border-zinc-200 uppercase">
            {row.original.user?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 border-none">{row.original.user}</span>
            <span className="text-[10px] text-zinc-400">Prime Customer</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Fulfillment Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge 
            variant="outline" 
            className={`font-bold text-[9px] uppercase tracking-widest border-none px-3 py-1 ${
              status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
              status === 'pending' || status === 'beklemede' ? 'bg-amber-50 text-amber-600' : 
              'bg-blue-50 text-blue-600'
            }`}
          >
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: "total",
      header: "Transaction Value",
      cell: ({ row }: any) => <span className="font-black text-zinc-900">{row.getValue("total")}</span>
    },
    {
      id: "actions",
      header: "Audit",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
             <ArrowUpRight className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
             <MoreHorizontal className="h-4 w-4" />
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sales Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900">Revenue Stream</h2>
           <p className="text-zinc-400 text-xs font-medium">Monitor real-time sales performance and order lifecycle.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-2 py-6">
                <MapPin size={16} /> Regional Performance
            </Button>
            <Button className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold flex items-center justify-center gap-2 py-6 shadow-lg">
                <ShoppingBag size={16} /> New Sale Entry
            </Button>
        </div>
      </div>

      {/* The Enterprise DataTable for Orders */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
         <DataTable 
           columns={columns} 
           data={orders} 
           searchKey="user"
         />
      </div>

      {/* Sales Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-zinc-900 text-white rounded-3xl flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Sales Velocity</span>
                <Clock size={16} className="text-zinc-500" />
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{orders.length}</span>
                <span className="text-zinc-500 font-bold text-xs">Total Orders this Period</span>
             </div>
          </div>
          <div className="p-6 bg-white border rounded-3xl flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Strategic Revenue</span>
                <ArrowUpRight size={16} className="text-zinc-400" />
             </div>
             <div className="flex items-baseline gap-2 text-zinc-900">
                <span className="text-4xl font-black">2.4M₺</span>
                <span className="text-emerald-500 font-bold text-xs">+12.4% vs Previous</span>
             </div>
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
