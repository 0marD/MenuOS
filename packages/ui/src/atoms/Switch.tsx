'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-rule',
          props.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        aria-hidden="true"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 rounded-full bg-paper shadow transition-transform',
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          )}
        />
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
