'use server';

import { createClient } from '@/lib/supabase/server';
import { customerRegistrationSchema, type CustomerRegistrationInput } from '@menuos/shared/validations';

/**
 * Phone encryption: uses pgcrypto AES via Supabase RPC in production.
 * The encryption key must be set in PHONE_ENCRYPTION_KEY env var.
 * Migration 0015 creates the encrypt_phone() RPC function.
 */
async function encryptPhone(supabase: Awaited<ReturnType<typeof createClient>>, phone: string): Promise<string> {
  const key = process.env['PHONE_ENCRYPTION_KEY'];
  if (key && key.length >= 16) {
    const { data } = await supabase.rpc('encrypt_phone', { phone, key });
    if (data) return data as string;
  }
  // Fallback: base64 (only for local dev where PHONE_ENCRYPTION_KEY is not set)
  // In production, PHONE_ENCRYPTION_KEY must be set or this will log a warning
  if (process.env['NODE_ENV'] === 'production') {
    console.error('[SECURITY] PHONE_ENCRYPTION_KEY is not set — phone stored unencrypted');
  }
  return Buffer.from(phone).toString('base64');
}

function phoneLast4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-4);
}

export async function registerCustomer(
  orgId: string,
  data: CustomerRegistrationInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = customerRegistrationSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Datos inválidos' };

  // Validate the org exists and accepts registrations
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', orgId)
    .is('deleted_at', null)
    .single();

  if (!org) return { success: false, error: 'Organización no encontrada' };

  const last4 = phoneLast4(parsed.data.phone);
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', orgId)
    .eq('phone_last4', last4)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) return { success: true }; // Silent: don't reveal match

  const phoneEncrypted = await encryptPhone(supabase, parsed.data.phone);

  const { error, data: customer } = await supabase
    .from('customers')
    .insert({
      organization_id: orgId,
      name: parsed.data.name.trim(),
      phone_encrypted: phoneEncrypted,
      phone_last4: last4,
      is_opted_in: parsed.data.consent,
      segment: 'new',
    })
    .select('id')
    .single();

  if (error || !customer) return { success: false, error: 'No se pudo completar el registro' };

  await supabase.from('customer_consents').insert([
    { customer_id: customer.id, consent_type: 'marketing', granted: parsed.data.consent },
    { customer_id: customer.id, consent_type: 'data_processing', granted: true },
  ]);

  return { success: true };
}

interface OrderItemInput {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string | null;
}

interface PlaceOrderInput {
  orgId: string;
  branchId: string;
  tableToken: string | null;
  tableNumber: number | null;
  customerName: string | null;
  notes: string | null;
  items: OrderItemInput[];
}

export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ success: boolean; error?: string; orderId?: string }> {
  if (!input.items.length) return { success: false, error: 'El carrito está vacío' };
  if (input.items.length > 50) return { success: false, error: 'Demasiados artículos' };

  const supabase = await createClient();

  // Validate org + branch exist and are active
  const { data: branch } = await supabase
    .from('branches')
    .select('id, organization_id')
    .eq('id', input.branchId)
    .eq('organization_id', input.orgId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (!branch) return { success: false, error: 'Sucursal no disponible' };

  // Resolve table by qr_token
  let tableId: string | null = null;
  let tableNumber = input.tableNumber;

  if (input.tableToken) {
    const { data: table } = await supabase
      .from('restaurant_tables')
      .select('id, number, branch_id')
      .eq('qr_token', input.tableToken)
      .eq('is_active', true)
      .single();

    if (table && table.branch_id === input.branchId) {
      tableId = table.id;
      tableNumber = table.number;
    }
  }

  // Validate all menu items belong to the org and are available
  const itemIds = input.items.map((i) => i.menu_item_id);
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, price, is_available, is_sold_out_today, organization_id')
    .in('id', itemIds)
    .eq('organization_id', input.orgId)
    .eq('is_available', true)
    .eq('is_sold_out_today', false)
    .is('deleted_at', null);

  if (!menuItems || menuItems.length !== itemIds.length) {
    return { success: false, error: 'Uno o más platillos no están disponibles' };
  }

  // Use server-side prices (never trust client prices)
  const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]));
  const total = input.items.reduce((s, i) => s + (priceMap.get(i.menu_item_id) ?? 0) * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      organization_id: input.orgId,
      branch_id: input.branchId,
      table_id: tableId,
      table_number: tableNumber,
      customer_name: input.customerName ? input.customerName.slice(0, 100) : null,
      notes: input.notes ? input.notes.slice(0, 500) : null,
      total,
      status: 'pending',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return { success: false, error: 'No se pudo crear el pedido' };
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    input.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      name: item.name.slice(0, 150),
      price: priceMap.get(item.menu_item_id) ?? item.price, // Use server price
      quantity: Math.min(Math.max(1, item.quantity), 20),   // Clamp 1–20
      notes: item.notes ? item.notes.slice(0, 300) : null,
    }))
  );

  if (itemsError) {
    await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', order.id);
    return { success: false, error: 'Error al guardar los platillos' };
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    status: 'pending',
  });

  return { success: true, orderId: order.id };
}
