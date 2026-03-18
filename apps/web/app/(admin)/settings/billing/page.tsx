import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@menuos/ui';
import { PLAN_LIMITS, PLAN_PRICES_MXN, type Plan } from '@menuos/shared';
import { CheckoutButton, PortalButton } from './BillingButtons';

export const metadata: Metadata = { title: 'Facturación' };

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  trialing: 'Prueba',
  past_due: 'Pago vencido',
  canceled: 'Cancelado',
  inactive: 'Inactivo',
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { org: sessionOrg, staffUser } = await requireAdminSession();
  if (staffUser.role !== 'super_admin') notFound();
  const supabase = await createClient();
  const params = await searchParams;

  const { data: org } = await supabase
    .from('organizations')
    .select('plan, subscription_status, trial_ends_at, stripe_customer_id, current_period_end')
    .eq('id', sessionOrg.id)
    .single();

  if (!org) return null;

  const limits = PLAN_LIMITS[org.plan as Plan];
  const isTrialing = org.subscription_status === 'trialing';
  const isActive = org.subscription_status === 'active';
  const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const periodEnd = org.current_period_end ? new Date(org.current_period_end) : null;
  const hasStripeCustomer = !!org.stripe_customer_id;

  return (
    <div className="flex flex-col gap-6">
      {params.success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          ✅ Suscripción activada. ¡Bienvenido a tu nuevo plan!
        </div>
      )}
      {params.canceled && (
        <div className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          El proceso de pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
        </div>
      )}

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Plan actual</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-ink">{PLAN_LABEL[org.plan]}</p>
            {isTrialing && trialEnd && (
              <p className="mt-1 text-xs text-muted">
                Prueba gratuita hasta el{' '}
                {trialEnd.toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {isActive && periodEnd && (
              <p className="mt-1 text-xs text-muted">
                Próximo cobro:{' '}
                {periodEnd.toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isTrialing ? 'warning' : isActive ? 'success' : 'default'}>
              {STATUS_LABEL[org.subscription_status] ?? org.subscription_status}
            </Badge>
            {hasStripeCustomer && <PortalButton />}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Límites del plan</h2>
        <ul className="flex flex-col gap-2">
          {[
            ['Sucursales', limits.branches === Infinity ? 'Ilimitadas' : limits.branches],
            [
              'Clientes',
              limits.customers === Infinity
                ? 'Ilimitados'
                : (limits.customers as number).toLocaleString('es-MX'),
            ],
            [
              'Mensajes WA/mes',
              limits.whatsappMessages === Infinity
                ? 'Ilimitados'
                : (limits.whatsappMessages as number).toLocaleString('es-MX'),
            ],
          ].map(([label, value]) => (
            <li
              key={label as string}
              className="flex items-center justify-between border-b border-rule pb-2 last:border-0 last:pb-0"
            >
              <span className="text-sm text-muted">{label}</span>
              <span className="font-mono text-sm font-medium text-ink">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-rule bg-paper p-5">
        <h2 className="mb-2 font-display text-base font-semibold text-ink">Planes</h2>
        <p className="mb-4 text-sm text-muted">
          Todos los planes incluyen 14 días de prueba gratuita. Sin permanencia.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(['starter', 'pro', 'business'] as const).map((plan) => {
            const isCurrent = org.plan === plan;
            return (
              <div
                key={plan}
                className={`flex flex-col gap-3 rounded-lg border p-4 ${
                  isCurrent ? 'border-accent bg-accent/5' : 'border-rule bg-cream'
                }`}
              >
                <div>
                  <p className="font-display font-semibold text-ink">{PLAN_LABEL[plan]}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink">
                    ${PLAN_PRICES_MXN[plan].toLocaleString('es-MX')}
                    <span className="text-xs font-normal text-muted">/mes</span>
                  </p>
                </div>
                {isCurrent ? (
                  <span className="text-center text-xs font-medium text-accent">Plan actual</span>
                ) : (
                  <CheckoutButton plan={plan} />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
