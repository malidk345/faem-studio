import React from 'react';
import { DataTable } from "../Theme/tasks/components/data-table";
import { 
  Plus, MoreHorizontal, FileSpreadsheet, Trash2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductsTabProps {
  products: any[];
  onAdd: () => void;
  onBulkImport: () => void;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string, isArchived: boolean) => void;
  onClearAll: () => void;
}

export function ProductsTab({ products, onAdd, onBulkImport, onEdit, onDelete, onArchive, onClearAll }: ProductsTabProps) {
  const columns = [
    {
      accessorKey: "name",
      header: "Ürün",
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
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-900 leading-tight">{row.original.name}</span>
              {row.original.is_archived && (
                <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                  Arşiv
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">#{row.original.id?.slice(0,8)}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "collection",
      header: "Koleksiyon",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: any) => (
        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-none font-semibold text-[10px] uppercase tracking-widest px-2 group-hover:bg-white">
          {row.getValue("collection") || '-'}
        </Badge>
      )
    },
    {
      accessorKey: "price",
      header: "Fiyat",
      meta: { className: "hidden sm:table-cell" },
      cell: ({ row }: any) => <span className="font-semibold text-sm text-zinc-900">{row.getValue("price")}</span>
    },
    {
      accessorKey: "stock_count",
      header: "Stok",
      meta: { className: "hidden sm:table-cell" },
      cell: ({ row }: any) => {
        const stock = row.getValue("stock_count") || 0;
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${stock > 5 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
            <span className={`text-[11px] font-medium ${stock > 5 ? 'text-zinc-600' : 'text-rose-600'}`}>
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
        <div className="flex items-center justify-end gap-2">
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-amber-600 hover:bg-amber-50"
            onClick={() => onArchive?.(row.original.id, !row.original.is_archived)}
           >
             {row.original.is_archived ? 'Arşivden Çıkar' : 'Arşive Al'}
           </Button>
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
      <div className="flex items-center justify-between mb-2">
        <div>
           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Envanter Yönetimi</h2>
           <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider mt-1">Mağaza Kataloğu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              if (window.confirm('Tüm kataloğu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                onClearAll();
              }
            }}
            variant="ghost"
            className="text-rose-500 hover:bg-rose-50 rounded-2xl px-4 sm:px-5 h-10 sm:h-11 font-semibold flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            <Trash2 size={16} strokeWidth={2.5} />
            <span className="hidden xs:inline">Temizle</span>
          </Button>
          <Button 
            onClick={onBulkImport}
            variant="outline"
            className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-2xl px-4 sm:px-5 h-10 sm:h-11 font-semibold flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            <FileSpreadsheet size={16} strokeWidth={2.5} className="text-emerald-600" />
            <span className="hidden xs:inline">Toplu Yükle</span>
            <span className="xs:hidden">Excel</span>
          </Button>
          <Button 
            onClick={onAdd}
            className="bg-black text-white hover:bg-zinc-800 rounded-2xl px-4 sm:px-5 h-10 sm:h-11 font-semibold flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-black/10 active:scale-95 transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden xs:inline">Yeni Ürün Ekle</span>
            <span className="xs:hidden">Ekle</span>
          </Button>
        </div>
      </div>

      <div className="apple-card overflow-hidden">
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
    <div className="p-4 sm:p-5 apple-card flex flex-col gap-1 sm:gap-1.5">
       <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-zinc-500">{title}</span>
       <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-semibold text-zinc-900 leading-none tracking-tight">{value}</span>
          <span className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-semibold uppercase ${colors[color]}`}>
            {color === 'emerald' ? 'Opt' : color === 'rose' ? 'Krit' : 'Sist'}
          </span>
       </div>
       <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium leading-none mt-1">{desc}</p>
    </div>
  );
}
