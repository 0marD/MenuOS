import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../lib/utils';
import { Input, type InputProps } from '../atoms/Input';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
}

function FormField({ label, error, hint, required, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1.5">
      <LabelPrimitive.Root
        htmlFor={fieldId}
        className="text-sm font-medium font-sans text-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </LabelPrimitive.Root>
      <Input
        id={fieldId}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        {...props}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted font-sans">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive font-sans" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField };
