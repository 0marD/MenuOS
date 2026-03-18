import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-mono text-[10px] uppercase tracking-widest font-medium',
  {
    variants: {
      variant: {
        default: 'bg-accent/10 text-accent px-2 py-0.5 rounded',
        success: 'bg-accent-green/10 text-accent-green px-2 py-0.5 rounded',
        info: 'bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded',
        warning: 'bg-highlight/20 text-ink px-2 py-0.5 rounded',
        muted: 'bg-cream text-muted px-2 py-0.5 rounded',
        outline: 'border border-rule text-muted px-2 py-0.5 rounded',
        destructive: 'bg-red-100 text-red-700 px-2 py-0.5 rounded',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
