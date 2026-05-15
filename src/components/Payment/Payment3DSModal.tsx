import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Payment3DSModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string; // Base64 encoded HTML from Tami
}

export const Payment3DSModal: React.FC<Payment3DSModalProps> = ({ isOpen, onClose, htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow messages only from our own domain/iframe
      if (event.data?.type === 'tami-callback') {
        const { success, orderId, message } = event.data;
        if (success) {
          toast.success("Ödeme başarıyla tamamlandı!");
          navigate(`/order/success/${orderId}`);
        } else {
          toast.error(message || "Ödeme işlemi başarısız oldu.");
          navigate(`/order/error?message=${encodeURIComponent(message || 'Ödeme iptal edildi')}`);
        }
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, onClose]);

  useEffect(() => {
    if (isOpen && htmlContent && containerRef.current) {
      try {
        console.log('--- 3DS Modal Content Received ---');
        
        // 1. Determine if it's Base64 or raw HTML
        // Tami sometimes returns raw HTML, sometimes Base64
        let decodedHtml = htmlContent;
        const isBase64 = !htmlContent.trim().startsWith('<') && !htmlContent.includes('form') && !htmlContent.includes('html');
        
        if (isBase64) {
          try {
            console.log('Decoding Base64 HTML content...');
            decodedHtml = atob(htmlContent);
          } catch (e) {
            console.warn('Failed to decode as base64, using as raw content');
            decodedHtml = htmlContent;
          }
        }
        
        // 2. Inject it into the container
        containerRef.current.innerHTML = decodedHtml;

        // 3. Find and submit the form automatically
        const form = containerRef.current.querySelector('form');
        if (form) {
          console.log('3DS Form found, submitting to iframe...');
          // Target the iframe so it stays within our modal
          form.target = "tami_3ds_frame";
          form.submit();
        } else {
          console.error('No form found in 3DS HTML content');
          // If no form, maybe there is a script that does a redirect?
          // Scripts in innerHTML don't run automatically. 
          // We might need to manually execute scripts if Tami uses them.
          const scripts = containerRef.current.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript).parentNode?.removeChild(newScript);
          });
        }
      } catch (error) {
        console.error('Failed to process 3DS HTML:', error);
      }
    }
  }, [isOpen, htmlContent]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] h-[600px] p-0 overflow-hidden bg-white border-none rounded-[2.5rem]">
        <DialogHeader className="p-6 border-b border-zinc-50 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="text-emerald-600" size={18} />
            </div>
            <DialogTitle className="text-sm font-black uppercase tracking-tight">
              Banka Onay Ekranı
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="relative flex-1 w-full h-full bg-white flex flex-col items-center justify-center">
          {/* We hide the container because it often just auto-submits to a new page or iframe */}
          <div ref={containerRef} className="hidden" />
          
          <div className="flex flex-col items-center gap-4 text-center p-12">
            <Loader2 className="w-12 h-12 text-black animate-spin opacity-20" />
            <div>
              <h3 className="font-black text-lg tracking-tight mb-1">Güvenli Bağlantı Kuruluyor</h3>
              <p className="text-xs text-zinc-400 font-medium max-w-[240px] mx-auto">
                Lütfen pencereyi kapatmayın, bankanızın 3D Secure onay sayfasına yönlendiriliyorsunuz.
              </p>
            </div>
          </div>
          
          {/* For some 3D flows, we might need to show the content in an iframe here */}
          <div className="absolute inset-0 z-10 bg-white">
             <iframe 
                name="tami_3ds_frame" 
                className="w-full h-full border-none"
                title="3D Secure Validation"
             />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
