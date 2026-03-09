'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@menuos/ui';

interface MenuUpdateToastProps {
  visible: boolean;
  onRefresh: () => void;
}

export function MenuUpdateToast({ visible, onRefresh }: MenuUpdateToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-300',
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-sans font-medium text-paper shadow-lg"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Menú actualizado · Recargar
      </button>
    </div>
  );
}
