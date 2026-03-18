'use client';

import { Plus, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { Badge, Button } from '@menuos/ui';
import type { Tables } from '@menuos/database';
import { deleteCampaign, sendCampaign } from './actions';

type Campaign = Tables<'campaigns'> & {
  campaign_analytics: Tables<'campaign_analytics'> | Tables<'campaign_analytics'>[] | null;
};

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'muted' | 'warning'> = {
  draft: 'muted',
  scheduled: 'warning',
  sending: 'default',
  sent: 'success',
  cancelled: 'muted',
} as const;

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  sending: 'Enviando',
  sent: 'Enviada',
  cancelled: 'Cancelada',
};

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la campaña "${name}"?`)) return;
    startTransition(async () => { await deleteCampaign(id); });
  }

  function handleSend(id: string, name: string) {
    if (!confirm(`¿Enviar la campaña "${name}" ahora? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const res = await sendCampaign(id);
      if (res?.error) alert(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{campaigns.length} campañas</p>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/campaigns/new">
            <Plus className="h-4 w-4" />
            Nueva campaña
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-rule py-16 text-center">
          <p className="font-medium text-ink">Todavía no hay campañas</p>
          <p className="text-sm text-muted">Crea tu primera campaña de WhatsApp.</p>
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva campaña
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => {
            const analytics = Array.isArray(campaign.campaign_analytics)
              ? campaign.campaign_analytics[0]
              : campaign.campaign_analytics;

            const sentPct =
              analytics && analytics.total_sent > 0
                ? Math.round((analytics.total_read / analytics.total_sent) * 100)
                : 0;

            return (
              <div
                key={campaign.id}
                className="rounded-xl border border-rule bg-paper px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{campaign.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Segmento: {campaign.segment} · {campaign.total_recipients} destinatarios
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={STATUS_VARIANT[campaign.status] ?? 'muted'}>
                      {STATUS_LABEL[campaign.status] ?? campaign.status}
                    </Badge>
                    {campaign.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleSend(campaign.id, campaign.name)}
                          disabled={isPending}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
                          aria-label={`Enviar ${campaign.name}`}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Enviar
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id, campaign.name)}
                          className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
                          aria-label={`Eliminar ${campaign.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {analytics && analytics.total_sent > 0 && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>{analytics.total_sent} enviados</span>
                      <span>{analytics.total_read} leídos ({sentPct}%)</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${sentPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
