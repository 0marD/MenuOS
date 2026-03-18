import { z } from 'zod';

export const loyaltyProgramSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  stamps_required: z
    .number()
    .int()
    .min(3, 'Mínimo 3 sellos')
    .max(20, 'Máximo 20 sellos'),
  reward_description: z.string().min(1, 'Descripción de recompensa requerida').max(200),
  reward_type: z.enum(['discount', 'free_item', 'bogo']),
  stamps_expiry_days: z.number().int().positive().optional(),
});

export type LoyaltyProgramInput = z.infer<typeof loyaltyProgramSchema>;
