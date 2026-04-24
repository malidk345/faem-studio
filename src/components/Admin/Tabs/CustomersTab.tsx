import React, { useMemo, useState } from 'react';
import { Users, Search, MoreHorizontal, Mail, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "../Theme/tasks/components/data-table";

interface CustomersTabProps {
  customers: any[];
  orders: any[];
}

export function CustomersTab({ customers, orders }: CustomersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedCustomers = useMemo(() => {
    // We can also extract guest customers from orders if they have an email but no user_id
    const guestEmails = new Set();
    const guestOrders = orders.filter(o => o.isGuest && o.email);
    
    const guests = guestOrders.reduce((acc: any[], order) => {
      if (!guestEmails.has(order.email)) {
        guestEmails.add(order.email);
        acc.push({
          id: `guest-${order.email}`,
          name: order.user || 'Misafir',
          email: order.email,
          role: 'guest',
          created_at: order.rawDate, // approximate join date based on first order
        });
      }
      return acc;
    }, []);

    const allUsers = [...customers, ...guests];

    return allUsers.map(user => {
      // Find orders for this user
      const userOrders = orders.filter(o => 
        (o.userId && o.userId === user.id) || 
        (!o.userId && o.email === user.email)
      );

      const totalSpent = userOrders.reduce((sum, o) => sum + o.totalNumeric, 0);
      const lastOrder = userOrders.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())[0];

      return {
        ...user,
        orderCount: userOrders.length,
        totalSpent,
        formattedTotalSpent: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalSpent),
        lastOrderDate: lastOrder ? new Date(lastOrder.rawDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, orders]);

  const totalRevenue = enrichedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const formattedRevenue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalRevenue);
  const activeCustomers = enrichedCustomers.filter(c => c.orderCount > 0).length;

  const columns = [
    {
      accessorKey: "name",
      header: "Müşteri",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center font-semibold text-xs text-zinc-600 shadow-sm border border-zinc-100 uppercase">
            {row.original.name?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-zinc-900 leading-none mb-1">{row.original.name || 'İsimsiz'}</span>
            <span className="text-[10px] text-zinc-500 font-medium">{row.original.email}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Kayıt Tipi",
      cell: ({ row }: any) => (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${row.original.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : row.original.role === 'guest' ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-600'}`}>
          {row.original.role === 'admin' ? 'Yönetici' : row.original.role === 'guest' ? 'Misafir' : 'Üye'}
        </span>
      )
    },
    {
      accessorKey: "orderCount",
      header: "Siparişler",
      cell: ({ row }: any) => <span className="font-medium text-sm text-zinc-700">{row.original.orderCount}</span>
    },
    {
      accessorKey: "totalSpent",
      header: "Toplam Harcama (LTV)",
      cell: ({ row }: any) => <span className="font-semibold text-sm text-zinc-900">{row.original.formattedTotalSpent}</span>
    },
    {
      accessorKey: "lastOrderDate",
      header: "Son Sipariş",
      cell: ({ row }: any) => <span className="text-xs font-medium text-zinc-500">{row.original.lastOrderDate}</span>
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Müşteriler</h2>
           <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider mt-1">Müşteri Veritabanı ve Sadakat Analizi</p>
        </div>
      </div>

      {/* Mini-Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-900 text-white rounded-[1.5rem] flex flex-col gap-1.5 shadow-lg shadow-zinc-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={64} /></div>
             <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 relative z-10">Toplam Müşteri</span>
             <span className="text-2xl sm:text-3xl font-semibold tracking-tight relative z-10">{enrichedCustomers.length}</span>
          </div>
          <div className="p-5 apple-card rounded-[1.5rem] flex flex-col gap-1.5">
             <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Aktif Alıcılar</span>
             <div className="flex items-end gap-3">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-600">{activeCustomers}</span>
                <span className="text-xs font-medium text-zinc-400 mb-1.5">%{(activeCustomers / (enrichedCustomers.length || 1) * 100).toFixed(0)} dönüşüm</span>
             </div>
          </div>
          <div className="p-5 apple-card rounded-[1.5rem] flex flex-col gap-1.5">
             <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Müşteri Başı Ortalama (AOV)</span>
             <div className="flex items-end gap-3">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight">{
                  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })
                    .format(activeCustomers > 0 ? totalRevenue / activeCustomers : 0)
                }</span>
             </div>
          </div>
      </div>

      <div className="apple-card overflow-hidden">
         <DataTable columns={columns} data={enrichedCustomers} searchKey="name" />
      </div>
    </div>
  );
}
