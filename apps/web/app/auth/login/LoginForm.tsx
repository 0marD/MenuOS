'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { loginSchema, type LoginInput } from '@menuos/shared/validations';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      // TODO: implement Supabase auth
      console.warn('Login:', data.email);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Contrase\u00f1a"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? 'Ingresando...' : 'Iniciar sesi\u00f3n'}
      </Button>
      <p className="text-center text-xs font-sans text-muted">
        <Link href="/auth/forgot-password" className="text-accent hover:underline">
          \u00bfOlvidaste tu contrase\u00f1a?
        </Link>
      </p>
      <p className="text-center text-xs font-sans text-muted">
        \u00bfNo tienes cuenta?{' '}
        <Link href="/auth/register" className="text-accent hover:underline">
          Reg\u00edstrate gratis
        </Link>
      </p>
    </form>
  );
}
