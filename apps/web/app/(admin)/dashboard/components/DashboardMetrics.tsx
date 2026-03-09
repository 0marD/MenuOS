import { UtensilsCrossed, Users, MessageCircle, Send } from 'lucide-react';
import { cn } from '@menuos/ui';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  subValue?: string;
  highlight?: boolean;
}

function MetricCard({ label, value, icon: Icon, subValue, highlight }: MetricCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-4',
      highlight ? 'border-accent bg-accent/5' : 'border-rule bg-card'
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted">{label}</span>
        <Icon className={cn('h-4 w-4', highlight ? 'text-accent' : 'text-muted')} aria-hidden="true" />
      </div>
      <p className={cn('mt-2 font-display text-3xl font-bold', highlight ? 'text-accent' : 'text-ink')}>
        {value}
      </p>
      {subValue && (
        <p className="mt-0.5 text-xs font-sans text-muted">{subValue}</p>
      )}
    </div>
  );
}

interface DashboardMetricsProps {
  categoryCount: number;
  itemCount: number;
  customerCount: number;
  newCustomersThisMonth: number;
  campaignsSent: number;
  messagesSentThisMonth: number;
}

export function DashboardMetrics({
  categoryCount,
  itemCount,
  customerCount,
  newCustomersThisMonth,
  campaignsSent,
  messagesSentThisMonth,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <MetricCard
        label="Categorías"
        value={categoryCount}
        icon={UtensilsCrossed}
        subValue="en el menú"
      />
      <MetricCard
        label="Platillos"
        value={itemCount}
        icon={UtensilsCrossed}
        subValue="disponibles"
      />
      <MetricCard
        label="Clientes"
        value={customerCount}
        icon={Users}
        subValue={newCustomersThisMonth > 0 ? `+${newCustomersThisMonth} este mes` : 'registrados'}
        highlight={newCustomersThisMonth > 0}
      />
      <MetricCard
        label="Nuevos (mes)"
        value={newCustomersThisMonth}
        icon={Users}
        subValue="registros nuevos"
      />
      <MetricCard
        label="Campañas"
        value={campaignsSent}
        icon={MessageCircle}
        subValue="enviadas en total"
      />
      <MetricCard
        label="Msgs (mes)"
        value={messagesSentThisMonth}
        icon={Send}
        subValue="mensajes WhatsApp"
      />
    </div>
  );
}
