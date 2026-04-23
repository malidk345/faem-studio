import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  refreshData: () => void;
}

export function BulkImportModal({ isOpen, onClose, onSuccess, refreshData }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(json.slice(0, 5)); // Show first 5 rows
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          if (!json || json.length === 0) throw new Error("Excel dosyası boş veya okunamadı.");

          const normalize = (str: string) => str?.toString().toLowerCase().trim()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c') || '';

          const findValue = (row: any, keys: string[]) => {
            const rowKeys = Object.keys(row);
            const normalizedKeys = keys.map(normalize);
            const foundKey = rowKeys.find(rk => normalizedKeys.includes(normalize(rk)));
            return foundKey ? row[foundKey] : null;
          };

          const formatPrice = (val: any) => {
            if (!val) return '0 ₺';
            const str = val.toString().replace(/[^\d.,]/g, '').replace(',', '.');
            return `${str} ₺`;
          };

          const groupedProducts: Record<string, any> = {};

          json.forEach((row: any, index: number) => {
            const getVal = (keys: string[]) => findValue(row, keys);
            const modelCode = getVal(['model kodu', 'urun grubu', 'stok kodu', 'product id']) || getVal(['urun adi']);
            const color = getVal(['urun rengi', 'renk', 'color', 'colour']) || '';
            if (!modelCode) return;

            const groupingKey = `${modelCode}_${color}`;
            const size = getVal(['beden', 'boyut', 'size']) || '';
            const stock = parseInt(getVal(['urun stok adedi', 'stok', 'stock', 'adet', 'inventory']) || '0');

            if (!groupedProducts[groupingKey]) {
              const rowKeys = Object.keys(row);
              const imageCols = rowKeys.filter(rk => {
                const n = normalize(rk);
                return n.includes('gorsel') || n.includes('resim') || n.includes('image');
              }).sort((a, b) => (parseInt(a.match(/\d+/)?.[0] || '999') - parseInt(b.match(/\d+/)?.[0] || '999')));

              groupedProducts[groupingKey] = {
                name: getVal(['urun adi', 'isim', 'title', 'name']) || `Ürün #${index + 1}`,
                price: formatPrice(getVal(['trendyol\'da satilacak fiyat (kdv dahil)', 'fiyat', 'price', 'tutar', 'satis'])),
                category: getVal(['kategori ismi', 'kategori', 'category', 'tur', 'segment']) || '',
                collection: getVal(['koleksiyon', 'collection', 'marka', 'brand']) || '',
                description: getVal(['urun aciklamasi', 'aciklama', 'description', 'detay']) || '',
                image_url: imageCols.length > 0 ? row[imageCols[0]] : '',
                images: imageCols.slice(1).map(col => row[col]).filter(url => url && url.toString().startsWith('http')),
                color,
                stock_count: 0,
                sizes: [],
                features: [],
                metadata: row
              };
            }

            if (size && !groupedProducts[groupingKey].sizes.includes(size)) {
              groupedProducts[groupingKey].sizes.push(size);
            }
            groupedProducts[groupingKey].stock_count += stock;
          });

          const productsToInsert = Object.values(groupedProducts).map(p => {
            const finalFeatures = [...(p.features || [])];
            if (p.color && !finalFeatures.includes(`Renk: ${p.color}`)) {
              finalFeatures.push(`Renk: ${p.color}`);
            }
            return {
              name: p.name,
              price: p.price,
              category: p.category,
              collection: p.collection,
              description: p.description,
              image_url: p.image_url,
              images: p.images,
              sizes: p.sizes,
              stock_count: isNaN(p.stock_count) ? 0 : p.stock_count,
              features: finalFeatures
              // Omit color and metadata to prevent Supabase schema errors
            };
          });

          if (productsToInsert.length === 0) throw new Error("Geçerli ürün bulunamadı.");

          const uniqueCats = [...new Set(productsToInsert.map(p => p.category))].filter(Boolean);
          const uniqueColls = [...new Set(productsToInsert.map(p => p.collection))].filter(Boolean);
          
          const { data: exCats } = await supabase.from('categories').select('name');
          const exCatNames = exCats?.map(c => c.name) || [];
          const newCats = uniqueCats.filter(c => !exCatNames.includes(c)).map(name => ({ name }));
          if (newCats.length > 0) await supabase.from('categories').insert(newCats);

          const { data: exColls } = await supabase.from('collections').select('name');
          const exCollNames = exColls?.map(c => c.name) || [];
          const newColls = uniqueColls.filter(c => !exCollNames.includes(c)).map(name => ({ name }));
          if (newColls.length > 0) await supabase.from('collections').insert(newColls);

          const { error } = await supabase.from('products').insert(productsToInsert);
          if (error) throw error;

          toast.success(`${productsToInsert.length} ürün işlendi.`);
          refreshData();
          onSuccess();
          onClose();
        } catch (err: any) {
          console.error("Supabase Import Error:", err);
          const errMsg = err.message || JSON.stringify(err);
          toast.error("Hata: " + errMsg, { duration: 10000 });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("General Import Error:", error);
      const errMsg = error.message || JSON.stringify(error);
      toast.error('Genel Hata: ' + errMsg, { duration: 10000 });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-[2rem] border-zinc-100 p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900">Toplu Ürün İçe Aktar</DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium">
            Excel (.xlsx, .xls) dosyanızı yükleyerek ürünlerinizi toplu olarak ekleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
                isDragActive 
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' 
                : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'
              }`}
              onClick={() => document.getElementById('excel-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
                  handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                } else {
                  toast.error('Lütfen geçerli bir Excel dosyası yükleyin.');
                }
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="text-emerald-500 w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900 text-sm">Excel dosyasını buraya sürükleyin</p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">Veya tıklayıp seçin</p>
              </div>
              <input 
                id="excel-upload" 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <FileSpreadsheet className="text-emerald-500 w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{file.name}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Dosya Hazır</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {setFile(null); setPreviewData([]);}}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                >
                  Değiştir
                </Button>
              </div>

              {previewData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-normal uppercase tracking-[0.15em] px-2 py-0.5 glass-nav border-0 text-white/40 rounded-[1px] font-['Handjet',sans-serif] backdrop-blur-md">
                      {product.collection || (product.category !== 'Genel' ? product.category : '')}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {Object.keys(previewData[0]).length} Sütun Tespit Edildi
                    </span>
                  </div>
                  <div className="border rounded-2xl overflow-x-auto bg-white shadow-sm">
                    <table className="w-full text-[10px] sm:text-[11px]">
                      <thead className="bg-zinc-50 border-b">
                        <tr>
                          {Object.keys(previewData[0]).slice(0, 5).map((key) => (
                            <th key={key} className="px-3 py-2 text-left font-bold text-zinc-500 whitespace-nowrap">
                              {key}
                            </th>
                          ))}
                          {Object.keys(previewData[0]).length > 5 && (
                            <th className="px-3 py-2 text-left font-bold text-zinc-400 italic">...</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {previewData.map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                            {Object.keys(row).slice(0, 5).map((key) => (
                              <td key={key} className="px-3 py-2 text-zinc-700 font-medium whitespace-nowrap">
                                {row[key]?.toString() || '-'}
                              </td>
                            ))}
                            {Object.keys(row).length > 5 && (
                              <td className="px-3 py-2 text-zinc-300">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[9px] text-zinc-400 italic ml-1">
                    Sistem bu sütunları otomatik olarak eşleştirecektir. Eğer veriler yukarıda görünüyorsa yükleme başarılı olacaktır.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-blue-900">İpucu: Sütun Başlıkları</p>
                  <p className="text-[10px] text-blue-700 leading-normal">
                    Dosyanızda 'name', 'price', 'category', 'description' ve 'image_url' (veya Türkçe karşılıkları) sütunları bulunmalıdır.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="rounded-xl font-semibold text-xs uppercase tracking-widest"
          >
            İptal
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || loading}
            className="bg-black text-white hover:bg-zinc-800 rounded-xl px-8 font-semibold text-xs uppercase tracking-widest min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                İçe Aktar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
