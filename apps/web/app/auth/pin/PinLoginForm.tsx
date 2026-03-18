'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input } from '@menuos/ui';
import { loginWithPin } from '@/lib/auth/pin-actions';
import { pinSchema, type PinInput } from '@menuos/shared';
import type { Tables } from '@menuos/database';

interface PinLoginFormProps {
  branches: Pick<Tables<'branches'>, 'id' | 'name'>[];
}

export function PinLoginForm({ branches }: PinLoginFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PinInput>({
    resolver: zodResolver(pinSchema),
    defaultValues: { branchId: branches[0]?.id ?? '' },
  });

  function onSubmit(data: PinInput) {
    startTransition(async () => {
      const result = await loginWithPin(data);
      if (result?.error) {
        setError('root', { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {branches.length > 1 && (
        <FormField label="Sucursal" htmlFor="branchId" error={errors.branchId?.message}>
          <select
            id="branchId"
            className="flex h-10 w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            {...register('branchId')}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="PIN" htmlFor="pin" error={errors.pin?.message}>
        <Input
          id="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          placeholder="••••"
          className="text-center text-2xl tracking-[0.5em]"
          error={!!errors.pin}
          autoFocus
          {...register('pin')}
        />
      </FormField>

      {errors.root && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 text-center">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? 'Verificando…' : 'Entrar'}
      </Button>
    </form>
  );
}
