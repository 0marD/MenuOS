'use client';

import { Search, Star } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button, FormField, Input } from '@menuos/ui';
import type { Tables } from '@menuos/database';
import { findCustomerByPhone, grantStamp, redeemReward } from './actions';

type Program = Tables<'loyalty_programs'>;

interface StampGrantFormProps {
  programs: Program[];
  orgId: string;
}

export function StampGrantForm({ programs, orgId }: StampGrantFormProps) {
  const [phone, setPhone] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [customer, setCustomer] = useState<{ id: string; name: string } | null>(null);
  const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id ?? '');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await findCustomerByPhone(phone, orgId);
      if (res.error) { setError(res.error); setCustomer(null); return; }
      setCustomer(res.customer!);
    });
  }

  function handleGrant() {
    if (!customer || !selectedProgram) return;
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await grantStamp(customer.id, selectedProgram, orgId);
      if (res.error) { setError(res.error); return; }
      if (res.isComplete) {
        const codeText = res.rewardCode ? ` · Código: ${res.rewardCode}` : '';
        setResult(`🎉 ¡${customer.name} completó la tarjeta! Recompensa: ${res.reward}${codeText}`);
      } else {
        setResult(`✓ Sello otorgado a ${customer.name}. Total: ${res.stampsCount} sellos.`);
      }
    });
  }

  function handleRedeem() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await redeemReward(redeemCode, orgId);
      if (res.error) { setError(res.error); return; }
      setResult('✓ Recompensa canjeada exitosamente.');
      setRedeemCode('');
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Grant stamp */}
      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Otorgar sello</h2>

        <div className="flex flex-col gap-4">
          <FormField label="Buscar cliente por teléfono" htmlFor="stamp-phone">
            <div className="flex gap-2">
              <Input
                id="stamp-phone"
                type="tel"
                inputMode="numeric"
                placeholder="5512345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isPending || !phone.trim()} className="gap-1.5">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </FormField>

          {customer && (
            <>
              <div className="rounded-lg border border-rule bg-cream px-4 py-3">
                <p className="font-medium text-ink">{customer.name}</p>
              </div>

              {programs.length > 1 && (
                <FormField label="Programa" htmlFor="stamp-program">
                  <select
                    id="stamp-program"
                    className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </FormField>
              )}

              <Button onClick={handleGrant} disabled={isPending} className="gap-1.5">
                <Star className="h-4 w-4" />
                Otorgar sello
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Redeem reward */}
      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Canjear recompensa</h2>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Código de recompensa"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            className="font-mono uppercase"
          />
          <Button
            variant="outline"
            onClick={handleRedeem}
            disabled={isPending || !redeemCode.trim()}
          >
            Canjear
          </Button>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {result && (
        <p role="status" className="rounded bg-green/10 px-3 py-2 text-sm text-green">{result}</p>
      )}
    </div>
  );
}
