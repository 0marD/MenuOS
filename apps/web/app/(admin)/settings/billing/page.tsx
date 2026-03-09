import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@menuos/shared/constants';
import { formatMXN } from '@menuos/shared/utils';
import { Badge } from '@menuos/ui/atoms/Badge';
import type { Tables } from '@menuos/database/types';

export const metadata: Metadata = { title: 'Facturación — Configuración' };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) return null;

  const { data: org } = await supabase
    .from('organizations')
    .select('plan, subscription_status, trial_ends_at')
    .eq('id', staffUser.organization_id)
    .single();

  if (!org) return null;

  const plan = PLANS[org.plan as keyof typeof PLANS];
  const statusLabels: Record<Tables<'organizations'>['subscription_status'], string> = {
    active: 'Activa',
    trialing: 'Prueba gratuita',
    past_due: 'Pago pendiente',
    cancelled: 'Cancelada',
  };

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Facturación</h2>
      <div className="space-y-4">
        <div className="rounded-xl border border-rule bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted">Plan actual</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{plan.name}</p>
              <p className="text-sm font-mono text-muted">{formatMXN(plan.price)}/mes</p>
            </div>
            <Badge variant={org.subscription_status === 'active' ? 'available' : 'highlight'}>
              {statusLabels[org.subscription_status]}
            </Badge>
          </div>
          {org.trial_ends_at && org.subscription_status === 'trialing' && (
            <p className="mt-3 text-xs font-sans text-muted">
              Prueba hasta: {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(org.trial_ends_at))}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-rule bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold font-sans text-ink">Límites del plan</h3>
          <ul className="space-y-2 text-sm font-sans">
            <li className="flex justify-between">
              <span className="text-muted">Sucursales</span>
              <span className="font-medium text-ink">{plan.branches}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Contactos CRM</span>
              <span className="font-medium text-ink">
                {plan.crmContacts === Infinity ? 'Ilimitados' : plan.crmContacts}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Mensajes WhatsApp/mes</span>
              <span className="font-medium text-ink">
                {plan.whatsappMessages === Infinity ? 'Ilimitados' : plan.whatsappMessages}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Automatizaciones</span>
              <span className="font-medium text-ink">
                {plan.automations === Infinity ? 'Ilimitadas' : plan.automations}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-dashed border-rule p-4 text-center">
          <p className="text-sm font-sans text-muted">Actualizar plan — próximamente</p>
        </div>
      </div>
    </div>
  );
}
