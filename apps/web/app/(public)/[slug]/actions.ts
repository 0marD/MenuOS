'use server';

import { createClient } from '@/lib/supabase/server';

// ── Public menu ──────────────────────────────────────────────────────────────

export async function getMenuBySlug(slug: string) {
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, banner_url, primary_color, secondary_color')
    .eq('slug', slug)
    .single();

  if (!org) return null;

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('organization_id', org.id)
    .eq('is_visible', true)
    .is('deleted_at', null)
    .order('sort_order');

  const normalizedCategories = (categories ?? []).map((cat) => ({
    ...cat,
    menu_items: (cat.menu_items ?? [])
      .filter((item) => item.deleted_at === null)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  return { org, categories: normalizedCategories };
}

// ── Customer registration ────────────────────────────────────────────────────

async function encryptPhone(phone: string): Promise<{ encrypted: string; hash: string }> {
  const key = process.env.PHONE_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PHONE_ENCRYPTION_KEY is not set');
    }
    // dev fallback — store plain
    return { encrypted: phone, hash: phone };
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.slice(0, 32).padEnd(32, '0'));
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt']);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(phone),
  );

  const encrypted = Buffer.from([...iv, ...new Uint8Array(ciphertext)]).toString('base64');

  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(phone));
  const hash = Buffer.from(hashBuffer).toString('hex');

  return { encrypted, hash };
}

export async function sendOtp(orgId: string, phone: string) {
  const supabase = await createClient();
  const { error } = await supabase.functions.invoke('send-otp', {
    body: { phone, organization_id: orgId },
  });
  if (error) return { error: 'No se pudo enviar el código. Intenta de nuevo.' };
  return { sent: true };
}

export async function verifyOtpAndRegister(
  orgId: string,
  name: string,
  phone: string,
  code: string,
  optInMarketing: boolean,
) {
  const supabase = await createClient();

  // Hash phone the same way as send-otp Edge Function
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(phone));
  const phoneHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Find valid, unverified OTP
  const { data: otp } = await supabase
    .from('otp_codes')
    .select('id, attempts')
    .eq('organization_id', orgId)
    .eq('phone_hash', phoneHash)
    .eq('code', code)
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!otp) {
    // Increment attempts on latest OTP for this phone (if exists)
    const { data: latest } = await supabase
      .from('otp_codes')
      .select('id, attempts')
      .eq('organization_id', orgId)
      .eq('phone_hash', phoneHash)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latest) {
      const newAttempts = latest.attempts + 1;
      await supabase
        .from('otp_codes')
        .update({ attempts: newAttempts })
        .eq('id', latest.id);

      if (newAttempts >= 5) {
        return { error: 'Demasiados intentos incorrectos. Solicita un nuevo código.' };
      }
    }

    return { error: 'Código incorrecto o expirado.' };
  }

  // Mark OTP as verified
  await supabase
    .from('otp_codes')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', otp.id);

  // Now register/update customer
  const { encrypted, hash } = await encryptPhone(phone);

  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', orgId)
    .eq('phone_hash', hash)
    .single();

  if (existing) {
    await supabase
      .from('customers')
      .update({ name, opt_in_marketing: optInMarketing, last_visit_at: new Date().toISOString() })
      .eq('id', existing.id);
    await supabase
      .from('customer_visits')
      .insert({ customer_id: existing.id, organization_id: orgId });
    return { customerId: existing.id };
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      organization_id: orgId,
      name,
      whatsapp_number: encrypted,
      phone_hash: hash,
      opt_in_marketing: optInMarketing,
    })
    .select('id')
    .single();

  if (error || !customer) return { error: 'Error al registrar cliente.' };

  await supabase
    .from('customer_visits')
    .insert({ customer_id: customer.id, organization_id: orgId });

  return { customerId: customer.id };
}

// Keep legacy export for backward compat (bypasses OTP — used in dev/admin)
export async function registerOrUpdateCustomer(
  orgId: string,
  name: string,
  phone: string,
  optInMarketing: boolean,
) {
  const supabase = await createClient();
  const { encrypted, hash } = await encryptPhone(phone);

  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', orgId)
    .eq('phone_hash', hash)
    .single();

  if (existing) {
    await supabase
      .from('customers')
      .update({ name, opt_in_marketing: optInMarketing, last_visit_at: new Date().toISOString() })
      .eq('id', existing.id);
    await supabase
      .from('customer_visits')
      .insert({ customer_id: existing.id, organization_id: orgId });
    return { customerId: existing.id };
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      organization_id: orgId,
      name,
      whatsapp_number: encrypted,
      phone_hash: hash,
      opt_in_marketing: optInMarketing,
    })
    .select('id')
    .single();

  if (error || !customer) return { error: 'Error al registrar cliente.' };

  await supabase
    .from('customer_visits')
    .insert({ customer_id: customer.id, organization_id: orgId });

  return { customerId: customer.id };
}

// ── Place order ──────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export async function placeOrder({
  orgId,
  branchId,
  tableId,
  customerId,
  items,
}: {
  orgId: string;
  branchId: string;
  tableId: string | null;
  customerId: string;
  items: OrderItem[];
}) {
  const supabase = await createClient();

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      organization_id: orgId,
      branch_id: branchId,
      table_id: tableId ?? null,
      customer_id: customerId,
      total_amount: totalAmount,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !order) return { error: 'Error al crear el pedido.' };

  const orderItems = items.flatMap((i) =>
    Array.from({ length: 1 }, () => ({
      order_id: order.id,
      menu_item_id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      notes: i.notes ?? null,
    })),
  );

  await supabase.from('order_items').insert(orderItems);

  return { orderId: order.id };
}
