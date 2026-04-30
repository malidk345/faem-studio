import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TAMI CONFIG (Sandbox - Bunlar onay gelince paneldeki değerlerle değişecek)
const TAMI_CONFIG = {
  merchantNumber: Deno.env.get('TAMI_MERCHANT_NUMBER') || '77006950',
  terminalNumber: Deno.env.get('TAMI_TERMINAL_NUMBER') || '84006953',
  jwk_k: Deno.env.get('TAMI_JWK_K') || '0edad05a-7ea7-40f1-a80c-d600121ca51b',
  jwk_kid: Deno.env.get('TAMI_JWK_KID') || 'TEST_KID_VALUE',
  apiUrl: 'https://sandbox-paymentapi.tami.com.tr/payment/auth',
  completeUrl: 'https://sandbox-paymentapi.tami.com.tr/payment/complete-3ds'
}

/**
 * Tami V3 Signature Generator
 * SHA-256 of (merchantNumber + terminalNumber + secretKey)
 * Result must be Base64 encoded
 */
async function generateTamiHash() {
  const encoder = new TextEncoder();
  const inputString = `${TAMI_CONFIG.merchantNumber}${TAMI_CONFIG.terminalNumber}${TAMI_CONFIG.jwk_k}`;
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Encode as Base64 (Standard Tami V3 requirement)
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

      const requestBody = {
        merchantNumber: TAMI_CONFIG.merchantNumber,
        terminalNumber: TAMI_CONFIG.terminalNumber,
        orderId: orderId,
        amount: amount,
        currency: 'TRY',
        installmentCount: 1,
        paymentType: 'SALE',
        paymentGroup: 'PRODUCT',
        buyer: {
          buyerId: orderId, // Use order ID as buyer ID for simplicity
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

      const hash = await generateTamiHash();

      console.log('Initiating Tami V3 Payment for Order:', orderId, 'with Buyer IP:', clientIp);

      const response = await fetch(TAMI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_CONFIG.merchantNumber}:${TAMI_CONFIG.terminalNumber}:${hash}`,
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

    // ACTION: Complete 3D Payment (After callback)
    if (action === 'complete-3d') {
      const { tamiId, orderId } = data;

      const requestBody = {
        merchantNumber: TAMI_CONFIG.merchantNumber,
        terminalNumber: TAMI_CONFIG.terminalNumber,
        tamiId: tamiId,
        orderId: orderId
      };

      const hash = await generateTamiHash();

      console.log('Completing Tami V3 Payment for TamiID:', tamiId);

      const response = await fetch(TAMI_CONFIG.completeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_CONFIG.merchantNumber}:${TAMI_CONFIG.terminalNumber}:${hash}`,
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
