'use client';

import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MenuUpdateToastProps {
  show: boolean;
  onDismiss: () => void;
}

export function MenuUpdateToast({ show, onDismiss }: MenuUpdateToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2 shadow-lg"
    >
      <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
      <span className="text-xs font-medium text-ink">Menú actualizado</span>
      <button
        onClick={() => { setVisible(false); onDismiss(); }}
        aria-label="Cerrar notificación"
        className="ml-1 text-muted hover:text-ink"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
