import React from 'react';
import { DataTable } from "../Theme/tasks/components/data-table";
import { 
  Plus, MoreHorizontal 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductsTabProps {
  products: any[];
  onAdd: () => void;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductsTab({ products, onAdd, onEdit, onDelete }: ProductsTabProps) {
  // Business Dashboard Pillars for DataTable
  const columns = [
    {
      accessorKey: "image",
      header: "Asset",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border">
            <img 
              src={row.original.image_url || row.original.image} 
              alt={row.original.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 leading-tight">{row.original.name}</span>
            <span className="text-[10px] text-zinc-400 font-mono">#{row.original.id?.slice(0,8)}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-none font-bold text-[10px] uppercase">
          {row.getValue("category")}
        </Badge>
      )
    },
    {
      accessorKey: "price",
      header: "Valuation",
      cell: ({ row }: any) => <span className="font-black text-zinc-900">{row.getValue("price")}</span>
    },
    {
      accessorKey: "stock_count",
      header: "Stock Level",
      cell: ({ row }: any) => {
        const stock = row.getValue("stock_count") || 0;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${stock > 5 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
            <span className={`font-bold ${stock > 5 ? 'text-zinc-600' : 'text-rose-600'}`}>
              {stock} units
            </span>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Management",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onEdit(row.original)}
           >
             <MoreHorizontal className="h-4 w-4" />
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-black tracking-tighter">Asset Management</h2>
           <p className="text-zinc-400 text-xs font-medium italic">Storefront inventory and digital assets.</p>
        </div>
        <Button 
          onClick={onAdd}
          className="bg-black text-white hover:bg-zinc-800 rounded-xl px-5 py-6 font-bold flex items-center gap-2 shadow-xl shadow-black/10 transition-all active:scale-95"
        >
          <Plus size={18} />
          Deploy New Asset
        </Button>
      </div>

      {/* The Enterprise DataTable */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
         <DataTable 
           columns={columns} 
           data={products} 
           searchKey="name"
         />
      </div>

      {/* Advanced Inventory Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <InventoryInsightCard 
          title="Warehouse Availability" 
          value={`${Math.round((products.filter(p => (p.stock_count || 0) > 0).length / Math.max(1, products.length)) * 100)}%`} 
          desc="Catalogue ready for delivery"
          color="emerald"
         />
         <InventoryInsightCard 
          title="Depletion Risk" 
          value={products.filter(p => (p.stock_count || 0) < 5).length.toString()} 
          desc="Items requiring replenishment"
          color="rose"
         />
         <InventoryInsightCard 
          title="Total SKU Identity" 
          value={products.length.toString()} 
          desc="Unique catalog references"
          color="zinc"
         />
      </div>
    </div>
  );
}

function InventoryInsightCard({ title, value, desc, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    zinc: 'bg-zinc-50 text-zinc-600 border-zinc-200'
  };
  
  return (
    <div className="p-6 bg-white border rounded-2xl flex flex-col gap-2">
       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-zinc-900">{value}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${colors[color]}`}>{color === 'emerald' ? 'Optimal' : color === 'rose' ? 'Critical' : 'System'}</span>
       </div>
       <p className="text-[10px] text-zinc-400 font-medium">{desc}</p>
    </div>
  );
}
