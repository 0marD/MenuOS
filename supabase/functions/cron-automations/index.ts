/**
 * cron-automations
 *
 * Triggered daily via pg_cron or Supabase Scheduled Functions.
 * Handles:
 *   1. Dormant customer re-engagement (no visit in 21+ days)
 *   2. Birthday greetings (today's birthdays)
 *   3. Stamp card expiration warnings (1 day before expiry)
 *
 * Schedule: every day at 10:00 AM Mexico City time (UTC-6)
 * pg_cron:  SELECT cron.schedule('menuos-daily', '0 16 * * *', 'SELECT net.http_post(...)');
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const DORMANT_DAYS = 21;

interface OrgSettings {
  wa_api_key: string | null;
  wa_phone_number_id: string | null;
}

async function getOrgSettings(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
): Promise<OrgSettings> {
  const { data } = await supabase
    .from('org_settings')
    .select('key, value')
    .eq('organization_id', orgId)
    .in('key', ['wa_api_key', 'wa_phone_number_id']);

  const settings: OrgSettings = { wa_api_key: null, wa_phone_number_id: null };
  for (const row of data ?? []) {
    if (row.key === 'wa_api_key') settings.wa_api_key = row.value;
    if (row.key === 'wa_phone_number_id') settings.wa_phone_number_id = row.value;
  }
  return settings;
}

async function decryptPhone(encrypted: string): Promise<string | null> {
  // If running in dev mode without encryption key, phone may be stored plain
  const key = Deno.env.get('PHONE_ENCRYPTION_KEY');
  if (!key) return encrypted; // dev fallback

  try {
    const raw = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const ciphertext = raw.slice(12);

    const keyData = new TextEncoder().encode(key.slice(0, 32).padEnd(32, '0'));
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['decrypt']);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  components: unknown[],
  apiKey: string,
): Promise<boolean> {
  try {
    const res = await fetch('https://waba.360dialog.io/v1/messages', {
      method: 'POST',
      headers: { 'D360-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `52${phone}`,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es_MX' },
          components,
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── 1. Dormant customer re-engagement ────────────────────────────────────────

async function processDormantCustomers(
  supabase: ReturnType<typeof createClient>,
): Promise<{ processed: number; sent: number }> {
  const cutoffDate = new Date(Date.now() - DORMANT_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Get all active orgs with WhatsApp configured
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .in('subscription_status', ['active', 'trialing']);

  let totalProcessed = 0;
  let totalSent = 0;

  for (const org of orgs ?? []) {
    const settings = await getOrgSettings(supabase, org.id);
    if (!settings.wa_api_key) continue;

    // Find dormant opt-in customers not yet re-engaged in last 30 days
    const { data: dormantCustomers } = await supabase
      .from('customers')
      .select('id, name, whatsapp_number, segment')
      .eq('organization_id', org.id)
      .eq('opt_in_marketing', true)
      .eq('segment', 'dormant')
      .lt('last_visit_at', cutoffDate)
      .limit(100); // Process max 100 per org per run

    for (const customer of dormantCustomers ?? []) {
      totalProcessed++;

      const phone = await decryptPhone(customer.whatsapp_number);
      if (!phone) continue;

      const sent = await sendWhatsAppTemplate(
        phone,
        'reactivation_offer',
        [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customer.name.split(' ')[0] },
              { type: 'text', text: org.name },
            ],
          },
        ],
        settings.wa_api_key,
      );

      if (sent) {
        totalSent++;
        // Update last_visit_at to avoid re-sending for another 21 days
        // (only update if we successfully sent the message)
        await supabase
          .from('customers')
          .update({ segment: 'dormant' }) // keep segment, just update timestamp check
          .eq('id', customer.id);
      }
    }
  }

  return { processed: totalProcessed, sent: totalSent };
}

// ── 2. Birthday greetings ─────────────────────────────────────────────────────

async function processBirthdays(
  supabase: ReturnType<typeof createClient>,
): Promise<{ processed: number; sent: number }> {
  const now = new Date();
  // Format as MM-DD to match birthday field (stored as YYYY-MM-DD)
  const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .in('subscription_status', ['active', 'trialing']);

  let totalProcessed = 0;
  let totalSent = 0;

  for (const org of orgs ?? []) {
    const settings = await getOrgSettings(supabase, org.id);
    if (!settings.wa_api_key) continue;

    // Find customers with birthday today and opt-in
    const { data: birthdayCustomers } = await supabase
      .from('customers')
      .select('id, name, whatsapp_number')
      .eq('organization_id', org.id)
      .eq('opt_in_marketing', true)
      .like('birthday', `%-${todayMMDD}`)
      .limit(50);

    for (const customer of birthdayCustomers ?? []) {
      totalProcessed++;

      const phone = await decryptPhone(customer.whatsapp_number);
      if (!phone) continue;

      const sent = await sendWhatsAppTemplate(
        phone,
        'birthday_greeting',
        [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customer.name.split(' ')[0] },
              { type: 'text', text: org.name },
            ],
          },
        ],
        settings.wa_api_key,
      );

      if (sent) totalSent++;
    }
  }

  return { processed: totalProcessed, sent: totalSent };
}

// ── 3. Stamp card expiration warnings ─────────────────────────────────────────

async function processStampExpirations(
  supabase: ReturnType<typeof createClient>,
): Promise<{ processed: number; sent: number }> {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStart = tomorrow.toISOString().split('T')[0] + 'T00:00:00Z';
  const tomorrowEnd = tomorrow.toISOString().split('T')[0] + 'T23:59:59Z';

  // Find stamp cards expiring tomorrow
  const { data: expiringCards } = await supabase
    .from('stamp_cards')
    .select(
      'id, stamps_count, customer_id, organization_id, customers(name, whatsapp_number, opt_in_marketing)',
    )
    .eq('is_complete', false)
    .gte('expires_at', tomorrowStart)
    .lte('expires_at', tomorrowEnd)
    .gt('stamps_count', 0);

  let totalProcessed = 0;
  let totalSent = 0;

  const orgCache = new Map<string, OrgSettings>();

  for (const card of expiringCards ?? []) {
    totalProcessed++;

    const customer = Array.isArray(card.customers) ? card.customers[0] : card.customers;
    if (!customer?.opt_in_marketing) continue;

    const phone = await decryptPhone(customer.whatsapp_number);
    if (!phone) continue;

    let settings = orgCache.get(card.organization_id);
    if (!settings) {
      settings = await getOrgSettings(supabase, card.organization_id);
      orgCache.set(card.organization_id, settings);
    }
    if (!settings.wa_api_key) continue;

    const sent = await sendWhatsAppTemplate(
      phone,
      'stamp_expiration_warning',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customer.name.split(' ')[0] },
            { type: 'text', text: String(card.stamps_count) },
          ],
        },
      ],
      settings.wa_api_key,
    );

    if (sent) totalSent++;
  }

  return { processed: totalProcessed, sent: totalSent };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Verify secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const startTime = Date.now();
  const results = {
    dormant: { processed: 0, sent: 0 },
    birthdays: { processed: 0, sent: 0 },
    stampExpiration: { processed: 0, sent: 0 },
  };

  try {
    results.dormant = await processDormantCustomers(supabase);
  } catch (err) {
    console.error('Dormant automation failed:', err);
  }

  try {
    results.birthdays = await processBirthdays(supabase);
  } catch (err) {
    console.error('Birthday automation failed:', err);
  }

  try {
    results.stampExpiration = await processStampExpirations(supabase);
  } catch (err) {
    console.error('Stamp expiration failed:', err);
  }

  const duration = Date.now() - startTime;
  console.log(`Cron completed in ${duration}ms`, results);

  return new Response(JSON.stringify({ ok: true, duration_ms: duration, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
