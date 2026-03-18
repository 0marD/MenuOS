'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

interface WaiterTabsProps {
  ordersView: ReactNode;
  tablesView: ReactNode;
}

export function WaiterTabs({ ordersView, tablesView }: WaiterTabsProps) {
  const [tab, setTab] = useState<'orders' | 'tables'>('orders');

  return (
    <div>
      <div className="mb-4 flex rounded-lg border border-rule bg-cream p-1">
        <button
          onClick={() => setTab('orders')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'orders'
              ? 'bg-paper text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          Pedidos
        </button>
        <button
          onClick={() => setTab('tables')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'tables'
              ? 'bg-paper text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          Mapa de mesas
        </button>
      </div>

      {tab === 'orders' ? ordersView : tablesView}
    </div>
  );
}
