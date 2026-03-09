import * as React from 'react';
import { X, AlertTriangle, Info, CheckCircle, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

type AlertVariant = 'info' | 'warning' | 'success' | 'offline';

interface AlertBannerProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<AlertVariant, { icon: React.ElementType; className: string }> = {
  info: { icon: Info, className: 'bg-blue/10 text-blue border-blue/20' },
  warning: { icon: AlertTriangle, className: 'bg-highlight/20 text-ink border-highlight/40' },
  success: { icon: CheckCircle, className: 'bg-green/10 text-green border-green/20' },
  offline: { icon: WifiOff, className: 'bg-muted/10 text-muted border-rule' },
};

function AlertBanner({ variant = 'info', message, onDismiss, className }: AlertBannerProps) {
  const { icon: Icon, className: variantClass } = variantConfig[variant];

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-sans',
        variantClass,
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Cerrar"
          className="ml-1 rounded p-0.5 opacity-70 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export { AlertBanner };
