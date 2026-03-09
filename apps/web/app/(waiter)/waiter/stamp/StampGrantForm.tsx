'use client';

import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@menuos/ui';
import { findCustomer, grantStamp, redeemReward } from './actions';

interface Program {
  id: string;
  name: string;
  stamps_required: number;
  reward_type: string;
  reward_value: string;
}

interface StampGrantFormProps {
  program: Program;
  staffId: string;
  branchId: string | null;
  orgId: string;
}

interface CustomerResult {
  id: string;
  name: string;
  stamp_count: number;
  is_complete: boolean;
  stamp_card_id: string | null;
  reward_code: string | null;
  reward_redeemed: boolean;
}

export function StampGrantForm({ program, staffId, branchId, orgId }: StampGrantFormProps) {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<CustomerResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setCustomer(null);
    setMessage(null);
    const last4 = phone.replace(/\D/g, '').slice(-4);
    if (last4.length < 4) {
      setSearchError('Ingresa al menos los últimos 4 dígitos del teléfono');
      return;
    }
    startTransition(async () => {
      const result = await findCustomer(orgId, program.id, last4);
      if (result) {
        setCustomer(result);
      } else {
        setSearchError('Cliente no encontrado. Pídale que se registre primero.');
      }
    });
  }

  function handleGrantStamp() {
    if (!customer) return;
    startTransition(async () => {
      const result = await grantStamp({
        customerId: customer.id,
        programId: program.id,
        stampCardId: customer.stamp_card_id,
        orgId,
        branchId,
        staffId,
      });
      if (result.success) {
        setMessage({ text: result.completed ? `¡Tarjeta completa! Recompensa: ${program.reward_value}` : '✓ Sello otorgado', ok: true });
        // Refresh customer data
        const last4 = phone.replace(/\D/g, '').slice(-4);
        const updated = await findCustomer(orgId, program.id, last4);
        if (updated) setCustomer(updated);
      } else {
        setMessage({ text: result.error ?? 'Error al otorgar el sello', ok: false });
      }
    });
  }

  function handleRedeem() {
    if (!customer?.reward_code) return;
    startTransition(async () => {
      const result = await redeemReward(customer.reward_code!);
      if (result.success) {
        setMessage({ text: '✓ Recompensa canjeada', ok: true });
        const last4 = phone.replace(/\D/g, '').slice(-4);
        const updated = await findCustomer(orgId, program.id, last4);
        if (updated) setCustomer(updated);
      } else {
        setMessage({ text: result.error ?? 'Error al canjear', ok: false });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Program info */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-mono text-white/40 uppercase">{program.name}</p>
        <p className="mt-1 text-white/80 text-sm">
          {program.stamps_required} sellos → {program.reward_value}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono del cliente (últimos 4)"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Teléfono del cliente"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Buscar
        </button>
      </form>

      {searchError && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {searchError}
        </div>
      )}

      {/* Customer card */}
      {customer && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div>
            <p className="font-display text-lg font-bold text-white">{customer.name}</p>
            <p className="text-xs text-white/50">
              {customer.stamp_count} / {program.stamps_required} sellos
            </p>
          </div>

          {/* Stamp dots */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: program.stamps_required }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-5 w-5 rounded-full border-2',
                  i < customer.stamp_count ? 'border-accent bg-accent' : 'border-white/20'
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          {message && (
            <div
              role="status"
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium',
                message.ok ? 'bg-green/20 text-green' : 'bg-red-950/40 text-red-400'
              )}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          {!customer.is_complete && (
            <button
              onClick={handleGrantStamp}
              disabled={isPending}
              className="w-full rounded-xl bg-accent py-3 text-base font-bold text-white disabled:opacity-50"
            >
              {isPending ? 'Procesando...' : '+ Otorgar sello'}
            </button>
          )}

          {customer.is_complete && customer.reward_code && !customer.reward_redeemed && (
            <div className="space-y-3">
              <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-center">
                <p className="text-xs text-white/60 mb-1">Código de recompensa</p>
                <p className="font-mono text-2xl font-black tracking-widest text-accent">
                  {customer.reward_code}
                </p>
              </div>
              <button
                onClick={handleRedeem}
                disabled={isPending}
                className="w-full rounded-xl bg-green py-3 text-base font-bold text-white disabled:opacity-50"
              >
                Canjear recompensa
              </button>
            </div>
          )}

          {customer.reward_redeemed && (
            <p className="text-center text-sm text-white/40">Recompensa ya canjeada</p>
          )}
        </div>
      )}
    </div>
  );
}
