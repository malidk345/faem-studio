import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    if (isSuccess && orderId) {
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

      // 2. Redirect to Success Page
      return Response.redirect(`${Deno.env.get('FRONTEND_URL') || 'https://faemstore.com'}/order/success/${orderId}`, 302);
    } else {
      console.warn('Payment failed or cancelled:', message);
      
      // Update as failed if it exists
      if (orderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', admin_note: message })
          .eq('id', orderId);
      }

      // 3. Redirect to Error Page
      return Response.redirect(`${Deno.env.get('FRONTEND_URL') || 'https://faemstore.com'}/order/error?message=${encodeURIComponent(message || 'Ödeme iptal edildi')}`, 302);
    }

  } catch (error: any) {
    console.error('Callback Handler Error:', error.message);
    return Response.redirect(`${Deno.env.get('FRONTEND_URL') || 'https://faemstore.com'}/order/error?message=Sistem Hatası`, 302);
  }
})
