import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(128, 'Máximo 128 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un símbolo'),
    confirmPassword: z.string(),
    restaurantName: z.string().min(2, 'Nombre del restaurante requerido').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const pinSchema = z.object({
  pin: z
    .string()
    .length(4, 'El PIN debe tener 4 dígitos')
    .regex(/^\d{4}$/, 'Solo se permiten números'),
  branchId: z.string().uuid('Sucursal inválida'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PinInput = z.infer<typeof pinSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
