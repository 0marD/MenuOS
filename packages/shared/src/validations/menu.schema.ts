import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  icon: z.string().max(10).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')
    .optional(),
  is_visible: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  base_price: z
    .number({ invalid_type_error: 'Precio inválido' })
    .positive('El precio debe ser mayor a 0')
    .multipleOf(0.01),
  photo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  category_id: z.string().uuid('Categoría inválida'),
  preparation_time_minutes: z.number().int().positive().optional(),
  is_available: z.boolean().default(true),
  is_special: z.boolean().default(false),
  is_vegetarian: z.boolean().default(false),
  is_gluten_free: z.boolean().default(false),
  is_spicy: z.boolean().default(false),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
