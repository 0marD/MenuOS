'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input } from '@menuos/ui';
import { sendPasswordReset } from '@/lib/auth/actions';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@menuos/shared';

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await sendPasswordReset(data.email);
      if (result?.error) {
        setError('root', { message: result.error });
      } else {
        setSent(true);
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
          {sent ? (
            <div className="text-center">
              <p className="text-2xl">📬</p>
              <h2 className="mt-2 font-display text-xl font-bold text-ink">
                Revisa tu correo
              </h2>
              <p className="mt-2 text-sm text-muted">
                Te enviamos un link para restablecer tu contraseña.
              </p>
              <Link
                href="/auth/login"
                className="mt-4 block text-sm font-medium text-accent hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 font-display text-xl font-bold text-ink">
                Recuperar contraseña
              </h2>
              <p className="mb-6 text-sm text-muted">
                Te enviamos un link para crear una nueva contraseña.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hola@turestaurante.com"
                    error={!!errors.email}
                    {...register('email')}
                  />
                </FormField>

                {errors.root && (
                  <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                    {errors.root.message}
                  </p>
                )}

                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? 'Enviando…' : 'Enviar link de recuperación'}
                </Button>
              </form>

              <Link
                href="/auth/login"
                className="mt-4 block text-center text-sm text-muted hover:text-accent transition-colors"
              >
                ← Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
