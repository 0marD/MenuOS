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
