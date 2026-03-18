import { z } from 'zod';

export const campaignSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  template_name: z.string().min(1, 'Plantilla requerida'),
  message_body: z.string().max(1024).optional(),
  segment: z.enum(['all', 'new', 'frequent', 'dormant']),
  scheduled_at: z.string().datetime().optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
