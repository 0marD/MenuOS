import { z } from 'zod';
import { SLUG_REGEX, PHONE_MX_REGEX, USER_ROLES, MENU_ITEM_FILTERS } from '../constants';

export const organizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(SLUG_REGEX).min(3).max(50),
  logo_url: z.string().url().optional(),
  plan: z.enum(['starter', 'pro', 'business']),
});

export const branchSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(300),
  timezone: z.string(),
  is_active: z.boolean().default(true),
});

export const menuCategorySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  sort_order: z.number().int().min(0),
  is_visible: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  price: z.number().positive().max(99999),
  is_available: z.boolean().default(true),
  is_sold_out_today: z.boolean().default(false),
  prep_time: z.number().int().min(0).max(120).optional(),
  filters: z.array(z.enum(MENU_ITEM_FILTERS)).default([]),
});

export const customerRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(PHONE_MX_REGEX, 'N\u00famero de WhatsApp inv\u00e1lido'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los t\u00e9rminos' }) }),
});

export const staffUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(USER_ROLES),
  branch_id: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inv\u00e1lido'),
  password: z.string().min(8, 'M\u00ednimo 8 caracteres'),
});

export const pinLoginSchema = z.object({
  pin: z.string().length(4, 'PIN de 4 d\u00edgitos').regex(/^\d{4}$/, 'Solo d\u00edgitos'),
  branch_id: z.string().uuid(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CustomerRegistrationInput = z.infer<typeof customerRegistrationSchema>;
export type StaffUserInput = z.infer<typeof staffUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PinLoginInput = z.infer<typeof pinLoginSchema>;
