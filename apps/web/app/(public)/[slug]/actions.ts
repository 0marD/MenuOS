'use server';

import { createClient } from '@/lib/supabase/server';
import { customerRegistrationSchema, type CustomerRegistrationInput } from '@menuos/shared/validations';

function encryptPhone(phone: string): string {
  // Production: use pgcrypto via RPC or a server-side encryption utility.
  // For now, we store an obfuscated version; replace with proper AES-256 encryption.
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

  const supabase = await createClient();

  // Check if phone already registered for this org
  const last4 = phoneLast4(parsed.data.phone);
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', orgId)
    .eq('phone_last4', last4)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    // Already registered — silent success (don't expose phone match)
    return { success: true };
  }

  const { error } = await supabase.from('customers').insert({
    organization_id: orgId,
    name: parsed.data.name.trim(),
    phone_encrypted: encryptPhone(parsed.data.phone),
    phone_last4: last4,
    is_opted_in: parsed.data.consent,
    segment: 'new',
  });

  if (error) return { success: false, error: 'No se pudo completar el registro' };

  // Insert consent record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', orgId)
    .eq('phone_last4', last4)
    .is('deleted_at', null)
    .single();

  if (customer) {
    await supabase.from('customer_consents').insert([
      { customer_id: customer.id, consent_type: 'marketing', granted: parsed.data.consent },
      { customer_id: customer.id, consent_type: 'data_processing', granted: true },
    ]);
  }

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

  const supabase = await createClient();

  // Resolve table by qr_token if provided
  let tableId: string | null = null;
  let tableNumber = input.tableNumber;

  if (input.tableToken) {
    const { data: table } = await supabase
      .from('restaurant_tables')
      .select('id, number')
      .eq('qr_token', input.tableToken)
      .eq('is_active', true)
      .single();

    if (table) {
      tableId = table.id;
      tableNumber = table.number;
    }
  }

  const total = input.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      organization_id: input.orgId,
      branch_id: input.branchId,
      table_id: tableId,
      table_number: tableNumber,
      customer_name: input.customerName,
      notes: input.notes,
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
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
    }))
  );

  if (itemsError) {
    // Rollback: soft-delete the order
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
