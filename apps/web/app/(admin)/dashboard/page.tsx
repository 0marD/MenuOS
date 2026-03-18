import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import { formatMXN, formatRelativeDate } from '@menuos/shared';

export const metadata: Metadata = { title: 'Dashboard' };

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default async function DashboardPage() {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalCustomers },
    { count: newCustomersToday },
    { count: stampsThisWeek },
    { count: visitsThisWeek },
    { data: activeOrders },
    { data: recentCampaigns },
    { count: dormantCustomers },
  ] = await Promise.all([
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .gte('created_at', today),
    supabase
      .from('stamps')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .gte('created_at', weekAgo),
    supabase
      .from('customer_visits')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .gte('created_at', weekAgo),
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at, restaurant_tables(name)')
      .eq('organization_id', org.id)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('campaigns')
      .select('id, name, status, sent_at, campaign_analytics(total_sent, total_read)')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .eq('segment', 'dormant'),
  ]);

  const metrics = [
    {
      label: 'Total clientes',
      value: totalCustomers?.toLocaleString('es-MX') ?? '0',
      sub: `+${newCustomersToday ?? 0} hoy`,
      href: '/crm',
    },
    {
      label: 'Visitas esta semana',
      value: visitsThisWeek?.toLocaleString('es-MX') ?? '0',
      sub: 'últimos 7 días',
      href: '/crm',
    },
    {
      label: 'Sellos esta semana',
      value: stampsThisWeek?.toLocaleString('es-MX') ?? '0',
      sub: 'últimos 7 días',
      href: '/loyalty',
    },
    {
      label: 'Clientes dormidos',
      value: dormantCustomers?.toLocaleString('es-MX') ?? '0',
      sub: 'sin visita 21+ días',
      href: '/crm',
      alert: (dormantCustomers ?? 0) > 0,
    },
  ];

  const quickActions = [
    { label: 'Editar menú', href: '/menu', icon: '🍽️' },
    { label: 'Ver pedidos', href: '/orders', icon: '🛒' },
    { label: 'Nueva campaña', href: '/campaigns/new', icon: '📣' },
    { label: 'Ver clientes', href: '/crm', icon: '👥' },
    { label: 'Código QR', href: '/qr', icon: '🔲' },
    { label: 'Configuración', href: '/settings/brand', icon: '⚙️' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">{org.name}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={`rounded border bg-paper p-4 transition-colors hover:bg-cream ${
              m.alert ? 'border-amber-300 bg-amber-50 hover:bg-amber-100' : 'border-rule'
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{m.label}</p>
            <p className="mt-1 font-display text-3xl font-black text-ink">{m.value}</p>
            <p className="mt-1 text-[11px] text-muted">{m.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Orders */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Pedidos activos</h2>
            <Link href="/orders" className="text-xs text-accent hover:underline">
              Ver todos →
            </Link>
          </div>
          {activeOrders && activeOrders.length > 0 ? (
            <ul className="space-y-2">
              {activeOrders.map((order) => {
                const table = Array.isArray(order.restaurant_tables)
                  ? order.restaurant_tables[0]
                  : order.restaurant_tables;
                return (
                  <li key={order.id} className="rounded border border-rule bg-paper px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        {table && (
                          <span className="rounded bg-cream px-1.5 py-0.5 font-mono text-[10px] text-muted">
                            Mesa {table.name}
                          </span>
                        )}
                      </div>
                      <span className="font-display text-sm font-bold text-ink">
                        {formatMXN(order.total_amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        {ORDER_STATUS_LABEL[order.status] ?? order.status}
                      </span>
                      <span className="text-xs text-muted">
                        {formatRelativeDate(order.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded border border-rule bg-cream px-4 py-8 text-center">
              <p className="text-sm text-muted">No hay pedidos activos</p>
            </div>
          )}
        </section>

        {/* Recent Campaigns */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Campañas recientes</h2>
            <Link href="/campaigns" className="text-xs text-accent hover:underline">
              Ver todas →
            </Link>
          </div>
          {recentCampaigns && recentCampaigns.length > 0 ? (
            <ul className="space-y-2">
              {recentCampaigns.map((campaign) => {
                const analytics = Array.isArray(campaign.campaign_analytics)
                  ? campaign.campaign_analytics[0]
                  : campaign.campaign_analytics;
                const readRate =
                  analytics?.total_sent && analytics.total_sent > 0
                    ? Math.round((analytics.total_read / analytics.total_sent) * 100)
                    : null;
                return (
                  <li key={campaign.id} className="rounded border border-rule bg-paper px-4 py-3">
                    <p className="text-sm font-medium text-ink">{campaign.name}</p>
                    <div className="mt-1 flex items-center gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {campaign.status}
                      </span>
                      {analytics && (
                        <span className="text-xs text-muted">
                          {analytics.total_sent} enviados
                          {readRate !== null && (
                            <> · <span className="text-green-600">{readRate}% leídos</span></>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded border border-rule bg-cream px-4 py-8 text-center">
              <p className="text-sm text-muted">No hay campañas aún</p>
              <Link
                href="/campaigns/new"
                className="mt-2 inline-block text-sm text-accent hover:underline"
              >
                Crear primera campaña →
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Dormant customer alert */}
      {(dormantCustomers ?? 0) > 10 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-amber-800">
                {dormantCustomers} clientes sin visitar en 21+ días
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Crea una campaña de reactivación para recuperarlos.
              </p>
            </div>
            <Link
              href="/campaigns/new"
              className="shrink-0 rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              Crear campaña
            </Link>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Acciones rápidas</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded border border-rule bg-paper p-4 text-center transition-colors hover:bg-cream"
            >
              <span className="text-2xl" aria-hidden>
                {action.icon}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
