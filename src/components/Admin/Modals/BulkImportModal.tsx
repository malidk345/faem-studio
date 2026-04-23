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
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Helper to find a value by checking multiple possible column names (case-insensitive)
        const findValue = (row: any, keys: string[]) => {
          const rowKeys = Object.keys(row);
          for (const key of keys) {
            const foundKey = rowKeys.find(rk => 
              rk.toLowerCase().trim().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c') === 
              key.toLowerCase().trim().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            );
            if (foundKey) return row[foundKey];
          }
          return null;
        };

        const formatPrice = (val: any) => {
          if (!val) return '0 ₺';
          const str = val.toString().replace(/[^\d.,]/g, '').replace(',', '.');
          return `${str} ₺`;
        };

        // Map data to match Supabase schema with improved detection
        const productsToInsert = json.map((row, index) => {
          try {
            const rowKeys = Object.keys(row);
            const getVal = (keys: string[]) => findValue(row, keys);

            // Normalize function for flexible key matching
            const normalize = (str: string) => str.toLowerCase().trim()
              .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
              .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');

            // 1. Handle Images with full normalization
            const imageCols = rowKeys.filter(rk => {
              const n = normalize(rk);
              return n.includes('gorsel') || n.includes('resim') || n.includes('image') || n.includes('foto');
            }).sort((a, b) => {
              const numA = parseInt(a.match(/\d+/)?.[0] || '999');
              const numB = parseInt(b.match(/\d+/)?.[0] || '999');
              return numA - numB;
            });

            const primaryImage = imageCols.length > 0 ? row[imageCols[0]] : '';
            const galleryImages = imageCols.slice(1)
              .map(col => ({ 
                id: Math.random().toString(36).substring(2, 11), 
                url: row[col] 
              }))
              .filter(img => img.url && img.url.toString().startsWith('http'));

            const name = getVal(['urun adi', 'ad', 'isim', 'name', 'title']);
            if (!name) console.warn(`Satır ${index + 1}: İsim bulunamadı.`);

            return {
              name: name || `Ürün #${index + 1}`,
              price: formatPrice(getVal(['trendyol\'da satilacak fiyat (kdv dahil)', 'fiyat', 'price', 'tutar', 'satis'])),
              category: getVal(['kategori ismi', 'kategori', 'category', 'tur', 'segment']) || 'Genel',
              description: getVal(['urun aciklamasi', 'aciklama', 'description', 'detay']) || '',
              image_url: primaryImage || '',
              images: galleryImages,
              stock_count: parseInt(getVal(['urun stok adedi', 'stok', 'stock', 'adet', 'inventory']) || '24'),
              features: [],
              sizes: ["XS", "S", "M", "L", "XL"]
            };
          } catch (e) {
            console.error(`Satır ${index} işlenirken hata:`, e);
            return null;
          }
        }).filter(Boolean); // Hatalı satırları temizle

        if (productsToInsert.length === 0) {
          throw new Error("İçe aktarılacak geçerli veri bulunamadı. Lütfen Excel dosyasını kontrol edin.");
        }

        const { error } = await supabase
          .from('products')
          .insert(productsToInsert);

        if (error) {
          console.error("Supabase Error:", error);
          throw new Error(`Veritabanı hatası: ${error.message}`);
        }

        toast.success(`${productsToInsert.length} ürün başarıyla eklendi.`);
        refreshData();
        onSuccess();
        onClose();
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('İçe aktarma sırasında bir hata oluştu: ' + error.message);
    } finally {
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
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Veri Önizleme (İlk 5 Satır)</p>
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
