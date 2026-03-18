import { z } from 'zod';

export const brandSettingsSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  banner_url: z.string().url('URL inválida').optional().or(z.literal('')),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')
    .optional(),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')
    .optional(),
});

export const branchSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  address: z.string().max(300).optional(),
  phone: z.string().max(20).optional(),
  timezone: z.string().default('America/Mexico_City'),
});

export const scheduleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  opens_at: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM requerido')
    .optional(),
  closes_at: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM requerido')
    .optional(),
  is_closed: z.boolean().default(false),
});

export const staffMemberSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  role: z.enum(['super_admin', 'manager', 'waiter', 'kitchen']),
  branch_ids: z.array(z.string().uuid()).default([]),
});

export type BrandSettingsInput = z.infer<typeof brandSettingsSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type StaffMemberInput = z.infer<typeof staffMemberSchema>;
