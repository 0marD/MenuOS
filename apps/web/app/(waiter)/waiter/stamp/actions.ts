'use server';

import { createClient } from '@/lib/supabase/server';

export async function findCustomer(
  orgId: string,
  programId: string,
  phoneLast4: string
): Promise<{
  id: string;
  name: string;
  stamp_count: number;
  is_complete: boolean;
  stamp_card_id: string | null;
  reward_code: string | null;
  reward_redeemed: boolean;
} | null> {
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from('customers')
    .select('id, name')
    .eq('organization_id', orgId)
    .eq('phone_last4', phoneLast4)
    .is('deleted_at', null)
    .single();

  if (!customer) return null;

  const { data: card } = await supabase
    .from('stamp_cards')
    .select('id, stamp_count, is_complete')
    .eq('program_id', programId)
    .eq('customer_id', customer.id)
    .maybeSingle();

  let rewardCode: string | null = null;
  let rewardRedeemed = false;

  if (card?.is_complete) {
    const { data: reward } = await supabase
      .from('rewards')
      .select('code, redeemed_at')
      .eq('stamp_card_id', card.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (reward) {
      rewardCode = reward.code;
      rewardRedeemed = reward.redeemed_at !== null;
    }
  }

  return {
    id: customer.id,
    name: customer.name,
    stamp_count: card?.stamp_count ?? 0,
    is_complete: card?.is_complete ?? false,
    stamp_card_id: card?.id ?? null,
    reward_code: rewardCode,
    reward_redeemed: rewardRedeemed,
  };
}

interface GrantStampInput {
  customerId: string;
  programId: string;
  stampCardId: string | null;
  orgId: string;
  branchId: string | null;
  staffId: string;
}

export async function grantStamp(
  input: GrantStampInput
): Promise<{ success: boolean; completed?: boolean; error?: string }> {
  const supabase = await createClient();

  // Upsert stamp card
  let cardId = input.stampCardId;
  if (!cardId) {
    const { data: newCard, error } = await supabase
      .from('stamp_cards')
      .insert({
        program_id: input.programId,
        customer_id: input.customerId,
        organization_id: input.orgId,
      })
      .select('id')
      .single();
    if (error || !newCard) return { success: false, error: 'Error al crear tarjeta' };
    cardId = newCard.id;
  }

  // Insert stamp (unique index prevents double stamps per day)
  const { error: stampError } = await supabase.from('stamps').insert({
    stamp_card_id: cardId,
    customer_id: input.customerId,
    branch_id: input.branchId,
    granted_by: input.staffId,
  });

  if (stampError) {
    if (stampError.code === '23505') return { success: false, error: 'Ya se otorgó un sello hoy' };
    return { success: false, error: 'Error al otorgar sello' };
  }

  // Check if program completed
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('stamps_required, expiration_days, reward_value')
    .eq('id', input.programId)
    .single();

  const { data: card } = await supabase
    .from('stamp_cards')
    .select('stamp_count')
    .eq('id', cardId)
    .single();

  const newCount = (card?.stamp_count ?? 0) + 1;
  let completed = false;

  if (program && newCount >= program.stamps_required) {
    completed = true;
    const expiresAt = program.expiration_days
      ? new Date(Date.now() + program.expiration_days * 86_400_000).toISOString()
      : null;

    await supabase
      .from('stamp_cards')
      .update({ stamp_count: newCount, is_complete: true, completed_at: new Date().toISOString() })
      .eq('id', cardId);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from('rewards').insert({
      stamp_card_id: cardId,
      customer_id: input.customerId,
      organization_id: input.orgId,
      code,
      ...(expiresAt ? { expires_at: expiresAt } : {}),
    });
  } else {
    await supabase
      .from('stamp_cards')
      .update({ stamp_count: newCount })
      .eq('id', cardId);
  }

  return { success: true, completed };
}

export async function redeemReward(
  code: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: reward } = await supabase
    .from('rewards')
    .select('id, redeemed_at, expires_at')
    .eq('code', code)
    .single();

  if (!reward) return { success: false, error: 'Código no encontrado' };
  if (reward.redeemed_at) return { success: false, error: 'Ya fue canjeado' };
  if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
    return { success: false, error: 'Código expirado' };
  }

  const { error } = await supabase
    .from('rewards')
    .update({ redeemed_at: new Date().toISOString() })
    .eq('id', reward.id);

  if (error) return { success: false, error: 'Error al canjear' };
  return { success: true };
}
