import React, { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock, Package, Truck, CheckCircle2, XCircle, MapPin, Mail,
  User, ShoppingBag, Hash, Calendar, CreditCard, Send, 
  ChevronRight, Copy, Check
} from 'lucide-react';
import type { AdminOrder } from "@/hooks/useAdminData";

interface OrderDetailSheetProps {
  order: AdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

const STATUS_FLOW = [
  { value: 'pending', label: 'Beklemede', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-200', dotColor: 'bg-amber-500' },
  { value: 'processing', label: 'Hazırlanıyor', icon: Package, color: 'bg-blue-50 text-blue-600 border-blue-200', dotColor: 'bg-blue-500' },
  { value: 'shipped', label: 'Kargoda', icon: Truck, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', dotColor: 'bg-indigo-500' },
  { value: 'delivered', label: 'Teslim Edildi', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dotColor: 'bg-emerald-500' },
  { value: 'cancelled', label: 'İptal Edildi', icon: XCircle, color: 'bg-rose-50 text-rose-600 border-rose-200', dotColor: 'bg-rose-500' },
];

function getStatusInfo(status: string) {
  return STATUS_FLOW.find(s => s.value === status) || STATUS_FLOW[0];
}

function getStatusIndex(status: string) {
  return STATUS_FLOW.findIndex(s => s.value === status);
}

export function OrderDetailSheet({ order, open, onOpenChange, onUpdateStatus }: OrderDetailSheetProps) {
  const [adminNote, setAdminNote] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const currentIdx = getStatusIndex(order.status);
  const addr = order.shippingAddress || {};

  const handleStatusChange = async (newStatus: string) => {
    setStatusChanging(true);
    await onUpdateStatus(order.id, newStatus);
    setStatusChanging(false);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Build notification email body
  const getNotificationText = (status: string) => {
    const info = getStatusInfo(status);
    return `Sayın ${order.user},\n\n#${order.shortId} numaralı siparişinizin durumu "${info.label}" olarak güncellenmiştir.\n\nSipariş Tutarı: ${order.total}\nÜrün Sayısı: ${order.itemCount} adet\n\nTeşekkürler,\nFaem Studio`;
  };

  const sendEmailNotification = (status: string) => {
    const body = getNotificationText(status);
    const subject = `Sipariş Güncelleme — #${order.shortId}`;
    const mailtoLink = `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-zinc-50/50">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`${statusInfo.color} font-bold text-[9px] uppercase tracking-widest`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {order.isGuest && (
              <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider">
                Misafir
              </Badge>
            )}
          </div>
          <SheetTitle className="text-xl font-black tracking-tight">
            Sipariş #{order.shortId}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" /> {order.date}
            <button onClick={copyOrderId} className="ml-2 flex items-center gap-1 text-zinc-400 hover:text-zinc-600 transition-colors">
              {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span className="text-[9px] uppercase font-bold tracking-wider">{copiedId ? 'Kopyalandı' : 'ID Kopyala'}</span>
            </button>
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* ── Status Timeline ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Sipariş Durumu</h4>
            <div className="flex items-center gap-1">
              {STATUS_FLOW.filter(s => s.value !== 'cancelled').map((step, idx) => {
                const isCompleted = idx <= currentIdx && order.status !== 'cancelled';
                const isCurrent = step.value === order.status;
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.value}>
                    <button
                      onClick={() => handleStatusChange(step.value)}
                      disabled={statusChanging}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all flex-1 ${
                        isCurrent ? 'bg-zinc-900 text-white scale-105 shadow-lg' :
                        isCompleted ? 'bg-zinc-100 text-zinc-600' :
                        'bg-zinc-50 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[8px] font-bold uppercase tracking-wider leading-none">{step.label}</span>
                    </button>
                    {idx < 3 && (
                      <ChevronRight className={`h-3 w-3 flex-shrink-0 ${isCompleted ? 'text-zinc-400' : 'text-zinc-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {order.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="mt-2 w-full text-center text-[10px] text-rose-400 hover:text-rose-600 font-bold uppercase tracking-widest transition-colors py-1"
              >
                Siparişi İptal Et
              </button>
            )}
          </div>

          <Separator />

          {/* ── Customer Info ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Müşteri Bilgileri</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
                <User className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-sm font-bold text-zinc-900">{order.user}</p>
                  <p className="text-[10px] text-zinc-400">{order.isGuest ? 'Misafir Müşteri' : 'Kayıtlı Üye'}</p>
                </div>
              </div>
              {order.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-700">{order.email}</p>
                  </div>
                  <button
                    onClick={() => sendEmailNotification(order.status)}
                    className="text-[9px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" /> Mail Gönder
                  </button>
                </div>
              )}
              {(addr.address || addr.city) && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50">
                  <MapPin className="h-4 w-4 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{addr.address}</p>
                    <p className="text-xs text-zinc-400">{[addr.city, addr.postal, addr.country].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Order Items ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Sipariş İçeriği ({order.itemCount} ürün)
            </h4>
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl border border-zinc-100 bg-white">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-14 h-14 object-cover rounded-lg border border-zinc-100 flex-shrink-0" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.size && (
                        <Badge variant="outline" className="text-[9px] font-bold px-2 py-0">
                          {item.size}
                        </Badge>
                      )}
                      <span className="text-[10px] text-zinc-400">×{item.quantity || 1}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-zinc-900">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-4 p-4 rounded-xl bg-zinc-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Toplam Tutar</span>
              <span className="text-xl font-black">{order.total}</span>
            </div>
          </div>

          <Separator />

          {/* ── Quick Actions ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Hızlı İşlemler</h4>
            <div className="grid grid-cols-2 gap-2">
              {order.email && (
                <Button 
                  variant="outline" 
                  className="rounded-xl py-5 text-xs font-bold flex items-center gap-2"
                  onClick={() => sendEmailNotification(order.status)}
                >
                  <Mail className="h-3.5 w-3.5" /> Durum Bildir
                </Button>
              )}
              <Button 
                variant="outline" 
                className="rounded-xl py-5 text-xs font-bold flex items-center gap-2"
                onClick={copyOrderId}
              >
                <Hash className="h-3.5 w-3.5" /> {copiedId ? 'Kopyalandı!' : 'ID Kopyala'}
              </Button>
              {order.status === 'pending' && (
                <Button 
                  className="rounded-xl py-5 text-xs font-bold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 col-span-2"
                  onClick={() => handleStatusChange('processing')}
                  disabled={statusChanging}
                >
                  <Package className="h-3.5 w-3.5" /> Hazırlamaya Başla
                </Button>
              )}
              {order.status === 'processing' && (
                <Button 
                  className="rounded-xl py-5 text-xs font-bold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 col-span-2"
                  onClick={() => handleStatusChange('shipped')}
                  disabled={statusChanging}
                >
                  <Truck className="h-3.5 w-3.5" /> Kargoya Ver
                </Button>
              )}
              {order.status === 'shipped' && (
                <Button 
                  className="rounded-xl py-5 text-xs font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 col-span-2"
                  onClick={() => handleStatusChange('delivered')}
                  disabled={statusChanging}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Teslim Edildi Olarak İşaretle
                </Button>
              )}
            </div>
          </div>

          {/* ── Admin Note ── */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Admin Notu</h4>
            <Textarea 
              placeholder="Bu sipariş hakkında not ekleyin..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="rounded-xl border-zinc-200 text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
