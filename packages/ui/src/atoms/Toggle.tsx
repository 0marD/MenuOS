'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as React from 'react';
import { cn } from '../lib/utils';

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  label?: string;
}

export const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, label, children, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded border border-rule bg-paper px-3 py-2 text-sm font-medium text-muted transition-colors',
      'hover:bg-cream hover:text-ink',
      'data-[state=on]:bg-accent data-[state=on]:text-white data-[state=on]:border-accent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    aria-label={label}
    {...props}
  >
    {children}
  </TogglePrimitive.Root>
));

Toggle.displayName = 'Toggle';
