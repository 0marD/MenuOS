import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json() as { campaign_id?: string; organization_id?: string };
    const { campaign_id, organization_id } = body;

    if (!campaign_id || !organization_id) {
      return json({ error: 'campaign_id y organization_id son requeridos.' }, 400);
    }

    // 1. Fetch campaign
    const { data: campaign, error: campaignErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('organization_id', organization_id)
      .single();

    if (campaignErr || !campaign) return json({ error: 'Campaña no encontrada.' }, 404);

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return json({ error: 'La campaña ya fue enviada o cancelada.' }, 409);
    }

    // 2. Get 360dialog API key from org_settings
    const { data: apiKeySetting } = await supabase
      .from('org_settings')
      .select('value')
      .eq('organization_id', organization_id)
      .eq('key', 'wa_api_key')
      .single();

    const waApiKey = apiKeySetting?.value as string | null;
    if (!waApiKey) {
      return json(
        { error: 'API key de WhatsApp no configurada. Ve a Configuración → Integraciones.' },
        422,
      );
    }

    // 3. Fetch customers by segment (only marketing opt-in)
    let query = supabase
      .from('customers')
      .select('id, name, whatsapp_number')
      .eq('organization_id', organization_id)
      .eq('opt_in_marketing', true);

    if (campaign.segment !== 'all') {
      query = query.eq('segment', campaign.segment);
    }

    const { data: customers } = await query;

    if (!customers || customers.length === 0) {
      await supabase
        .from('campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString(), total_recipients: 0 })
        .eq('id', campaign_id);

      return json({ sent: 0, failed: 0, message: 'No hay destinatarios en este segmento.' });
    }

    // 4. Mark as sending
    await supabase
      .from('campaigns')
      .update({ status: 'sending', total_recipients: customers.length })
      .eq('id', campaign_id);

    // 5. Send via 360dialog
    let sent = 0;
    let failed = 0;

    for (const customer of customers) {
      const phone = customer.whatsapp_number.replace(/\D/g, '');

      // Build template components from message_body if provided
      const components = campaign.message_body
        ? [{ type: 'body', parameters: [{ type: 'text', text: campaign.message_body }] }]
        : [];

      try {
        const res = await fetch('https://waba.360dialog.io/v1/messages', {
          method: 'POST',
          headers: {
            'D360-API-KEY': waApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phone,
            type: 'template',
            template: {
              name: campaign.template_name,
              language: { code: 'es_MX', policy: 'deterministic' },
              components,
            },
          }),
        });

        if (res.ok) {
          sent++;
        } else {
          const errBody = await res.json().catch(() => ({}));
          console.error(`360dialog error for ${phone}:`, errBody);
          failed++;
        }
      } catch (e) {
        console.error(`Fetch error for ${phone}:`, e);
        failed++;
      }
    }

    // 6. Mark campaign sent + upsert analytics
    const now = new Date().toISOString();
    await Promise.all([
      supabase
        .from('campaigns')
        .update({ status: 'sent', sent_at: now })
        .eq('id', campaign_id),
      supabase.from('campaign_analytics').upsert(
        { campaign_id, total_sent: sent, total_failed: failed, updated_at: now },
        { onConflict: 'campaign_id' },
      ),
    ]);

    return json({ sent, failed, total: customers.length });
  } catch (err) {
    console.error('send-whatsapp error:', err);
    return json({ error: 'Error interno del servidor.' }, 500);
  }
});
