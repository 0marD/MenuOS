import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { CampaignList } from './CampaignList';

export const metadata: Metadata = { title: 'Campañas — MenuOS Admin' };

export default async function CampaignsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id, role')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, segment, scheduled_at, sent_at, total_sent, total_delivered, total_read, created_at')
    .eq('organization_id', staffUser.organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', staffUser.organization_id)
    .single();

  // Count messages sent this month for plan limits
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthUsage } = await supabase
    .from('campaigns')
    .select('total_sent')
    .eq('organization_id', staffUser.organization_id)
    .eq('status', 'sent')
    .gte('sent_at', startOfMonth.toISOString());

  const sentThisMonth = (monthUsage ?? []).reduce((sum, c) => sum + (c.total_sent ?? 0), 0);

  const planLimits: Record<string, number> = {
    starter: 50,
    pro: 500,
    business: -1, // unlimited
  };
  const limit = planLimits[org?.plan ?? 'starter'] ?? 50;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Campañas WhatsApp</h1>
        <Button asChild size="sm">
          <Link href="/admin/campaigns/new">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Nueva campaña
          </Link>
        </Button>
      </div>

      {/* Plan usage */}
      <div className="mb-6 rounded-xl border border-rule bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-muted">Mensajes enviados este mes</p>
            <p className="mt-0.5 font-display text-xl font-bold text-ink">
              {sentThisMonth}
              {limit > 0 && (
                <span className="text-sm font-sans font-normal text-muted"> / {limit}</span>
              )}
              {limit === -1 && (
                <span className="text-sm font-sans font-normal text-muted"> / ilimitados</span>
              )}
            </p>
          </div>
          {limit > 0 && (
            <div className="w-32">
              <div className="h-2 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min((sentThisMonth / limit) * 100, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={sentThisMonth}
                  aria-valuemax={limit}
                  aria-label="Uso de mensajes"
                />
              </div>
              <p className="mt-1 text-right text-xs font-mono text-muted">
                {Math.round((sentThisMonth / limit) * 100)}%
              </p>
            </div>
          )}
        </div>
        {limit > 0 && sentThisMonth >= limit * 0.8 && (
          <p className="mt-2 text-xs font-sans text-accent">
            {sentThisMonth >= limit
              ? 'Límite alcanzado. Actualiza tu plan para enviar más.'
              : 'Cerca del límite mensual. Considera actualizar tu plan.'}
          </p>
        )}
      </div>

      <CampaignList campaigns={campaigns ?? []} />
    </div>
  );
}
