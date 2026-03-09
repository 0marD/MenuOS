import { z } from 'zod';

export const campaignSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1024),
  segment: z.enum(['all', 'new', 'frequent', 'dormant']).default('all'),
  scheduled_at: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
