import React, { useMemo, useState } from 'react';
import { 
  Users, Search, MoreHorizontal, Mail, MapPin, 
  ArrowUpRight, ArrowDownRight, ChevronDown, 
  RotateCw, MoreVertical, Square, GripVertical, 
  ChevronLeft, ChevronRight, UserCircle, ShoppingBag,
  TrendingUp, Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CustomersTabProps {
  customers: any[];
  orders: any[];
}

export function CustomersTab({ customers, orders }: CustomersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedCustomers = useMemo(() => {
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
          created_at: order.rawDate,
        });
      }
      return acc;
    }, []);

    const allUsers = [...customers, ...guests];

    return allUsers.map(user => {
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
        lastOrderDate: lastOrder ? new Date(lastOrder.rawDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '—',
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, orders]);

  const filteredCustomers = enrichedCustomers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = enrichedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const formattedRevenue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalRevenue);
  const activeCustomers = enrichedCustomers.filter(c => c.orderCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-gray-900">Müşteri Yönetimi</h2>
           <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Müşteri Veritabanı ve Sadakat</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-end">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Toplam Müşteri</span>
            <span className="text-lg font-bold text-emerald-700 leading-tight">{enrichedCustomers.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Dönüşüm</span>
            <span className="text-lg font-bold text-gray-700 leading-tight">%{(activeCustomers / (enrichedCustomers.length || 1) * 100).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
          <div className="w-12 h-12 flex items-center justify-center border border-emerald-100 rounded-lg shrink-0 text-emerald-600 bg-emerald-50">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase mb-0.5">Toplam Hacim (LTV)</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{formattedRevenue}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
          <div className="w-12 h-12 flex items-center justify-center border border-indigo-100 rounded-lg shrink-0 text-indigo-600 bg-indigo-50">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase mb-0.5">Aktif Alıcılar</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{activeCustomers} Müşteri Satın Aldı</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
          <div className="w-12 h-12 flex items-center justify-center border border-blue-100 rounded-lg shrink-0 text-blue-600 bg-blue-50">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase mb-0.5">Ortalama Harcama</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })
                .format(activeCustomers > 0 ? totalRevenue / activeCustomers : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Customers Feed Area */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col text-[13px] shadow-sm min-h-[500px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 text-gray-600 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
              <Square className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
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
                placeholder="Müşterilerde ara..." 
                className="bg-transparent border-none outline-none text-xs w-32 sm:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline">1-{Math.min(filteredCustomers.length, 16)} of {filteredCustomers.length}</span>
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

        {/* List View */}
        <div className="flex flex-col bg-white">
          {filteredCustomers.map((customer) => (
            <div 
              key={customer.id} 
              className="group flex items-center gap-4 px-3 py-3 border-b border-gray-100 cursor-pointer hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] hover:z-10 hover:bg-white transition-all"
            >
              <div className="flex items-center gap-1.5 shrink-0 text-gray-300">
                <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Square className="w-4 h-4 hover:text-gray-600 opacity-60" />
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-gray-500 uppercase">{customer.name?.charAt(0) || '?'}</span>
              </div>
              
              <div className="flex-1 truncate flex items-center gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-gray-900 truncate">{customer.name || 'İsimsiz'}</span>
                  <span className="text-[10px] text-gray-400 font-medium truncate">{customer.email}</span>
                </div>
                
                <div className="hidden md:flex flex-col w-24 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tip</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${customer.role === 'admin' ? 'text-indigo-600' : customer.role === 'guest' ? 'text-gray-400' : 'text-emerald-600'}`}>
                    {customer.role === 'admin' ? 'Yönetici' : customer.role === 'guest' ? 'Misafir' : 'Üye'}
                  </span>
                </div>
                
                <div className="hidden sm:flex flex-col w-24 shrink-0 text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sipariş</span>
                  <span className="font-bold text-gray-900">{customer.orderCount}</span>
                </div>

                <div className="hidden lg:flex flex-col w-32 shrink-0 text-right mr-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">LTV</span>
                  <span className="font-bold text-gray-900 text-emerald-600">{customer.formattedTotalSpent}</span>
                </div>
              </div>
              
              <div className="shrink-0 w-20 text-right text-[11px] font-bold text-gray-400 group-hover:hidden uppercase tracking-tighter">
                {customer.lastOrderDate}
              </div>
              
              <div className="shrink-0 flex items-center gap-3 text-gray-400 hidden group-hover:flex pr-2">
                <Mail className="w-4 h-4 hover:text-blue-600 transition-colors" />
                <UserCircle className="w-4 h-4 hover:text-gray-900 transition-colors" />
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <Users className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm font-medium">Müşteri bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
