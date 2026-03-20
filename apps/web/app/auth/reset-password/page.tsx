'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input } from '@menuos/ui';
import { updatePassword } from '@/lib/auth/actions';
import { resetPasswordSchema, type ResetPasswordInput } from '@menuos/shared';

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function onSubmit(data: ResetPasswordInput) {
    startTransition(async () => {
      const result = await updatePassword(data.password);
      if (result?.error) {
        setError('root', { message: result.error });
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-black text-ink">MenuOS</h1>
        </div>

        <div className="rounded border border-rule bg-paper p-6 shadow-sm">
          <h2 className="mb-2 font-display text-xl font-bold text-ink">Nueva contraseña</h2>
          <p className="mb-6 text-sm text-muted">Elige una contraseña segura para tu cuenta.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              label="Nueva contraseña"
              htmlFor="password"
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={!!errors.password}
                {...register('password')}
              />
            </FormField>

            <FormField
              label="Confirmar contraseña"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </FormField>

            {errors.root && (
              <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </form>

          <Link
            href="/auth/login"
            className="mt-4 block text-center text-sm text-muted hover:text-accent transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
