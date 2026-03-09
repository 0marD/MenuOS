import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardMetrics } from './components/DashboardMetrics';

export const metadata: Metadata = {
  title: 'Dashboard — MenuOS Admin',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: staffUser } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();
  if (!staffUser) redirect('/auth/login');

  const orgId = staffUser.organization_id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    categoriesResult,
    itemsResult,
    customersResult,
    newCustomersResult,
    campaignsResult,
    sentThisMonthResult,
  ] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .is('deleted_at', null),
    supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_available', true)
      .is('deleted_at', null),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .is('deleted_at', null),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', startOfMonth.toISOString())
      .is('deleted_at', null),
    supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'sent')
      .is('deleted_at', null),
    supabase
      .from('campaigns')
      .select('total_sent')
      .eq('organization_id', orgId)
      .eq('status', 'sent')
      .gte('sent_at', startOfMonth.toISOString()),
  ]);

  const sentThisMonth = (sentThisMonthResult.data ?? []).reduce(
    (sum, c) => sum + (c.total_sent ?? 0),
    0
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Dashboard</h1>
      <DashboardMetrics
        categoryCount={categoriesResult.count ?? 0}
        itemCount={itemsResult.count ?? 0}
        customerCount={customersResult.count ?? 0}
        newCustomersThisMonth={newCustomersResult.count ?? 0}
        campaignsSent={campaignsResult.count ?? 0}
        messagesSentThisMonth={sentThisMonth}
      />

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { href: '/admin/menu', label: 'Editar menú', emoji: '🍽️' },
            { href: '/admin/crm', label: 'Ver clientes', emoji: '👥' },
            { href: '/admin/campaigns/new', label: 'Nueva campaña', emoji: '📣' },
            { href: '/admin/qr', label: 'Mi código QR', emoji: '📱' },
          ].map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border border-rule bg-card p-4 text-center transition-all hover:border-accent hover:bg-cream"
            >
              <span className="text-2xl" aria-hidden="true">{emoji}</span>
              <span className="text-sm font-sans font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
