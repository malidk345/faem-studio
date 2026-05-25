import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// 1. CORS Ayarları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, pg-api-version, pg-auth-token, correlationid',
}

// 2. Yardımcı Fonksiyon: Base64Url Encoding (JWS Standartı için)
function base64UrlEncode(data: Uint8Array): string {
  let base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 3. Yardımcı Fonksiyon: Tami V3 Güvenlik Hash'i (JWS HS512)
async function generateSecurityHash(payload: any, jwk_k: string, jwk_kid: string) {
  const encoder = new TextEncoder();
  
  const header = {
    alg: "HS512",
    typ: "JWT",
    kid: jwk_kid
  };

  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));

  const secret = await crypto.subtle.importKey(
    "raw",
    encoder.encode(jwk_k),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    secret,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// 4. Yardımcı Fonksiyon: PG-Auth-Token Hash Oluşturucu (SHA-256)
async function generateAuthHash(merchant: string, terminal: string, secret: string) {
  const encoder = new TextEncoder();
  const inputString = `${merchant}${terminal}${secret}`;
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBinary = String.fromCharCode(...hashArray);
  return btoa(hashBinary);
}

// 5. ANA SERVİS (Edge Function)
serve(async (req) => {
  // CORS Ön kontrolü
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Çevresel Değişkenleri Al (Supabase Dashboard'dan set edilmeli)
    const TAMI_MERCHANT = Deno.env.get('TAMI_MERCHANT_NUMBER');
    const TAMI_TERMINAL = Deno.env.get('TAMI_TERMINAL_NUMBER');
    const TAMI_SECRET = Deno.env.get('TAMI_JWK_K'); 
    const TAMI_KID = Deno.env.get('TAMI_JWK_KID');
    
    // Canlı/Test ortamı seçimi (TAMI_IS_PRODUCTION varsayılan olarak 'true' ise canlı API kullanılır)
    const TAMI_IS_PRODUCTION = Deno.env.get('TAMI_IS_PRODUCTION') === 'true';
    const defaultApiUrl = TAMI_IS_PRODUCTION 
      ? 'https://paymentapi.tami.com.tr/payment/auth' 
      : 'https://sandbox-paymentapi.tami.com.tr/payment/auth';
    const defaultCompleteUrl = TAMI_IS_PRODUCTION 
      ? 'https://paymentapi.tami.com.tr/payment/complete-3ds' 
      : 'https://sandbox-paymentapi.tami.com.tr/payment/complete-3ds';

    const TAMI_API_URL = Deno.env.get('TAMI_API_URL') || defaultApiUrl;
    const TAMI_COMPLETE_URL = Deno.env.get('TAMI_COMPLETE_URL') || defaultCompleteUrl;

    if (!TAMI_MERCHANT || !TAMI_TERMINAL || !TAMI_SECRET || !TAMI_KID) {
      throw new Error("Supabase Environment Variables (TAMI) eksik! Dashboard üzerinden TAMI_MERCHANT_NUMBER, TAMI_TERMINAL_NUMBER, TAMI_JWK_K ve TAMI_JWK_KID değerlerini set edin.");
    }

    const { action, ...data } = await req.json();
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // AKSİYON: 3D Ödeme Başlat (auth)
    if (action === 'init-3d') {
      const { 
        orderId, amount, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv, callbackUrl,
        firstName, lastName, email, phone 
      } = data;

      // İstek Gövdesi (Tami V3 Standartı)
      const bodyWithoutHash = {
        orderId: orderId,
        amount: String(amount),
        currency: 'TRY',
        installmentCount: 1,
        paymentType: 'SALE',
        paymentGroup: 'PRODUCT',
        buyer: {
          buyerId: orderId,
          name: firstName || cardHolderName.split(' ')[0] || 'Customer',
          surName: lastName || cardHolderName.split(' ').slice(1).join(' ') || 'Customer',
          emailAddress: email || 'test@example.com',
          phoneNumber: phone || '5555555555',
          ipAddress: clientIp
        },
        card: {
          holderName: cardHolderName,
          number: cardNumber.replace(/\s/g, ''),
          expireMonth: expiryMonth,
          expireYear: expiryYear,
          cvv: cvv
        },
        callbackUrl: callbackUrl
      };

      // İmza ve Auth Token Üretimi
      const securityHash = await generateSecurityHash(bodyWithoutHash, TAMI_SECRET, TAMI_KID);
      const requestBody = { ...bodyWithoutHash, securityHash };
      const authHash = await generateAuthHash(TAMI_MERCHANT, TAMI_TERMINAL, TAMI_SECRET);

      console.log(`[Tami] ${orderId} numaralı işlem başlatılıyor...`);

      const response = await fetch(TAMI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_MERCHANT}:${TAMI_TERMINAL}:${authHash}`,
          'correlationId': crypto.randomUUID()
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Tami Auth Response:', result);

      if (!response.ok || result.success === false) {
        // HTTP 200 olarak dönüyoruz ki Supabase istemci kütüphanesi 'non-2xx' genel hatası fırlatmasın.
        // Böylece ön yüz, dönen gerçek hata mesajını (result.message) doğrudan ekranda gösterebilecek.
        return new Response(JSON.stringify({ 
          success: false,
          error: result.message || 'Ödeme başlatılamadı',
          message: result.message || 'Ödeme başlatılamadı',
          details: result 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // AKSİYON: 3D Ödeme Tamamla (complete)
    if (action === 'complete-3d') {
      const { tamiId, orderId } = data;

      const bodyWithoutHash = {
        tamiId: tamiId,
        orderId: orderId
      };

      const securityHash = await generateSecurityHash(bodyWithoutHash, TAMI_SECRET, TAMI_KID);
      const authHash = await generateAuthHash(TAMI_MERCHANT, TAMI_TERMINAL, TAMI_SECRET);

      console.log(`[Tami] ${orderId} numaralı işlem tamamlanıyor (TamiID: ${tamiId})...`);

      const response = await fetch(TAMI_COMPLETE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_MERCHANT}:${TAMI_TERMINAL}:${authHash}`,
          'correlationId': crypto.randomUUID()
        },
        body: JSON.stringify({ ...bodyWithoutHash, securityHash })
      });

      const result = await response.json();
      console.log('Tami Complete Response:', result);

      if (!response.ok || result.success === false) {
        return new Response(JSON.stringify({ 
          error: result.message || 'Ödeme tamamlama hatası',
          details: result 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({ error: 'Geçersiz aksiyon' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error: any) {
    console.error('[Edge Function Error]:', error.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
})
