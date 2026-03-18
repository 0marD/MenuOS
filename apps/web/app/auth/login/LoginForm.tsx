'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@menuos/ui';
import { FormField } from '@menuos/ui';
import { Input } from '@menuos/ui';
import { login } from '@/lib/auth/actions';
import { loginSchema, type LoginInput } from '@menuos/shared';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) {
        setError('root', { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="hola@turestaurante.com"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label="Contraseña" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      {errors.root && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} size="lg" className="mt-2 w-full">
        {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
