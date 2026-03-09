'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@menuos/ui/atoms/Button';
import { loginWithPin } from '@/lib/auth/pin-actions';

interface PinLoginFormProps {
  branches?: Array<{ id: string; name: string }>;
}

export function PinLoginForm({ branches = [] }: PinLoginFormProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0]?.id ?? '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((d) => d !== '')) {
      submitPin(newPin.join(''));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function submitPin(pinValue: string) {
    setError(null);
    startTransition(async () => {
      const result = await loginWithPin(pinValue, selectedBranch || undefined);
      if (result && 'error' in result) {
        setError(result.error);
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Branch selector — only if multiple branches */}
      {branches.length > 1 && (
        <div className="w-full">
          <label htmlFor="pin-branch" className="mb-1 block text-xs font-medium font-sans text-muted text-center">
            Sucursal
          </label>
          <select
            id="pin-branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div role="alert" className="w-full rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3" role="group" aria-label="PIN de 4 dígitos">
        {pin.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Dígito ${i + 1} del PIN`}
            disabled={isPending}
            className="h-14 w-14 rounded-xl border-2 border-rule bg-cream text-center font-mono text-xl font-bold text-ink focus:border-accent focus:outline-none disabled:opacity-50"
          />
        ))}
      </div>

      {isPending && (
        <p className="text-xs font-sans text-muted">Verificando...</p>
      )}

      <Button variant="ghost" size="sm" asChild>
        <a href="/auth/login">Acceso de administrador</a>
      </Button>
    </div>
  );
}
