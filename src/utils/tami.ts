/**
 * Tami (Garanti Ödeme) Sanal POS 3D Secure Entegrasyon Sınıfı
 * 
 * DİKKAT: Bu dosya istemci tarafında çalışır. Gerçek bir üretim ortamında,
 * GÜVENLİ ANAHTAR (STORE_KEY) sızıntısını önlemek için HASH oluşturma 
 * işleminin Supabase Edge Functions veya bir backend sunucusunda yapılması önerilir.
 * Ancak hızlı entegrasyon ve test için doğrudan çalışacak şekilde tasarlanmıştır.
 */

export interface TamiConfig {
  clientId: string;    // Üye İşyeri Numarası (Merchant ID)
  storeKey: string;    // API Güvenlik Anahtarı (3D Secure Key / K Değeri)
  apiUrl: string;      // Tami 3D API Endpoint (Örn: https://sanalpos.tami.com.tr/fim/est3Dgate)
  okUrl: string;       // Başarılı ödeme dönüş URL'si
  failUrl: string;     // Başarısız ödeme dönüş URL'si
}

export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency?: string; // Varsayılan: 949 (TRY)
  installment?: string; // Boş ise tek çekim
}

export class TamiPayment {
  private config: TamiConfig;

  constructor(config: TamiConfig) {
    this.config = config;
  }

  /**
   * SHA-512 Hash oluşturucu (Web Crypto API)
   */
  private async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Tami (Nestpay) genellikle Base64 encode edilmiş hash bekler
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer) as any));
  }

  /**
   * 3D Secure form verilerini hazırlar ve otomatik post eden bir HTML/Form döndürür
   */
  public async create3DSecureForm(order: PaymentOrder, card: PaymentCard): Promise<HTMLFormElement> {
    // Tami (Nestpay) standart parametreleri
    const rnd = Math.random().toString(36).substring(2, 15);
    const currency = order.currency || "949"; // 949 = TRY
    
    // Tutar formatı (Noktasız, kuruşlar dahil. Örn: 10.50 TL -> 10.50 veya bankaya göre 1050)
    // Standart Nestpay'de nokta ile string olarak gönderilir.
    const amountStr = order.amount.toFixed(2); 

    // Hash Hesaplama Algoritması: 
    // clientId + oid + amount + okUrl + failUrl + rnd + storeKey
    const hashString = `${this.config.clientId}${order.orderId}${amountStr}${this.config.okUrl}${this.config.failUrl}${rnd}${this.config.storeKey}`;
    const hash = await this.generateHash(hashString);

    // Form Elemanını Oluştur
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.config.apiUrl;
    form.style.display = 'none';

    // Kart Tipi Belirleme (1: Visa, 2: MasterCard, 3: Amex)
    let cardType = "1";
    if (card.cardNumber.startsWith("5")) cardType = "2";
    else if (card.cardNumber.startsWith("3")) cardType = "3";
    else if (card.cardNumber.startsWith("9")) cardType = "Troy"; // Troy kart desteği

    const fields: Record<string, string> = {
      clientid: this.config.clientId,
      storetype: '3d', // 3D Pay Modeli
      hash: hash,
      islemtipi: 'Auth',
      amount: amountStr,
      currency: currency,
      oid: order.orderId,
      okUrl: this.config.okUrl,
      failUrl: this.config.failUrl,
      rnd: rnd,
      taksit: order.installment || '',
      
      // Kart Bilgileri
      pan: card.cardNumber.replace(/\s/g, ''),
      cv2: card.cvv,
      Ecom_Payment_Card_ExpDate_Year: card.expireYear,
      Ecom_Payment_Card_ExpDate_Month: card.expireMonth,
      cardType: cardType,
      
      // Dil
      lang: 'tr',
    };

    // Form inputlarını ekle
    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    return form;
  }

  /**
   * Tarayıcı üzerinden 3D secure ekranına yönlendirme işlemini başlatır
   */
  public async initiatePayment(order: PaymentOrder, card: PaymentCard): Promise<void> {
    const form = await this.create3DSecureForm(order, card);
    document.body.appendChild(form);
    form.submit();
  }
}
