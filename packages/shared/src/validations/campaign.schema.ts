import { z } from 'zod';

export const campaignSchema = z.object({
  name: z.string().min(2).max(100),
  template_id: z.string().min(1, 'Selecciona una plantilla'),
  segment: z.enum(['all', 'new', 'frequent', 'dormant']).default('all'),
  scheduled_at: z.string().datetime().optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
