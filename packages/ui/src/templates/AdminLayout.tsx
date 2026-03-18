import * as React from 'react';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function AdminLayout({ sidebar, header, children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <aside className="hidden w-64 shrink-0 border-r border-rule lg:flex lg:flex-col">
        {sidebar}
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-rule bg-paper">{header}</header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
