import * as React from 'react';
import { cn } from '../lib/utils';

interface CustomerLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function CustomerLayout({ header, children, footer, className }: CustomerLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-paper', className)}>
      {header}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      {footer}
    </div>
  );
}

export { CustomerLayout };
