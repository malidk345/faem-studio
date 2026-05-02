import React, { useState } from 'react';
import { 
  Plus, MoreHorizontal, FileSpreadsheet, Trash2,
  Search, ChevronDown, RotateCw, MoreVertical,
  Square, GripVertical, Package, ChevronLeft,
  ChevronRight, ArrowUpRight, BarChart3, AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-gray-900">Envanter Yönetimi</h2>
           <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Mağaza Kataloğu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              if (window.confirm('Tüm kataloğu silmek istediğinize emin misiniz?')) {
                onClearAll();
              }
            }}
            variant="ghost"
            className="text-rose-500 hover:bg-rose-50 rounded-lg px-4 font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline ml-2">Temizle</span>
          </Button>
          <Button 
            onClick={onBulkImport}
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span className="hidden sm:inline">Toplu Yükle</span>
          </Button>
          <Button 
            onClick={onAdd}
            className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Yeni Ürün</span>
          </Button>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
          <div className="w-12 h-12 flex items-center justify-center border border-emerald-100 rounded-lg shrink-0 text-emerald-600 bg-emerald-50">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase mb-0.5">Toplam SKU</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{products.length} Benzersiz Ürün</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
          <div className="w-12 h-12 flex items-center justify-center border border-amber-100 rounded-lg shrink-0 text-amber-600 bg-amber-50">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase mb-0.5">Kritik Stok</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{products.filter(p => (p.stock_count || 0) < 5).length} Ürün Azalıyor</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
          <div className="w-12 h-12 flex items-center justify-center border border-blue-100 rounded-lg shrink-0 text-blue-600 bg-blue-50">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.1em] text-gray-500 uppercase mb-0.5">Stok Durumu</span>
            <span className="text-lg font-bold text-gray-900 leading-tight">{products.filter(p => (p.stock_count || 0) > 0).length} Satışta</span>
          </div>
        </div>
      </div>

      {/* Products Feed Area */}
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
                placeholder="Ürünlerde ara..." 
                className="bg-transparent border-none outline-none text-xs w-32 sm:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline">1-{Math.min(filteredProducts.length, 16)} of {filteredProducts.length}</span>
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
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              onClick={() => onEdit(product)}
              className="group flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-3 border-b border-gray-100 cursor-pointer hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] hover:z-10 hover:bg-white transition-all"
            >
              <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-gray-300">
                <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Square className="w-4 h-4 hover:text-gray-600 opacity-60" onClick={(e) => e.stopPropagation()} />
              </div>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                <img 
                  src={product.image_url || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="flex-1 truncate flex items-center gap-3 sm:gap-6">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-gray-900 truncate text-[12px] sm:text-[14px]">{product.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: #{product.id?.slice(0,8).toUpperCase()}</span>
                </div>
                
                <div className="flex flex-col w-20 sm:w-32 shrink-0">
                  <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Koleksiyon</span>
                  <span className="text-[11px] sm:text-[13px] font-medium text-gray-700 truncate">{product.collection || '—'}</span>
                </div>
                
                <div className="flex flex-col w-14 sm:w-28 shrink-0 text-right">
                  <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Fiyat</span>
                  <span className="text-[11px] sm:text-[14px] font-black text-gray-900">{product.price}</span>
                </div>
 
                <div className="flex flex-col w-12 sm:w-24 shrink-0 text-right">
                  <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Stok</span>
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${(product.stock_count || 0) > 5 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                    <span className="text-[11px] sm:text-[14px] font-black text-gray-900">{product.stock_count || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 flex items-center gap-2 pr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 hidden group-hover:flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.(product.id, !product.is_archived);
                  }}
                >
                  {product.is_archived ? 'Yayına Al' : 'Arşivle'}
                </Button>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <Package className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm font-medium">Aranan kriterlere uygun ürün bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
