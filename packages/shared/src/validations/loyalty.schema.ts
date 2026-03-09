import { z } from 'zod';

export const loyaltyProgramSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  stamps_required: z
    .number()
    .int()
    .min(5, 'Mínimo 5 sellos')
    .max(12, 'Máximo 12 sellos'),
  reward_type: z.enum(['free_item', 'discount', 'custom']),
  reward_value: z.string().min(1, 'Describe la recompensa').max(200),
  expiration_days: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional()
    .transform((v) => (v === 0 ? null : v)),
});

export type LoyaltyProgramInput = z.infer<typeof loyaltyProgramSchema>;
