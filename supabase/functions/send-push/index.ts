// @ts-types="npm:@types/web-push@3"
import webpush from 'npm:web-push@3';
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

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:hola@menuos.mx',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? '',
);

interface SendPushBody {
  branch_id: string;
  role: 'waiter' | 'kitchen' | 'all';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const payload = await req.json() as SendPushBody;
    const { branch_id, role, title, body, data } = payload;

    if (!branch_id || !role || !title || !body) {
      return json({ error: 'branch_id, role, title y body son requeridos.' }, 400);
    }

    // Get target subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('branch_id', branch_id);

    if (role !== 'all') query = query.eq('role', role);

    const { data: subscriptions } = await query;

    if (!subscriptions || subscriptions.length === 0) {
      return json({ sent: 0, message: 'No hay dispositivos suscritos.' });
    }

    const notification = JSON.stringify({ title, body, data: data ?? {} });

    let sent = 0;
    const stale: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            notification,
          );
          sent++;
        } catch (err: unknown) {
          // 410 Gone = subscription expired, remove it
          if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 410) {
            stale.push(sub.endpoint);
          }
        }
      }),
    );

    // Clean up expired subscriptions
    if (stale.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', stale);
    }

    return json({ sent, staleRemoved: stale.length });
  } catch (err) {
    console.error('send-push error:', err);
    return json({ error: 'Error interno del servidor.' }, 500);
  }
});
