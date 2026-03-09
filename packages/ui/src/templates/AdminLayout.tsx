import * as React from 'react';
import { cn } from '../lib/utils';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function AdminLayout({ sidebar, header, children, className }: AdminLayoutProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-paper', className)}>
      {sidebar}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

export { AdminLayout };
