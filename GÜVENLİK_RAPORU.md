# Güvenlik Analiz Raporu - FAEM Studio

Bu rapor, projenin mevcut durumundaki güvenlik açıklarını, riskli uygulamaları ve iyileştirme önerilerini içermektedir.

## 1. Bağımlılık Analizi (Dependency Audit)

Yapılan `npm audit` taraması sonucunda aşağıdaki bulgular elde edilmiştir:

*   **Kritik ve Yüksek Riskli Açıklar:** Başlangıçta bulunan 5 açığın 4'ü `npm audit fix` ile giderilmiştir.
*   **Kalan Risk:** `xlsx` paketi üzerinde hala bir adet **Yüksek** seviyeli güvenlik açığı bulunmaktadır (Prototype Pollution).
    *   **Risk:** Saldırganlar, Excel dosyası işleme sırasında JavaScript nesne prototiplerini manipüle ederek uygulama davranışını değiştirebilir.
    *   **Öneri:** Eğer mümkünse `xlsx` yerine daha güncel ve güvenli alternatifler (örneğin `exceljs`) kullanılmalı veya paketin güvenli bir sürümü çıktığında güncellenmelidir.

## 2. Veritabanı ve Supabase Güvenliği (Database & RLS)

Supabase üzerinde uygulanan Row Level Security (RLS) politikaları ve SQL scriptleri incelendiğinde şu riskler tespit edilmiştir:

*   **Statik Admin Ataması:** `01_admin_setup.sql` ve `04_production_fixes.sql` dosyalarında admin yetkisi, hardcoded (sabit kodlanmış) e-posta adreslerine göre verilmektedir (`dursunkayamustafa@gmail.com`, `fatihduymus21@gmail.com`).
    *   **Risk:** E-posta adreslerinin ele geçirilmesi veya değişmesi durumunda yönetim paneli erişimi risk altına girer.
    *   **Öneri:** Admin yetkilendirmesi e-posta kontrolü yerine Supabase Dashboard üzerinden manuel olarak veya daha güvenli bir RBAC (Role Based Access Control) sistemiyle yönetilmelidir.
*   **Profil Verilerinin İfşası:** `profiles` tablosu için tanımlanan `Public profiles are viewable by everyone` politikası, tüm kullanıcıların e-posta ve isim bilgilerinin herkes tarafından okunmasına izin vermektedir.
    *   **Risk:** KVKK/GDPR uyumluluğu açısından risk teşkil eder ve kullanıcı verilerinin toplanmasına (scraping) olanak tanır.
    *   **Öneri:** Politika, kullanıcıların sadece kendi profillerini veya sadece adminlerin tüm profilleri görebileceği şekilde kısıtlanmalıdır.
*   **Hassas Veri Depolama:** `store_settings` tablosunda `stripe_secret_key` gibi çok hassas bilgiler tutulmaktadır. RLS ile korunsa da, bu anahtarların veritabanı yerine Supabase Vault veya Edge Function environment variables içinde tutulması daha güvenlidir.

## 3. Ön Yüz Güvenliği (Frontend Security)

*   **API Anahtarı İfşası:** `vite.config.ts` içerisinde `GEMINI_API_KEY` frontend tarafına `process.env` üzerinden aktarılmaktadır.
    *   **Risk:** İstemci tarafında (browser) çalışan kodun içindeki tüm API anahtarları, sayfayı inceleyen (Inspect Element) herkes tarafından görülebilir. Bu anahtarların kotası kötü niyetli kişilerce tüketilebilir.
    *   **Öneri:** Gemini API çağrıları doğrudan frontend'den değil, bir Supabase Edge Function üzerinden yapılmalı ve anahtar sadece backend tarafında saklanmalıdır.
*   **Tehlikeli HTML Enjeksiyonu:** `src/components/ui/chart.tsx` içinde `dangerouslySetInnerHTML` kullanılmaktadır.
    *   **Risk:** Grafik konfigürasyonları kullanıcı tarafından kontrol edilebilen bir kaynaktan geliyorsa, CSS enjeksiyonu veya XSS saldırılarına yol açabilir.
    *   **Öneri:** CSS değişkenlerini `dangerouslySetInnerHTML` yerine React `style` objesi üzerinden yönetmek daha güvenlidir.

## 4. Backend ve Edge Functions Güvenliği

*   **CORS Politikası:** `tami-payment` Edge Function'da `Access-Control-Allow-Origin: '*'` kullanılmaktadır.
    *   **Risk:** Herhangi bir web sitesi sizin ödeme fonksiyonunuza istek atabilir.
    *   **Öneri:** Bu değer sadece uygulamanın canlıya çıkacağı domain adresi (örn: `https://faem.studio`) ile sınırlandırılmalıdır.
*   **Logging:** Ödeme yanıtları (`Tami Auth Response`) konsola yazdırılmaktadır.
    *   **Risk:** Üretim ortamında (production) loglarda hassas veriler (kart sahibi ismi vb.) kalabilir.
    *   **Öneri:** Production ortamında loglama seviyesi düşürülmeli ve hassas veriler maskelenmelidir.

*   **Doğrulanmamış Ödeme Bildirimleri (Webhook/Callback):** `tami-callback` fonksiyonu, gelen isteğin gerçekten Tami'den gelip gelmediğini doğrulamamaktadır (imza kontrolü yoktur).
    *   **Risk (Kritik):** Kötü niyetli bir kişi, herhangi bir sipariş ID'sini kullanarak bu endpoint'e istek atabilir ve ödeme yapılmadığı halde siparişi "Ödendi" durumuna getirebilir.
    *   **Öneri:** Tami tarafından gönderilen imza (hash) parametresi, `TAMI_SECRET` kullanılarak doğrulanmadan sipariş durumu güncellenmemelidir.

## Özet ve Aksiyon Planı

1.  **Hemen:** `profiles` tablosundaki RLS politikasını `auth.uid() = id` olacak şekilde güncelleyin.
2.  **Kısa Vadede:** `GEMINI_API_KEY` kullanımını Edge Function'a taşıyın.
3.  **Kısa Vadede:** Ödeme fonksiyonundaki CORS ayarlarını spesifik domain ile kısıtlayın.
4.  **Orta Vadede:** Admin atama mantığını hardcoded e-postalardan arındırın.
