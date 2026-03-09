'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { loginSchema, type LoginInput } from '@menuos/shared/validations';
import { login } from '@/lib/auth/actions';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {serverError && (
        <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? 'Ingresando...' : 'Iniciar sesión'}
      </Button>
      <p className="text-center text-xs font-sans text-muted">
        <Link href="/auth/forgot-password" className="text-accent hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p className="text-center text-xs font-sans text-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="text-accent hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
