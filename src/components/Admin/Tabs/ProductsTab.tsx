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
  const columns = [
    {
      accessorKey: "image",
      header: "Varlık",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 overflow-hidden border">
            <img 
              src={row.original.image_url || row.original.image} 
              alt={row.original.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-zinc-900 leading-tight">{row.original.name}</span>
            <span className="text-[9px] text-zinc-400 font-mono">#{row.original.id?.slice(0,8)}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }: any) => (
        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-none font-black text-[8px] uppercase tracking-widest px-2 group-hover:bg-white">
          {row.getValue("category")}
        </Badge>
      )
    },
    {
      accessorKey: "price",
      header: "Fiyat",
      cell: ({ row }: any) => <span className="font-black text-xs text-zinc-900">{row.getValue("price")}</span>
    },
    {
      accessorKey: "stock_count",
      header: "Stok",
      cell: ({ row }: any) => {
        const stock = row.getValue("stock_count") || 0;
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${stock > 5 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
            <span className={`text-[10px] font-bold ${stock > 5 ? 'text-zinc-600' : 'text-rose-600'}`}>
              {stock} adet
            </span>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end">
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => onEdit(row.original)}
           >
             <MoreHorizontal className="h-3.5 w-3.5" />
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Strategic Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-black tracking-tighter">Envanter Yönetimi</h2>
           <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">Mağaza Kataloğu</p>
        </div>
        <Button 
          onClick={onAdd}
          className="bg-black text-white hover:bg-zinc-800 rounded-xl px-4 h-10 font-bold flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-xl shadow-black/10"
        >
          <Plus size={14} />
          Yeni Ürün Ekle
        </Button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
         <DataTable columns={columns} data={products} searchKey="name" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         <InventoryInsightCard 
          title="Stok Verimi" 
          value={`${Math.round((products.filter(p => (p.stock_count || 0) > 0).length / Math.max(1, products.length)) * 100)}%`} 
          desc="Teslimata hazır katalog"
          color="emerald"
         />
         <InventoryInsightCard 
          title="Kritik Stok" 
          value={products.filter(p => (p.stock_count || 0) < 5).length.toString()} 
          desc="Yenilenmesi gerekenler"
          color="rose"
         />
         <div className="hidden md:block">
           <InventoryInsightCard 
            title="Toplam SKU" 
            value={products.length.toString()} 
            desc="Benzersiz ürün referansı"
            color="zinc"
           />
         </div>
      </div>
    </div>
  );
}

function InventoryInsightCard({ title, value, desc, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-none',
    rose: 'bg-rose-50 text-rose-600 border-none',
    zinc: 'bg-zinc-50 text-zinc-600 border-none'
  };
  
  return (
    <div className="p-4 bg-white border rounded-2xl flex flex-col gap-1">
       <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-zinc-900">{value}</span>
          <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase ${colors[color]}`}>
            {color === 'emerald' ? 'Optimal' : color === 'rose' ? 'Kritik' : 'Sistem'}
          </span>
       </div>
       <p className="text-[9px] text-zinc-400 font-bold leading-none">{desc}</p>
    </div>
  );
}
