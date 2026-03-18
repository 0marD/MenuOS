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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json() as {
      customer_id?: string;
      program_id?: string;
      organization_id?: string;
      branch_id?: string;
      table_id?: string | null;
      granted_by?: string;
    };

    const { customer_id, program_id, organization_id, branch_id, table_id, granted_by } = body;

    if (!customer_id || !program_id || !organization_id) {
      return json({ error: 'customer_id, program_id y organization_id son requeridos.' }, 400);
    }

    // ── Anti-fraud: 1 stamp per customer per (table OR branch) per day ────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let fraudQuery = supabase
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer_id)
      .eq('organization_id', organization_id)
      .gte('created_at', todayStart.toISOString());

    if (table_id) {
      // Strict: same table today
      fraudQuery = fraudQuery.eq('table_id', table_id);
    } else if (branch_id) {
      // Fallback: same branch today
      fraudQuery = fraudQuery.eq('branch_id', branch_id);
    }

    const { count: todayStamps } = await fraudQuery;

    if (todayStamps && todayStamps > 0) {
      return json(
        { error: 'Este cliente ya recibió un sello hoy en esta mesa/sucursal.' },
        409,
      );
    }

    // ── Get or create stamp card ──────────────────────────────────────────────
    let { data: card } = await supabase
      .from('stamp_cards')
      .select('id, stamps_count, is_complete')
      .eq('customer_id', customer_id)
      .eq('program_id', program_id)
      .eq('organization_id', organization_id)
      .eq('is_complete', false)
      .single();

    if (!card) {
      const { data: newCard, error: cardErr } = await supabase
        .from('stamp_cards')
        .insert({ customer_id, program_id, organization_id })
        .select('id, stamps_count, is_complete')
        .single();

      if (cardErr || !newCard) return json({ error: 'Error al crear tarjeta de sellos.' }, 500);
      card = newCard;
    }

    if (card.is_complete) {
      return json({ error: 'La tarjeta ya está completa. El cliente debe canjear su recompensa.' }, 409);
    }

    // ── Grant the stamp ───────────────────────────────────────────────────────
    const { error: stampErr } = await supabase.from('stamps').insert({
      stamp_card_id: card.id,
      customer_id,
      organization_id,
      ...(branch_id ? { branch_id } : {}),
      ...(table_id ? { table_id } : {}),
      ...(granted_by ? { granted_by } : {}),
    });

    if (stampErr) return json({ error: 'Error al otorgar el sello.' }, 500);

    // ── Check if card is now complete ─────────────────────────────────────────
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('stamps_required, reward_description')
      .eq('id', program_id)
      .single();

    const newCount = card.stamps_count + 1;
    const isComplete = program ? newCount >= program.stamps_required : false;

    if (isComplete) {
      // Generate 8-char alphanumeric reward code
      const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();

      await Promise.all([
        supabase
          .from('stamp_cards')
          .update({
            stamps_count: newCount,
            is_complete: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', card.id),
        supabase.from('rewards').insert({
          stamp_card_id: card.id,
          customer_id,
          program_id,
          organization_id,
          code,
        }),
      ]);

      return json({
        stampsCount: newCount,
        isComplete: true,
        reward: program?.reward_description ?? null,
        rewardCode: code,
      });
    }

    await supabase
      .from('stamp_cards')
      .update({ stamps_count: newCount })
      .eq('id', card.id);

    return json({ stampsCount: newCount, isComplete: false });
  } catch (err) {
    console.error('grant-stamp error:', err);
    return json({ error: 'Error interno del servidor.' }, 500);
  }
});
