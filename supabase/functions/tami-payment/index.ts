import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TAMI CONFIG (Sandbox)
const TAMI_CONFIG = {
  merchantNumber: Deno.env.get('TAMI_MERCHANT_NUMBER') || '77006950',
  terminalNumber: Deno.env.get('TAMI_TERMINAL_NUMBER') || '84006953',
  jwk_k: Deno.env.get('TAMI_JWK_K') || '0edad05a-7ea7-40f1-a80c-d600121ca51b',
  jwk_kid: Deno.env.get('TAMI_JWK_KID') || 'TEST_KID_VALUE',
  secretKey: Deno.env.get('TAMI_SECRET_KEY') || '0edad05a-7ea7-40f1-a80c-d600121ca51b', // Genelde jwk_k ile aynıdır
  apiUrl: 'https://sandbox-paymentapi.tami.com.tr/payment/auth',
  completeUrl: 'https://sandbox-paymentapi.tami.com.tr/payment/complete-3ds'
}

/**
 * Base64Url Encoding Helper
 */
function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Tami V3 JWS Generator (HS512)
 */
async function generateSecurityHash(payload: any) {
  const encoder = new TextEncoder();
  
  const header = {
    alg: "HS512",
    typ: "JWT",
    kid: TAMI_CONFIG.jwk_kid
  };

  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));

  const secret = await crypto.subtle.importKey(
    "raw",
    encoder.encode(TAMI_CONFIG.jwk_k),
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

/**
 * Tami V3 PG-Auth-Token Hash Generator
 * SHA-256 of (merchantNumber + terminalNumber + secretKey)
 */
async function generateAuthHash() {
  const encoder = new TextEncoder();
  const inputString = `${TAMI_CONFIG.merchantNumber}${TAMI_CONFIG.terminalNumber}${TAMI_CONFIG.secretKey}`;
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBinary = String.fromCharCode(...hashArray);
  return btoa(hashBinary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const { action, ...data } = await req.json()

    // ACTION: Initiate 3D Payment
    if (action === 'init-3d') {
      const { 
        orderId, amount, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv, callbackUrl,
        firstName, lastName, email, phone 
      } = data;

      const bodyWithoutHash = {
        orderId: orderId,
        amount: amount,
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
          number: cardNumber,
          expireMonth: expiryMonth,
          expireYear: expiryYear,
          cvv: cvv
        },
        callbackUrl: callbackUrl
      };

      const securityHash = await generateSecurityHash(bodyWithoutHash);
      const requestBody = { ...bodyWithoutHash, securityHash };
      
      const authHash = await generateAuthHash();

      console.log('Initiating Tami V3 Payment for Order:', orderId);

      const response = await fetch(TAMI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_CONFIG.merchantNumber}:${TAMI_CONFIG.terminalNumber}:${authHash}`,
          'correlationId': crypto.randomUUID()
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Tami Auth Response:', result);

      if (!response.ok || result.success === false) {
        return new Response(JSON.stringify({ 
          error: result.message || 'Tami ödeme başlatma hatası',
          details: result 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ACTION: Complete 3D Payment
    if (action === 'complete-3d') {
      const { tamiId, orderId } = data;

      const bodyWithoutHash = {
        tamiId: tamiId,
        orderId: orderId
      };

      const securityHash = await generateSecurityHash(bodyWithoutHash);
      const requestBody = { ...bodyWithoutHash, securityHash };
      
      const authHash = await generateAuthHash();

      console.log('Completing Tami V3 Payment for TamiID:', tamiId);

      const response = await fetch(TAMI_CONFIG.completeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_CONFIG.merchantNumber}:${TAMI_CONFIG.terminalNumber}:${authHash}`,
          'correlationId': crypto.randomUUID()
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Tami Complete Response:', result);

      if (!response.ok || result.success === false) {
        return new Response(JSON.stringify({ 
          error: result.message || 'Ödeme tamamlama hatası',
          details: result 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Geçersiz aksiyon' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error: any) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})

