import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, FileText, RefreshCcw, Info, Scale } from 'lucide-react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-black font-black text-sm uppercase tracking-wider mb-3 mt-8 first:mt-0">{children}</h3>
);

const LEGAL_CONTENT: Record<string, { title: string, icon: any, content: React.ReactNode }> = {
  'distance-sales': {
    title: 'Mesafeli Satış Sözleşmesi',
    icon: <Scale size={24} />,
    content: (
      <div className="space-y-4 text-zinc-600 text-[13px] leading-relaxed">
        <section>
          <SectionTitle>1. TARAFLAR</SectionTitle>
          <p><strong>SATICI:</strong> Faem Studio (Bundan sonra "SATICI" olarak anılacaktır)<br />
          <strong>E-posta:</strong> faembutik@gmail.com<br />
          <strong>ALICI:</strong> www.faemstore.com internet sitesinden ürün satın alan gerçek veya tüzel kişi (Bundan sonra "ALICI" olarak anılacaktır).</p>
        </section>

        <section>
          <SectionTitle>2. KONU</SectionTitle>
          <p>İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda siparişini verdiği, aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
        </section>

        <section>
          <SectionTitle>3. GENEL HÜKÜMLER</SectionTitle>
          <ul className="list-disc pl-5 space-y-2">
            <li>ALICI, SATICI'ya ait internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</li>
            <li>Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesindeki ön bilgiler içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.</li>
            <li>SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.</li>
          </ul>
        </section>

        <section>
          <SectionTitle>4. CAYMA HAKKI</SectionTitle>
          <p>ALICI; mal satışına ilişkin mesafeli sözleşmelerde, ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren 14 (on dört) gün içerisinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için bu süre içinde SATICI'ya yazılı bildirimde bulunulması şarttır.</p>
        </section>

        <section>
          <SectionTitle>5. UYUŞMAZLIKLARIN ÇÖZÜMÜ</SectionTitle>
          <p>İşbu Sözleşme'den doğabilecek uyuşmazlıklarda, Sanayi ve Ticaret Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri, bu sınırın üzerindeki durumlarda ise SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.</p>
        </section>
      </div>
    )
  },
  'returns': {
    title: 'İptal ve İade Koşulları',
    icon: <RefreshCcw size={24} />,
    content: (
      <div className="space-y-4 text-zinc-600 text-[13px] leading-relaxed">
        <section>
          <SectionTitle>İADE PROSEDÜRÜ</SectionTitle>
          <p>Satın aldığınız ürünleri, teslimat tarihinden itibaren 14 gün içerisinde iade edebilirsiniz. İade edilecek ürünlerin;</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kullanılmamış ve deneme dışında giyilmemiş olması,</li>
            <li>Orijinal ambalajı, etiketleri ve varsa aksesuarları ile birlikte eksiksiz gönderilmesi,</li>
            <li>Yeniden satılabilirlik özelliğini yitirmemiş olması gerekmektedir.</li>
          </ul>
        </section>

        <section>
          <SectionTitle>İADE SÜRECİ VE ÜCRET İADESİ</SectionTitle>
          <p>İade talebiniz onaylandıktan sonra, ürün bedeli 7-10 iş günü içerisinde ödeme yaptığınız karta iade edilir. Bankanızın iade sürecine bağlı olarak bu sürenin yansıması değişiklik gösterebilir.</p>
        </section>

        <section>
          <SectionTitle>İPTAL KOŞULLARI</SectionTitle>
          <p>Siparişiniz kargoya verilmeden önce iptal talebinde bulunabilirsiniz. Kargoya verilmiş siparişlerde iade prosedürü geçerli olacaktır.</p>
        </section>

        <section>
          <SectionTitle>İADE EDİLEMEYECEK ÜRÜNLER</SectionTitle>
          <p>Kişiye özel üretilen, hijyen kuralları gereği iadesi uygun olmayan (iç giyim, küpe vb.) ve son kullanma tarihi geçme ihtimali olan ürünlerde cayma hakkı kullanılamaz.</p>
        </section>
      </div>
    )
  },
  'privacy': {
    title: 'Gizlilik ve Güvenlik',
    icon: <ShieldCheck size={24} />,
    content: (
      <div className="space-y-4 text-zinc-600 text-[13px] leading-relaxed">
        <section>
          <SectionTitle>KİŞİSEL VERİLERİN KORUNMASI (KVKK)</SectionTitle>
          <p>Faem Studio olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. 6698 sayılı KVKK uyarınca, verileriniz sipariş yönetimi, teslimat süreçleri ve kampanya bilgilendirmeleri amacıyla işlenmektedir.</p>
        </section>

        <section>
          <SectionTitle>ÖDEME GÜVENLİĞİ</SectionTitle>
          <p>Sitemizde gerçekleşen tüm ödemeler <strong>Tami</strong> altyapısı ile sağlanmaktadır. Kredi kartı bilgileriniz doğrudan banka sistemlerine iletilmekte olup, tarafımızca asla kaydedilmemekte ve saklanmamaktadır. Tüm işlemler 256-bit SSL sertifikası ile şifrelenmektedir.</p>
        </section>

        <section>
          <SectionTitle>ÇEREZ (COOKIE) POLİTİKASI</SectionTitle>
          <p>Size daha iyi bir alışveriş deneyimi sunmak için zorunlu çerezler kullanmaktayız. Bu çerezler sitenin temel fonksiyonlarının çalışması için gereklidir.</p>
        </section>
      </div>
    )
  },
  'terms': {
    title: 'Kullanım Koşulları',
    icon: <FileText size={24} />,
    content: (
      <div className="space-y-4 text-zinc-600 text-[13px] leading-relaxed">
        <section>
          <SectionTitle>1. KULLANIM ŞARTLARI</SectionTitle>
          <p>www.faemstore.com sitesine girerek veya bu sitedeki herhangi bir bilgiyi kullanarak, aşağıdaki koşulları kabul etmiş sayılmaktasınız.</p>
        </section>

        <section>
          <SectionTitle>2. FİKRİ MÜLKİYET</SectionTitle>
          <p>Bu internet sitesinde bulunan tüm içerikler (tasarımlar, metinler, görseller, kodlar vb.) Faem Studio'ya aittir ve telif hakları ile korunmaktadır. İzinsiz kopyalanması veya kullanılması yasaktır.</p>
        </section>

        <section>
          <SectionTitle>3. SORUMLULUK SINIRLANDIRILMASI</SectionTitle>
          <p>Faem Studio, site içeriğindeki hatalardan veya sitenin kullanımından doğabilecek doğrudan ya da dolaylı zararlardan sorumlu tutulamaz.</p>
        </section>
      </div>
    )
  },
  'about': {
    title: 'Hakkımızda',
    icon: <Info size={24} />,
    content: (
      <div className="space-y-6 text-zinc-600 text-[14px] leading-relaxed">
        <p className="font-medium text-black text-lg italic tracking-tight">"Aesthetic utility for the modern archive."</p>
        <p>Faem Studio, küratörlüğünü Fatih ve Emir'in üstlendiği, İstanbul merkezli bir tasarım kolektifidir. 2026 yılında kurulan stüdyomuz, giyilebilir formlar ve yaşam alanları için teknik estetiği merkezine alan parçalar üretmektedir.</p>
        <p>Amacımız, sadece bir ürün sunmak değil; zamanın ruhunu yakalayan, zamansız ve uzun ömürlü bir seçki oluşturmaktır. Her parça, minimalizm ve brutalizm arasındaki o ince çizgide, en yüksek kalite standartlarıyla hayat bulur.</p>
        <div className="pt-4 border-t border-zinc-100 flex gap-8">
           <div>
             <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Kuruluş</p>
             <p className="text-black font-bold">2026</p>
           </div>
           <div>
             <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Lokasyon</p>
             <p className="text-black font-bold">İstanbul / Global</p>
           </div>
        </div>
      </div>
    )
  }
};

export default function Legal() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').pop() || '';
  const data = LEGAL_CONTENT[slug] || LEGAL_CONTENT['about'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 text-[10px] font-black uppercase tracking-widest leading-none">
        <ChevronLeft size={14} /> Geri Dön
      </Link>

      <div className="flex items-center gap-4 mb-10">
         <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-100">
            {data.icon}
         </div>
         <h1 className="text-[32px] md:text-[44px] font-black tracking-tighter leading-none text-black uppercase">
           {data.title}
         </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="prose prose-zinc prose-sm max-w-none bg-zinc-50/50 p-8 md:p-12 rounded-[2.5rem] border border-zinc-100"
      >
        {data.content}
      </motion.div>
    </div>
  );
}

