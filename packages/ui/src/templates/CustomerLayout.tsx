import * as React from 'react';

interface CustomerLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  primaryColor?: string;
}

export function CustomerLayout({
  header,
  children,
  footer,
  primaryColor,
}: CustomerLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col bg-paper"
      style={primaryColor ? ({ '--accent': primaryColor } as React.CSSProperties) : undefined}
    >
      <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-rule">
        {header}
      </header>
      <main className="flex-1">{children}</main>
      {footer && <footer className="border-t border-rule bg-paper">{footer}</footer>}
    </div>
  );
}
