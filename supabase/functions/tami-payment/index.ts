import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TAMI CONFIG (Sandbox - Bunlar onay gelince paneldeki değerlerle değişecek)
const TAMI_CONFIG = {
  merchantNumber: Deno.env.get('TAMI_MERCHANT_NUMBER') || 'TEST_MERCHANT',
  terminalNumber: Deno.env.get('TAMI_TERMINAL_NUMBER') || 'TEST_TERMINAL',
  jwk_k: Deno.env.get('TAMI_JWK_K') || 'TEST_K_VALUE',
  jwk_kid: Deno.env.get('TAMI_JWK_KID') || 'TEST_KID_VALUE',
  apiUrl: 'https://sandbox-paymentapi.tami.com.tr/payment/auth',
  completeUrl: 'https://sandbox-paymentapi.tami.com.tr/payment/complete-3ds'
}

/**
 * Tami V3 Signature Generator
 * Requests are signed using HMAC-SHA256 with the JWK Key
 */
async function generateTamiHash(body: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(TAMI_CONFIG.jwk_k);
  const messageData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...data } = await req.json()

    // ACTION: Initiate 3D Payment
    if (action === 'init-3d') {
      const { orderId, amount, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv, callbackUrl } = data;

      const requestBody = {
        merchantNumber: TAMI_CONFIG.merchantNumber,
        terminalNumber: TAMI_CONFIG.terminalNumber,
        orderId: orderId,
        amount: amount,
        currency: 'TRY',
        installmentCount: 1,
        paymentType: 'SALE',
        cardHolderName: cardHolderName,
        cardNumber: cardNumber,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cvv: cvv,
        callbackUrl: callbackUrl,
        // Diğer zorunlu alanlar dokümantasyona göre buraya eklenebilir
      };

      const bodyString = JSON.stringify(requestBody);
      const hash = await generateTamiHash(bodyString);

      const response = await fetch(TAMI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_CONFIG.merchantNumber}:${TAMI_CONFIG.terminalNumber}:${hash}`,
          'correlationId': crypto.randomUUID()
        },
        body: bodyString
      });

      const result = await response.json();

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

      const bodyString = JSON.stringify(requestBody);
      const hash = await generateTamiHash(bodyString);

      const response = await fetch(TAMI_CONFIG.completeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_CONFIG.merchantNumber}:${TAMI_CONFIG.terminalNumber}:${hash}`,
          'correlationId': crypto.randomUUID()
        },
        body: bodyString
      });

      const result = await response.json();

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
