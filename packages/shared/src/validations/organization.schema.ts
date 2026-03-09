import { z } from 'zod';
import { SLUG_REGEX, PLAN_IDS } from '../constants';

export const organizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(SLUG_REGEX, 'Solo letras, números y guiones').min(3).max(50),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  plan: z.enum(PLAN_IDS),
});

export const branchSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(300).optional(),
  timezone: z.string().default('America/Mexico_City'),
  is_active: z.boolean().default(true),
});

export const orgBrandSchema = z.object({
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }).optional(),
  template_slug: z.string().optional(),
});

export const staffUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'manager', 'waiter', 'kitchen']),
  branch_id: z.string().uuid().optional(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type OrgBrandInput = z.infer<typeof orgBrandSchema>;
export type StaffUserInput = z.infer<typeof staffUserSchema>;
