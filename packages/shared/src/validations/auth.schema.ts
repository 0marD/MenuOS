import { z } from 'zod';
import { PHONE_MX_REGEX } from '../constants';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Debe incluir mayúsculas, minúsculas y números'
  ),
  orgName: z.string().min(2, 'Nombre del restaurante requerido').max(100),
});

export const pinLoginSchema = z.object({
  pin: z.string().length(4, 'PIN de 4 dígitos').regex(/^\d{4}$/, 'Solo dígitos'),
  branch_id: z.string().uuid('Sucursal inválida'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const customerRegistrationSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  phone: z.string().regex(PHONE_MX_REGEX, 'Número de WhatsApp inválido (+52XXXXXXXXXX)'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar para continuar' }) }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PinLoginInput = z.infer<typeof pinLoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type CustomerRegistrationInput = z.infer<typeof customerRegistrationSchema>;
