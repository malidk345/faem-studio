import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, pg-api-version, pg-auth-token, correlationid',
}

// Helper: Base64Url Encoding (Standard for JWS)
function base64UrlEncode(data: Uint8Array): string {
  let base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Helper: Tami V3 Security Hash Generator (JWS HS512)
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

// Helper: Verify Tami V3 Security Hash (JWS HS512)
async function verifySecurityHash(payload: any, receivedHash: string, jwk_k: string) {
  if (!receivedHash || !receivedHash.includes('.')) return false;

  const [headerStr, payloadStr, signatureStr] = receivedHash.split('.');
  const encoder = new TextEncoder();

  const secret = await crypto.subtle.importKey(
    "raw",
    encoder.encode(jwk_k),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["verify"]
  );

  const dataToVerify = encoder.encode(`${headerStr}.${payloadStr}`);

  // Decoding signature from base64url
  const signatureStrFixed = signatureStr.replace(/-/g, "+").replace(/_/g, "/");
  const pad = signatureStrFixed.length % 4;
  const signatureBase64 = pad ? signatureStrFixed + "=".repeat(4 - pad) : signatureStrFixed;
  const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

  const isValid = await crypto.subtle.verify(
    "HMAC",
    secret,
    signature,
    dataToVerify
  );

  return isValid;
}

// Helper: Generate PG-Auth-Token Hash (SHA-256)
async function generateAuthHash(merchant: string, terminal: string, secret: string) {
  const encoder = new TextEncoder();
  const inputString = `${merchant}${terminal}${secret}`;
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBinary = String.fromCharCode(...hashArray);
  return btoa(hashBinary);
}

serve(async (req) => {
  // CORS handled
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TAMI_MERCHANT = Deno.env.get('TAMI_MERCHANT_NUMBER');
    const TAMI_TERMINAL = Deno.env.get('TAMI_TERMINAL_NUMBER');
    const TAMI_SECRET = Deno.env.get('TAMI_JWK_K');
    const TAMI_KID = Deno.env.get('TAMI_JWK_KID');
    const TAMI_COMPLETE_URL = Deno.env.get('TAMI_COMPLETE_URL') || 'https://sandbox-paymentapi.tami.com.tr/payment/complete-3ds';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Tami usually sends callback data via POST form-data or url-encoded
    let data: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("form") || contentType.includes("url-encoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      data = await req.json();
    }

    console.log('Tami Callback Received:', data);

    const { orderId, success, tamiId, securityHash, message } = data;

    // CRITICAL: Verify Signature
    if (TAMI_SECRET) {
      const isValid = await verifySecurityHash(data, securityHash, TAMI_SECRET);
      if (!isValid) {
        console.error('CRITICAL: Invalid Security Hash from Tami Callback!');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 });
      }
    }

    const isSuccess = success === 'true' || success === true || data.status === 'success';

    if (isSuccess && orderId && tamiId) {

      // --- STEP 1: Complete 3D Transaction with Tami ---
      console.log(`[Callback] Completing transaction for Order: ${orderId}, TamiID: ${tamiId}`);

      const authHash = await generateAuthHash(TAMI_MERCHANT!, TAMI_TERMINAL!, TAMI_SECRET!);

      // Completion payload
      const completeBody = { tamiId, orderId };
      const completeSecurityHash = await generateSecurityHash(completeBody, TAMI_SECRET!, TAMI_KID!);

      const completionResponse = await fetch(TAMI_COMPLETE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PG-Api-Version': 'v3',
          'PG-Auth-Token': `${TAMI_MERCHANT}:${TAMI_TERMINAL}:${authHash}`,
          'correlationId': crypto.randomUUID()
        },
        body: JSON.stringify({ ...completeBody, securityHash: completeSecurityHash })
      });

      const completionResult = await completionResponse.json();
      console.log('Tami Completion Result:', completionResult);

      if (!completionResponse.ok || completionResult.success === false) {
        throw new Error(completionResult.message || 'Ödeme tamamlama (complete-3ds) başarısız oldu.');
      }

      // --- STEP 2: Update Order in Database ---
      const { error: dbError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          payment_transaction_id: tamiId,
          payment_provider: 'tami',
          status: 'pending'
        })
        .eq('id', orderId);

      if (dbError) {
        console.error('Database Update Error:', dbError);
      }

      // 3. Redirect to Success Page
      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://faemstore.com';
      return Response.redirect(`${frontendUrl}/order/success/${orderId}`, 302);
    } else {
      console.warn('Payment failed or cancelled:', message);
      
      if (orderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', admin_note: message })
          .eq('id', orderId);
      }

      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://faemstore.com';
      return Response.redirect(`${frontendUrl}/order/error?message=${encodeURIComponent(message || 'Ödeme iptal edildi')}`, 302);
    }

  } catch (error: any) {
    console.error('Callback Handler Error:', error.message);
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://faemstore.com';
    return Response.redirect(`${frontendUrl}/order/error?message=${encodeURIComponent(error.message)}`, 302);
  }
})
