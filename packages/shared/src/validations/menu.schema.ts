import { z } from 'zod';
import { MENU_ITEM_FILTERS } from '../constants';

export const menuCategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional(),
  sort_order: z.number().int().min(0).default(0),
  is_visible: z.boolean().default(true),
  schedule_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  schedule_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(150),
  description: z.string().max(500).optional(),
  price: z.number().positive('El precio debe ser mayor a 0').max(99999),
  is_available: z.boolean().default(true),
  is_sold_out_today: z.boolean().default(false),
  is_special: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  prep_time: z.number().int().min(0).max(120).optional(),
  filters: z.array(z.enum(MENU_ITEM_FILTERS)).default([]),
});

export const branchOverrideSchema = z.object({
  branch_id: z.string().uuid(),
  price_override: z.number().positive().max(99999).optional(),
  is_available: z.boolean().optional(),
});

export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type BranchOverrideInput = z.infer<typeof branchOverrideSchema>;
