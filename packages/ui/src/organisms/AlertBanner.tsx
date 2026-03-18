import * as React from 'react';
import { cn } from '../lib/utils';

interface AlertBannerProps {
  title: string;
  description?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles = {
  info: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
  warning: 'bg-highlight/20 border-highlight/40 text-ink',
  success: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  error: 'bg-red-50 border-red-200 text-red-700',
};

export function AlertBanner({
  title,
  description,
  variant = 'info',
  action,
  onDismiss,
  className,
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start justify-between gap-4 rounded border px-4 py-3',
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Cerrar alerta"
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
