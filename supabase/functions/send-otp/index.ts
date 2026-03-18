import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashPhone(phone: string): Promise<string> {
  const data = new TextEncoder().encode(phone);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendWhatsAppOtp(
  phone: string,
  code: string,
  apiKey: string,
): Promise<void> {
  const url = 'https://waba.360dialog.io/v1/messages';
  await fetch(url, {
    method: 'POST',
    headers: {
      'D360-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: `52${phone}`,
      type: 'template',
      template: {
        name: 'otp_verification',
        language: { code: 'es_MX' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: code }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: code }],
          },
        ],
      },
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { phone, organization_id } = await req.json() as {
    phone: string;
    organization_id: string;
  };

  if (!phone || !organization_id) {
    return new Response(JSON.stringify({ error: 'phone and organization_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Rate limit: max 3 OTPs per phone per 10 minutes
  const phoneHash = await hashPhone(phone);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('otp_codes')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organization_id)
    .eq('phone_hash', phoneHash)
    .gt('created_at', tenMinutesAgo);

  if ((count ?? 0) >= 3) {
    return new Response(
      JSON.stringify({ error: 'Demasiados intentos. Espera unos minutos.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from('otp_codes').insert({
    phone_hash: phoneHash,
    organization_id,
    code,
    expires_at: expiresAt,
  });

  // Get org WhatsApp API key
  const { data: settings } = await supabase
    .from('org_settings')
    .select('value')
    .eq('organization_id', organization_id)
    .eq('key', 'wa_api_key')
    .single();

  const apiKey = settings?.value ?? Deno.env.get('WHATSAPP_API_KEY') ?? '';

  if (apiKey) {
    try {
      await sendWhatsAppOtp(phone, code, apiKey);
    } catch (err) {
      console.error('WhatsApp send failed:', err);
      // Still return success — code is stored, dev can test without WA
    }
  }

  // In development without WA configured, log the code
  if (!apiKey) {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
