import React, { useState } from 'react';
import { DataTable } from "../Theme/tasks/components/data-table";
import { 
  ArrowUpRight, Clock, MoreHorizontal, Eye,
  CheckCircle2, Truck, Package, XCircle, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminOrder } from "@/hooks/useAdminData";
import { OrderDetailSheet } from "../Modals/OrderDetailSheet";

interface OrdersTabProps {
  orders: AdminOrder[];
  onUpdateStatus: (id: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Beklemede', icon: Clock, color: 'bg-amber-50 text-amber-600' },
  { value: 'processing', label: 'Hazırlanıyor', icon: Package, color: 'bg-blue-50 text-blue-600' },
  { value: 'shipped', label: 'Kargoda', icon: Truck, color: 'bg-indigo-50 text-indigo-600' },
  { value: 'delivered', label: 'Teslim Edildi', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  { value: 'cancelled', label: 'İptal Edildi', icon: XCircle, color: 'bg-rose-50 text-rose-600' },
];

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

export function OrdersTab({ orders, onUpdateStatus }: OrdersTabProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const activeOrder = orders.find(o => o.id === selectedOrderId) || null;

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalNumeric, 0);
  const formattedRevenue = new Intl.NumberFormat('tr-TR', { 
    style: 'currency', currency: 'USD', maximumFractionDigits: 0 
  }).format(totalRevenue);
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const openDetail = (order: AdminOrder) => {
    setSelectedOrderId(order.id);
    setDetailOpen(true);
  };

  const columns = [
    {
      accessorKey: "shortId",
      header: "Sipariş No",
      cell: ({ row }: any) => (
        <button onClick={() => openDetail(row.original)} className="flex flex-col text-left">
          <span className="font-bold text-xs text-zinc-900 leading-tight">#{row.original.shortId}</span>
          <span className="text-[9px] text-zinc-400 font-bold">{row.original.date}</span>
        </button>
      )
    },
    {
      accessorKey: "user",
      header: "Müşteri",
      cell: ({ row }: any) => (
        <button onClick={() => openDetail(row.original)} className="flex items-center gap-2 text-left">
          <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center font-black text-[9px] border uppercase">
            {row.original.user?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-zinc-900 leading-none mb-0.5">{row.original.user}</span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase">{row.original.isGuest ? 'Misafir' : 'Üye'}</span>
          </div>
        </button>
      )
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }: any) => {
        const statusInfo = getStatusInfo(row.original.status);
        return (
          <Badge variant="outline" className={`font-black text-[8px] uppercase tracking-widest border-none px-2 py-0.5 ${statusInfo.color}`}>
            {statusInfo.label}
          </Badge>
        )
      }
    },
    {
      accessorKey: "total",
      header: "Tutar",
      cell: ({ row }: any) => <span className="font-black text-xs text-zinc-900">{row.original.total}</span>
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDetail(row.original)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem 
                  key={opt.value}
                  className="cursor-pointer text-xs font-bold gap-2"
                  onClick={() => onUpdateStatus(row.original.id, opt.value)}
                >
                  <opt.icon className="h-3 w-3" /> {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Sales Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-black tracking-tighter text-zinc-900">Sipariş Yönetimi</h2>
           <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">Canlı Takip</p>
        </div>
      </div>

      {/* Performance Mini-Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-zinc-900 text-white rounded-2xl flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Toplam</span>
             <span className="text-xl font-black">{orders.length}</span>
          </div>
          <div className="p-4 bg-white border rounded-2xl flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Ciro</span>
             <span className="text-xl font-black">{formattedRevenue}</span>
          </div>
          <div className="p-4 bg-white border rounded-2xl flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Bekleyen</span>
             <span className={`text-xl font-black ${pendingCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{pendingCount}</span>
          </div>
          <div className="p-4 bg-white border rounded-2xl flex flex-col gap-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Teslim</span>
             <span className="text-xl font-black text-emerald-500">{deliveredCount}</span>
          </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
         <DataTable columns={columns} data={orders} searchKey="user" />
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
