// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from "https://esm.sh/web-push@3.6.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { title, body, url } = await req.json()

    // 1. Fetch all admin subscriptions
    const { data: subscriptions, error } = await supabaseClient
      .from('admin_subscriptions')
      .select('subscription')

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'Hiç aktif yönetici aboneliği bulunamadı.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Setup Web Push
    webpush.setVapidDetails(
      'mailto:admin@faem.studio',
      Deno.env.get('VAPID_PUBLIC_KEY') || 'BK6TEdnqSBjpbCaIbAMD5w_93HbCDuw2DBzaosP__Ufn7aDB9kNHkLdLJ9QrvrjosBcnZVKcFjom2Kt_0KRDYhc',
      Deno.env.get('VAPID_PRIVATE_KEY') || 'SxeAHl45o5lYiNQJVqlZDgAZGG9X7VIxdbYZAfFDzSI'
    )

    // 3. Send notifications
    console.log(`${subscriptions.length} cihaza bildirim gönderiliyor...`)
    const results = await Promise.allSettled(
      subscriptions.map((s: any) => 
        webpush.sendNotification(
          s.subscription,
          JSON.stringify({ title, body, url })
        )
      )
    )

    return new Response(JSON.stringify({ 
      success: true, 
      deviceCount: subscriptions.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
