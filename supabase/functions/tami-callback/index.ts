import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function returnIframeMessage(success: boolean, orderId: string | null, message: string) {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Callback</title>
      </head>
      <body>
        <script>
          window.parent.postMessage({
            type: 'tami-callback',
            success: ${success},
            orderId: '${orderId}',
            message: '${message.replace(/'/g, "\\'")}'
          }, '*');
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
    status: 200
  });
}

serve(async (req) => {
  // CORS handled
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { orderId, success, tamiId, message } = data;
    const isSuccess = success === 'true' || success === true || data.status === 'success';

    if (isSuccess && orderId && tamiId) {
      // We must call complete-3ds on our server to finalize payment
      console.log(`Finalizing payment for order ${orderId} with Tami...`);

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

      const completeResponse = await fetch(`${supabaseUrl}/functions/v1/tami-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          action: 'complete-3d',
          tamiId: tamiId,
          orderId: orderId
        })
      });

      const completeResult = await completeResponse.json();
      console.log('Tami Complete Payment Result:', completeResult);

      if (!completeResponse.ok || completeResult.success === false) {
         console.error('Failed to complete payment:', completeResult.message || completeResult.error);

         // Update as failed if it exists
         await supabase
          .from('orders')
          .update({ payment_status: 'failed', admin_note: completeResult.message || completeResult.error })
          .eq('id', orderId);

         return returnIframeMessage(false, orderId, completeResult.message || completeResult.error || 'Ödeme tamamlanamadı');
      }

      // 1. Update Order in Database
      const { error: dbError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          payment_transaction_id: tamiId || data.transactionId,
          payment_provider: 'tami',
          status: 'pending' // Ready for processing
        })
        .eq('id', orderId);

      if (dbError) {
        console.error('Database Update Error:', dbError);
      }

      return returnIframeMessage(true, orderId, 'Ödeme başarılı');
    } else {
      console.warn('Payment failed or cancelled:', message);
      
      // Update as failed if it exists
      if (orderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', admin_note: message })
          .eq('id', orderId);
      }

      return returnIframeMessage(false, orderId, message || 'Ödeme iptal edildi');
    }

  } catch (error: any) {
    console.error('Callback Handler Error:', error.message);
    return returnIframeMessage(false, null, 'Sistem Hatası');
  }
})
