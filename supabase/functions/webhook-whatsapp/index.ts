import { createClient } from 'jsr:@supabase/supabase-js@2';

// 360dialog sends a webhook secret in the header for verification.
// Set WHATSAPP_WEBHOOK_SECRET in Supabase Secrets (supabase secrets set ...).
const WEBHOOK_SECRET = Deno.env.get('WHATSAPP_WEBHOOK_SECRET');

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface StatusUpdate {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; title: string }[];
}

interface WebhookPayload {
  statuses?: StatusUpdate[];
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Verify webhook secret if configured
  if (WEBHOOK_SECRET) {
    const signature = req.headers.get('x-hub-signature-256') ?? req.headers.get('d360-signature');
    if (!signature || !signature.includes(WEBHOOK_SECRET)) {
      return json({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const payload = await req.json() as WebhookPayload;
    const statuses = payload.statuses ?? [];

    // Aggregate counts by status type for this batch
    let delivered = 0;
    let read = 0;
    let failed = 0;

    for (const status of statuses) {
      if (status.status === 'delivered') delivered++;
      else if (status.status === 'read') read++;
      else if (status.status === 'failed') failed++;
    }

    // We need to find which campaign these messages belong to.
    // 360dialog message IDs need to be matched to campaigns.
    // Since we don't store per-message IDs currently, we use the most
    // recently 'sent' campaign of the relevant org as a best-effort approach.
    // A full implementation would store message IDs per send in campaign_messages.
    if (delivered > 0 || read > 0 || failed > 0) {
      // Find all campaigns in 'sent' status updated in the last 24h
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('status', 'sent')
        .gte('sent_at', since)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (recentCampaigns && recentCampaigns.length > 0) {
        const campaignId = recentCampaigns[0].id;

        // Increment counters using raw SQL via RPC to avoid race conditions
        await supabase.rpc('increment_campaign_analytics', {
          p_campaign_id: campaignId,
          p_delivered: delivered,
          p_read: read,
          p_failed: failed,
        });
      }
    }

    return json({ received: statuses.length });
  } catch (err) {
    console.error('webhook-whatsapp error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
});
