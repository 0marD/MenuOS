'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@menuos/ui/atoms/Button';
import { FormField } from '@menuos/ui/molecules/FormField';
import { registerSchema, type RegisterInput } from '@menuos/shared/validations';
import { register as registerAction } from '@/lib/auth/actions';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: RegisterInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await registerAction(data);
      if (result?.error) setServerError(result.error);
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
        label="Nombre del restaurante"
        placeholder="La Cantina del Centro"
        required
        error={errors.orgName?.message}
        {...register('orgName')}
      />
      <FormField
        label="Tu nombre"
        placeholder="Juan García"
        required
        error={errors.name?.message}
        {...register('name')}
      />
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
        autoComplete="new-password"
        required
        hint="Mínimo 8 caracteres, mayúsculas, minúsculas y números"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
      </Button>
      <p className="text-center text-xs font-sans text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
