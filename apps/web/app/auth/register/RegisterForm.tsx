'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormField, Input } from '@menuos/ui';
import { register as registerAction } from '@/lib/auth/actions';
import { registerSchema, type RegisterInput } from '@menuos/shared';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction(data);
      if (result?.error) {
        setError('root', { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Nombre completo" htmlFor="name" error={errors.name?.message} required>
        <Input id="name" placeholder="Ana García" error={!!errors.name} {...register('name')} />
      </FormField>

      <FormField label="Nombre del restaurante" htmlFor="restaurantName" error={errors.restaurantName?.message} required>
        <Input
          id="restaurantName"
          placeholder="La Paloma"
          error={!!errors.restaurantName}
          {...register('restaurantName')}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="hola@turestaurante.com"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Contraseña"
        htmlFor="password"
        error={errors.password?.message}
        hint="Mínimo 8 caracteres, una mayúscula, un número y un símbolo"
        required
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <FormField label="Confirmar contraseña" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
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

      <Button type="submit" disabled={isPending} size="lg" className="mt-2 w-full">
        {isPending ? 'Creando cuenta…' : 'Crear cuenta gratis'}
      </Button>

      <p className="text-center text-xs text-muted">
        14 días de prueba gratis. Sin tarjeta de crédito.
      </p>
    </form>
  );
}
