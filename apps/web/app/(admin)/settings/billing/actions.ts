'use server';

import Stripe from 'stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { Plan } from '@menuos/shared';

const STRIPE_PRICE_IDS: Record<Plan, string> = {
  starter: process.env.STRIPE_PRICE_STARTER ?? '',
  pro: process.env.STRIPE_PRICE_PRO ?? '',
  business: process.env.STRIPE_PRICE_BUSINESS ?? '',
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

async function getOrCreateStripeCustomer(
  stripe: Stripe,
  orgId: string,
  orgName: string,
  email: string,
): Promise<string> {
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', orgId)
    .single();

  if (org?.stripe_customer_id) return org.stripe_customer_id;

  const customer = await stripe.customers.create({
    name: orgName,
    email,
    metadata: { organization_id: orgId },
  });

  await supabase
    .from('organizations')
    .update({ stripe_customer_id: customer.id })
    .eq('id', orgId);

  return customer.id;
}

export async function createCheckoutSession(plan: Plan) {
  const { org, staffUser } = await requireAdminSession();
  const stripe = getStripe();

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) throw new Error(`Price ID for plan "${plan}" not configured`);

  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin') ?? 'http://localhost:3000';

  const customerId = await getOrCreateStripeCustomer(
    stripe,
    org.id,
    org.name,
    staffUser.email ?? '',
  );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings/billing?success=1`,
    cancel_url: `${origin}/settings/billing?canceled=1`,
    metadata: { organization_id: org.id, plan },
    subscription_data: {
      metadata: { organization_id: org.id, plan },
    },
  });

  if (!session.url) throw new Error('No checkout URL returned from Stripe');

  redirect(session.url);
}

export async function createPortalSession() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();
  const stripe = getStripe();

  const { data: orgData } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', org.id)
    .single();

  if (!orgData?.stripe_customer_id) {
    throw new Error('No Stripe customer found for this organization');
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin') ?? 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: orgData.stripe_customer_id,
    return_url: `${origin}/settings/billing`,
  });

  redirect(session.url);
}
