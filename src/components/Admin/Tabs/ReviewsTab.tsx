import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DataTable } from "../Theme/tasks/components/data-table";
import { Star, Trash2, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(name), products(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Yorumlar yüklenemedi.');
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      toast.error('Yorum silinemedi.');
    } else {
      toast.success('Yorum silindi.');
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reviews').update({ is_verified_buyer: !current }).eq('id', id);
    if (error) {
      toast.error('Durum güncellenemedi.');
    } else {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_verified_buyer: !current } : r));
      toast.success('Doğrulama durumu güncellendi.');
    }
  };

  const columns = [
    {
      accessorKey: "created_at",
      header: "Tarih",
      cell: ({ row }: any) => (
        <span className="text-[10px] font-bold text-zinc-400 uppercase">
          {new Date(row.original.created_at).toLocaleDateString('tr-TR')}
        </span>
      )
    },
    {
      accessorKey: "profiles",
      header: "Müşteri",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-zinc-900">{row.original.profiles?.name || 'Anonim'}</span>
          <span className="text-[10px] text-zinc-400 uppercase font-medium">#{row.original.user_id.slice(0, 8)}</span>
        </div>
      )
    },
    {
      accessorKey: "products",
      header: "Ürün",
      cell: ({ row }: any) => (
        <span className="font-medium text-xs text-zinc-600 line-clamp-1">{row.original.products?.name}</span>
      )
    },
    {
      accessorKey: "rating",
      header: "Puan",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <span className="font-black text-sm">{row.original.rating}</span>
          <Star size={12} className="fill-amber-400 text-amber-400" />
        </div>
      )
    },
    {
      accessorKey: "comment",
      header: "Yorum",
      cell: ({ row }: any) => (
        <p className="text-xs text-zinc-500 max-w-[300px] line-clamp-2 italic">"{row.original.comment}"</p>
      )
    },
    {
      accessorKey: "is_verified_buyer",
      header: "Durum",
      cell: ({ row }: any) => (
        <button onClick={() => toggleVerified(row.original.id, row.original.is_verified_buyer)}>
          <Badge variant="secondary" className={`text-[9px] font-bold uppercase tracking-widest cursor-pointer ${row.original.is_verified_buyer ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-400'}`}>
            {row.original.is_verified_buyer ? 'Doğrulanmış' : 'Normal'}
          </Badge>
        </button>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteReview(row.original.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-zinc-900">Müşteri Yorumları</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-1">Geribildirim Yönetimi</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
           <MessageSquare size={16} className="text-zinc-400" />
           <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">{reviews.length} Toplam Yorum</span>
        </div>
      </div>

      <div className="apple-card overflow-hidden">
        <DataTable columns={columns} data={reviews} searchKey="profiles" />
      </div>
    </div>
  );
}
