import { UtensilsCrossed, Users, MessageCircle } from 'lucide-react';
import { cn } from '@menuos/ui';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  className?: string;
}

function MetricCard({ label, value, icon: Icon, description, className }: MetricCardProps) {
  return (
    <div className={cn('rounded-lg border border-rule bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted">{label}</span>
        <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      {description && (
        <p className="mt-1 text-xs font-sans text-muted">{description}</p>
      )}
    </div>
  );
}

interface DashboardMetricsProps {
  categoryCount: number;
  itemCount: number;
}

export function DashboardMetrics({ categoryCount, itemCount }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard
        label="Categorías"
        value={categoryCount}
        icon={UtensilsCrossed}
        description="en tu menú"
      />
      <MetricCard
        label="Platillos"
        value={itemCount}
        icon={UtensilsCrossed}
        description="disponibles"
      />
      <MetricCard
        label="Clientes"
        value="—"
        icon={Users}
        description="próximamente"
      />
      <MetricCard
        label="Campañas"
        value="—"
        icon={MessageCircle}
        description="próximamente"
      />
    </div>
  );
}
