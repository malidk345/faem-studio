import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, FileText, RefreshCcw, Info, Scale } from 'lucide-react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-black font-black text-sm uppercase tracking-wider mb-3 mt-8 first:mt-0">{children}</h3>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-black font-bold text-[13px] mb-2 mt-4">{children}</h4>
);

const LEGAL_CONTENT: Record<string, { title: string, icon: any, content: React.ReactNode }> = {
  'distance-sales': {
    title: 'Mesafeli Satış Sözleşmesi',
    icon: <Scale size={24} />,
    content: (
      <div className="space-y-4 text-zinc-600 text-[13px] leading-relaxed">
        <section>
          <SectionTitle>MADDE 1 - TARAFLAR</SectionTitle>
          <SubTitle>1.1. SATICI:</SubTitle>
          <p>
            <strong>Satıcı Unvan:</strong> FAEM BUTİK TEKSTİL VE TİCARET LİMİTED ŞİRKETİ<br />
            <strong>Adres:</strong> Barbaros Mahallesi 177. Sokak No:4 Daire:1 Bağcılar İstanbul<br />
            <strong>Tel:</strong> 05372418169<br />
            <strong>E-posta:</strong> faembutik@gmail.com<br />
            <strong>Vergi Numarası:</strong> 3841003553<br />
            <strong>Mersis Numarası:</strong> 0384100355300001<br />
            <strong>Ticaret Sicil Numarası:</strong> 1111936<br />
            <strong>KEP Adresi:</strong> faembutik@hs03.kep.tr
          </p>
          <SubTitle>1.2. ALICI:</SubTitle>
          <p>www.faemstore.com internet sitesinden sipariş veren gerçek veya tüzel kişi.</p>
        </section>

        <section>
          <SectionTitle>MADDE 2 - KONU</SectionTitle>
          <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.faemstore.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
        </section>

        <section>
          <SectionTitle>MADDE 3 - SÖZLEŞME KONUSU ÜRÜN VE TESLİMAT</SectionTitle>
          <p>3.1- Ürünlerin cinsi ve türü, miktarı, marka/modeli, rengi, vergiler dahil satış bedeli sipariş anında internet sitesinde belirtildiği gibidir.</p>
          <p>3.2- Ödeme Şekli: Kredi Kartı, Havale/EFT veya sitede sunulan diğer ödeme seçenekleri.</p>
          <p>Kredi kartı ile taksitli işlem ile sipariş veriyorsanız: Bankanız kampanyalar düzenleyerek sizin seçtiğiniz taksit adedinin daha üstünde bir taksit adedi uygulayabilir, taksit öteleme gibi hizmetler sunulabilir. Kredi kartınızın hesap kesim tarihinden itibaren sipariş toplamı taksit adedine bölünerek kredi kartı özetinize bankanız tarafından yansıtılacaktır.</p>
          <p>3.3- Vadeli satışların sadece Bankalara ait kredi kartları ile yapılması nedeniyle, ALICI, ilgili faiz oranlarını ve temerrüt faizi ile ilgili bilgileri bankasından ayrıca teyit edeceğini kabul, beyan ve taahhüt eder.</p>
          <SubTitle>İade Prosedürü:</SubTitle>
          <p><strong>A) KREDİ KARTINA İADE PROSEDÜRÜ:</strong> Alışveriş kredi kartı ile yapılmışsa, iade talebiniz onaylandıktan sonra, ürün bedeli ödeme yaptığınız karta iade edilir. Banka taksitli işlemlerin iadesini taksitli olarak yansıtabilir.</p>
          <p><strong>B) HAVALE/EFT ÖDEME SEÇENEKLERİNDE İADE:</strong> Tüketicinin belirttiği hesaba (hesabın fatura adresindeki kişinin adına olması şarttır) Havale veya EFT şeklinde yapılacaktır.</p>
          <p>3.4- Teslimat: Teslimat kargo şirketi aracılığı ile ALICI'nın siparişte belirttiği adrese elden teslim edilecektir. Teslim anında ALICI'nın adresinde bulunmaması durumunda dahi SATICI edimini tam ve eksiksiz olarak yerine getirmiş olarak kabul edilecektir. Kargo fiyatı sipariş toplam tutarına eklenmekte ve müşteri tarafından ödenmektedir, aksi belirtilmedikçe ürün bedeline dahil değildir.</p>
        </section>

        <section>
          <SectionTitle>MADDE 4 - GENEL HÜKÜMLER</SectionTitle>
          <ul className="list-disc pl-5 space-y-2">
            <li>ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</li>
            <li>Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler içinde açıklanan süre içinde teslim edilir.</li>
            <li>Sözleşme konusu ürün, ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.</li>
            <li>SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun teslim edilmesinden sorumludur.</li>
            <li>Herhangi bir nedenle ürün bedeli ödenmez veya banka kayıtlarında iptal edilir ise, SATICI ürünün teslimi yükümlülüğünden kurtulmuş kabul edilir.</li>
          </ul>
        </section>

        <section>
          <SectionTitle>MADDE 5 - CAYMA HAKKI</SectionTitle>
          <p>ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 gün içinde malı reddederek cayma hakkına sahiptir. Tüketicinin cayma bildiriminin SATICI'ya ulaştığı tarihten itibaren ilgili yasal süre içinde ürün bedeli ALICI'ya iade edilir. Cayma hakkı nedeni ile iade edilen ürünün kargo bedeli, SATICI'nın anlaşmalı olduğu kargo firması ile gönderilmesi şartıyla SATICI tarafından karşılanır.</p>
          <p>Fatura iade bölümü doldurularak veya e-fatura sistemleri üzerinden iade işlemi gerçekleştirilmelidir.</p>
        </section>

        <section>
          <SectionTitle>MADDE 6 - CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER VE DURUMLAR</SectionTitle>
          <p>Niteliği itibarıyla iade edilemeyecek ürünler, tek kullanımlık ürünler, hızlı bozulan veya son kullanım tarihi geçen ürünler için cayma hakkı kullanılamaz. Giyim, iç giyim, kozmetik vb. ürünlerde cayma hakkının kullanılması, ürünün ambalajının açılmamış, bozulmamış, etiketinin koparılmamış ve ürünün kullanılmamış (deneme dışında) olması şartına bağlıdır.</p>
        </section>

        <section>
          <SectionTitle>MADDE 7 - TEMERRÜT HÜKÜMLERİ</SectionTitle>
          <p>Tarafların işbu sözleşmeden kaynaklanan edimlerini yerine getirmemesi durumunda Borçlar Kanunu'nun ilgili maddelerinde yer alan Borçlunun Temerrüdü hükümleri uygulanacaktır. SATICI mücbir sebepler veya nakliyeyi engelleyen hava muhalefetleri, ulaşımın kesilmesi gibi olağanüstü olaylar nedeni ile sözleşme konusu ürünü süresi içerisinde teslim edemez ise, ALICI siparişin iptal edilmesini veya teslimat süresinin engelleyici durumunun ortadan kalkmasına kadar ertelenmesini talep edebilir.</p>
        </section>

        <section>
          <SectionTitle>MADDE 8 - YETKİLİ MAHKEME</SectionTitle>
          <p>İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.</p>
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
          <p>İade işlemi öncesinde dikkat etmeniz gereken konular aşağıda sıralanmıştır:</p>
          <p>Ürünü iade etmeden önce orijinal ambalajı ile ya da orijinal ambalaja eş değer gelecek bir paketleme sistemi ile geri göndermiş olmanız koşulu aranmaktadır.</p>
          <p>İade talebinizi cayma hakkı süresi dolmadan <strong>faembutik@gmail.com</strong> adresine e-posta göndererek veya <strong>05372418169</strong> numaralı çağrı merkezimizi arayarak iletebilirsiniz.</p>
        </section>

        <section>
          <SectionTitle>Standart ürün siparişlerinde iade süreci:</SectionTitle>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Teslim tarihinden itibaren cayma hakkı olan 14 (on dört) gün içinde bir gerekçe göstermeden siparişinize ait ürünü/ürünleri iade edebilirsiniz.</li>
            <li>İade talebinizi gönderim öncesinde yasal süreyi geçirmeden iletmeniz gerekmektedir. 14 günlük cayma hakkı süresi bittikten sonra keyfi iade yapılamamaktadır.</li>
            <li>İadeler mutlak suretle orijinal kutu veya ambalajı ile birlikte yapılmalıdır.</li>
            <li>Orijinal kutusu/ambalajı bozulmuş, hasarlı, eksik, etiketleri koparılmış, tekrar satılabilirlik özelliğini kaybetmiş, başka bir müşteri tarafından satın alınamayacak durumda olan ürünlerin iadesi kabul edilmemektedir.</li>
            <li>Özelliği, malzemesi, ölçüsü, rengi değiştirilen veya kişiye özel üretilen ürünlerde iade ve değişim kabul edilmemektedir.</li>
          </ul>
        </section>

        <section>
          <SectionTitle>Hasarlı veya Hatalı Ürün Durumunda:</SectionTitle>
          <p>Ürününüzün teslimatı yapıldıktan sonra 14 gün içerisinde tarafımıza kusur, hasar veya hatalı gönderim durumları için bildirimde bulunmanız halinde, adınıza gerekli işlemler başlatılacak olup, bildiriminiz tarafımızca en kısa sürede çözüme kavuşturulacaktır.</p>
          <p>Kusurlu ve/veya hasarlı ürünler için teknik/kalite ekibimiz ürün incelemesi yaparak çözüm sürecini başlatmaktadır.</p>
        </section>

        <section>
          <SectionTitle>Müşteri Hizmetleri</SectionTitle>
          <p>"Güvenli Alışveriş" felsefesi ile yola çıktığımız markamızda müşteri memnuniyetinin sürdürülebilirliğini sağlamak öncelikli gayemizdir.</p>
          <p>Hafta içi 09:00-18:00 saatleri arasında çağrı merkezimizden bizlere ulaşabilir veya destek e-posta adresimize yazabilirsiniz.</p>
        </section>
      </div>
    )
  },
  'privacy': {
    title: 'KVKK ve Aydınlatma Metni',
    icon: <ShieldCheck size={24} />,
    content: (
      <div className="space-y-4 text-zinc-600 text-[13px] leading-relaxed">
        <section>
          <SectionTitle>Kişisel Verilerin Korunması</SectionTitle>
          <p>Değerli Müşterimiz, bir kişinin kimliğini belirlemeye yarayan her türlü bilgi kişisel veridir. Kişisel verileriniz, ürünlerimizi müşterilerimizin istek ve ihtiyaçları doğrultusunda geliştirmek, satış, pazarlama ve tanıtım faaliyetlerimizi yürütebilmek amacıyla FAEM BUTİK TEKSTİL VE TİCARET LİMİTED ŞİRKETİ tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında "Veri Sorumlusu" sıfatıyla toplanmakta ve işlenmektedir.</p>
        </section>

        <section>
          <SectionTitle>Kişisel Verilerin Toplanması</SectionTitle>
          <p>Kişisel verileriniz, sözlü, yazılı veya elektronik olarak aşağıda belirtilen yöntemlerle toplanabilir:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Üyelik formu, iletişim formu, e-posta vs dökümanlar</li>
            <li>İnternet sitelerimize giriş yapmanızı sağlayan sosyal medya ağları</li>
            <li>Çevrimiçi alışveriş uygulamaları, sizi tanımak için kullanılan çerezler</li>
            <li>Çağrı merkezi ve müşteri hizmetleri kanallarımız</li>
          </ul>
        </section>

        <section>
          <SectionTitle>Kişisel Verilerin İşlenmesi ve Aktarılması</SectionTitle>
          <p>Toplanan kişisel verileriniz kaydedilebilir, saklanabilir, güncellenebilir ve işlendikleri amaç için gerekli olan süre kadar muhafaza edilebilir.</p>
          <p>Verileriniz, mevzuata uygun olarak iş ortaklarımızla, adli/resmi makamlarla, bilişim teknolojileri gereği sunucu desteği veren kurumlarla ve satış/pazarlama alanında destek veren firmalarla paylaşılabilecektir.</p>
        </section>

        <section>
          <SectionTitle>Kişisel Veri Sahibi Olarak Haklarınız</SectionTitle>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini, amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini, silinmesini veya yok edilmesini isteme,</li>
            <li>Verilerinizin aktarıldığı üçüncü kişileri öğrenme,</li>
            <li>Kanuna aykırı işlenme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.</li>
          </ul>
        </section>

        <section>
          <SectionTitle>Veri Sorumlusu İletişim Bilgileri</SectionTitle>
          <p>
            <strong>Veri Sorumlusu:</strong> FAEM BUTİK TEKSTİL VE TİCARET LİMİTED ŞİRKETİ<br />
            <strong>Adres:</strong> Barbaros Mahallesi 177. Sokak No:4 Daire:1 Bağcılar İstanbul<br />
            <strong>E-posta Adresi:</strong> faembutik@gmail.com<br />
            <strong>Telefon:</strong> 05372418169
          </p>
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
          <SectionTitle>SİTE KULLANIM ŞARTLARI</SectionTitle>
          <p>Lütfen sitemizi kullanmadan evvel bu "site kullanım şartları"nı dikkatlice okuyunuz. Sitemizdeki web sayfaları ve ona bağlı tüm sayfalar www.faemstore.com adresindeki FAEM BUTİK TEKSTİL VE TİCARET LİMİTED ŞİRKETİ firmasının malıdır ve onun tarafından işletilir.</p>
          <p>Sizler ('Kullanıcı') sitede sunulan tüm hizmetleri kullanırken aşağıdaki şartlara tabi olduğunuzu, bağlı olduğunuz yasalara göre sözleşme imzalama hakkına ve 18 yaşın üzerinde olduğunuzu kabul etmiş sayılırsınız.</p>
        </section>

        <section>
          <SectionTitle>1. SORUMLULUKLAR</SectionTitle>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Firma, fiyatlar ve sunulan ürün ve hizmetler üzerinde değişiklik yapma hakkını her zaman saklı tutar.</li>
            <li>Kullanıcı, sitenin kullanımında tersine mühendislik yapmayacağını, kaynak kodunu bulmak amacıyla işlemde bulunmayacağını kabul eder.</li>
            <li>Kullanıcı, site içindeki faaliyetlerinde genel ahlaka, kanuna aykırı, 3. kişilerin haklarını zedeleyen içerikler üretmeyeceğini kabul eder.</li>
          </ul>
        </section>

        <section>
          <SectionTitle>2. Fikri Mülkiyet Hakları</SectionTitle>
          <p>İşbu Site'de yer alan ünvan, işletme adı, marka, patent, logo, tasarım ve yöntem gibi tescilli veya tescilsiz tüm fikri mülkiyet hakları site işleteni ve sahibi firmaya aittir. Site'nin bütünü veya bir kısmı diğer bir internet sitesinde izinsiz kullanılamaz.</p>
        </section>

        <section>
          <SectionTitle>3. Gizli Bilgi</SectionTitle>
          <p>Firma, site üzerinden kullanıcıların ilettiği kişisel bilgileri 3. Kişilere açıklamayacaktır. Sadece resmi makamlarca usulü dairesinde talep edilmesi halinde ve mevzuat gereği zorunlu durumlarda resmi makamlara açıklanabilecektir.</p>
        </section>

        <section>
          <SectionTitle>4. Garanti Vermeme</SectionTitle>
          <p>FİRMA TARAFINDAN SUNULAN HİZMETLER "OLDUĞU GİBİ" TEMELDE SUNULMAKTA VE PAZARLANABİLİRLİK, BELİRLİ BİR AMACA UYGUNLUK KONUSUNDA SARİH VEYA ZIMNİ HİÇBİR GARANTİDE BULUNMAMAKTADIR.</p>
        </section>

        <section>
          <SectionTitle>5. Kayıt ve Güvenlik</SectionTitle>
          <p>Kullanıcı, doğru, eksiksiz ve güncel kayıt bilgilerini vermek zorundadır. Kullanıcı, şifre ve hesap güvenliğinden kendisi sorumludur.</p>
        </section>

        <section>
          <SectionTitle>6. Mücbir Sebep</SectionTitle>
          <p>Tarafların kontrolünde olmayan tabii afetler, salgın hastalıklar, altyapı arızaları, elektrik kesintisi gibi sebeplerden dolayı yükümlülükler ifa edilemez hale gelirse, taraflar bundan sorumlu değildir.</p>
        </section>

        <section>
          <SectionTitle>7. Uyuşmazlıkların Çözümü</SectionTitle>
          <p>İşbu Sözleşme'nin uygulanmasından veya yorumlanmasından doğacak her türlü uyuşmazlığın çözümünde İstanbul (Merkez) Adliyesi Mahkemeleri ve İcra Daireleri yetkilidir.</p>
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
