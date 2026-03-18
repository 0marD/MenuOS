import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-01-27.acacia' });

  const signature = req.headers.get('stripe-signature');
  if (!signature || !webhookSecret) {
    return new Response('Missing signature', { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const PLAN_BY_PRICE: Record<string, string> = {
    [Deno.env.get('STRIPE_PRICE_STARTER') ?? '']: 'starter',
    [Deno.env.get('STRIPE_PRICE_PRO') ?? '']: 'pro',
    [Deno.env.get('STRIPE_PRICE_BUSINESS') ?? '']: 'business',
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organization_id;
      const plan = session.metadata?.plan;
      if (!orgId || !plan) break;

      await supabase
        .from('organizations')
        .update({
          plan,
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('id', orgId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organization_id;
      if (!orgId) break;

      const priceId = sub.items.data[0]?.price.id ?? '';
      const plan = PLAN_BY_PRICE[priceId] ?? null;
      const status = sub.status as string;

      await supabase
        .from('organizations')
        .update({
          ...(plan ? { plan } : {}),
          subscription_status: status,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('id', orgId);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organization_id;
      if (!orgId) break;

      await supabase
        .from('organizations')
        .update({ subscription_status: 'canceled', stripe_subscription_id: null })
        .eq('id', orgId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      if (!customerId) break;

      await supabase
        .from('organizations')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      if (!customerId) break;

      await supabase
        .from('organizations')
        .update({ subscription_status: 'active' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
