'use client';

import Link from 'next/link';
import { Badge } from '@menuos/ui/atoms/Badge';
import { MessageCircle, Clock, CheckCheck, Send, AlertCircle } from 'lucide-react';
import { cn } from '@menuos/ui';

interface Campaign {
  id: string;
  name: string;
  status: string;
  segment: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  total_sent: number;
  total_delivered: number;
  total_read: number;
  created_at: string;
}

interface CampaignListProps {
  campaigns: Campaign[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; Icon: React.ElementType }> = {
  draft: { label: 'Borrador', variant: 'outline', Icon: MessageCircle },
  scheduled: { label: 'Programada', variant: 'secondary', Icon: Clock },
  sending: { label: 'Enviando', variant: 'secondary', Icon: Send },
  sent: { label: 'Enviada', variant: 'default', Icon: CheckCheck },
  failed: { label: 'Error', variant: 'destructive', Icon: AlertCircle },
};

const SEGMENT_LABELS: Record<string, string> = {
  all: 'Todos',
  new: 'Nuevos',
  frequent: 'Frecuentes',
  dormant: 'Dormidos',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function deliveryRate(sent: number, delivered: number): string {
  if (sent === 0) return '—';
  return `${Math.round((delivered / sent) * 100)}%`;
}

function readRate(delivered: number, read: number): string {
  if (delivered === 0) return '—';
  return `${Math.round((read / delivered) * 100)}%`;
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule py-20 text-center">
        <MessageCircle className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
        <p className="font-display text-base font-medium text-ink">Sin campañas aún</p>
        <p className="mt-1 text-sm font-sans text-muted">
          Crea tu primera campaña para reconectar con tus clientes por WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {campaigns.map((campaign) => {
        const config = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft!;
        const StatusIcon = config.Icon;
        const isSent = campaign.status === 'sent';

        return (
          <Link
            key={campaign.id}
            href={`/admin/campaigns/${campaign.id}`}
            className="group block rounded-xl border border-rule bg-card p-4 transition-all hover:border-accent hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-sans font-medium text-ink group-hover:text-accent">
                    {campaign.name}
                  </p>
                  <Badge variant={config.variant} className="shrink-0">
                    <StatusIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                    {config.label}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs font-sans text-muted">
                  {campaign.segment && (
                    <span>Segmento: {SEGMENT_LABELS[campaign.segment] ?? campaign.segment}</span>
                  )}
                  {campaign.scheduled_at && campaign.status === 'scheduled' && (
                    <span>Programada: {formatDate(campaign.scheduled_at)}</span>
                  )}
                  {campaign.sent_at && (
                    <span>Enviada: {formatDate(campaign.sent_at)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics row — only for sent campaigns */}
            {isSent && (
              <div className={cn(
                'mt-3 grid grid-cols-3 gap-2 rounded-lg border border-rule bg-cream p-3'
              )}>
                <div className="text-center">
                  <p className="text-lg font-bold font-display text-ink">{campaign.total_sent}</p>
                  <p className="text-xs font-sans text-muted">Enviados</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold font-display text-ink">
                    {deliveryRate(campaign.total_sent, campaign.total_delivered)}
                  </p>
                  <p className="text-xs font-sans text-muted">Entregados</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold font-display text-accent">
                    {readRate(campaign.total_delivered, campaign.total_read)}
                  </p>
                  <p className="text-xs font-sans text-muted">Leídos</p>
                </div>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
