'use client';

import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useTransition } from 'react';
import { Button } from '@menuos/ui';
import { formatMXN } from '@menuos/shared';
import { useCartStore } from './CartStore';
import { placeOrder } from '../actions';

interface CartSheetProps {
  orgId: string;
  branchId: string;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
  onNeedsRegistration: () => void;
  customerId: string | null;
}

export function CartSheet({
  orgId,
  branchId,
  onClose,
  onOrderPlaced,
  onNeedsRegistration,
  customerId,
}: CartSheetProps) {
  const { items, updateQuantity, removeItem, clearCart, total } = useCartStore();
  const [isPending, startTransition] = useTransition();

  const cartTotal = total();
  const isEmpty = items.length === 0;

  function handleOrder() {
    if (!customerId) {
      onNeedsRegistration();
      return;
    }
    startTransition(async () => {
      const tableId = useCartStore.getState().tableId;
      const result = await placeOrder({ orgId, branchId, tableId, customerId, items });
      if (result.orderId) {
        clearCart();
        onOrderPlaced(result.orderId);
      }
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Tu carrito"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col rounded-t-2xl bg-paper shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-rule px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-ink">Tu pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-cream hover:text-ink"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <p className="py-8 text-center text-sm text-muted">Tu carrito está vacío.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    <p className="font-mono text-xs text-muted">{formatMXN(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-rule text-muted hover:bg-cream"
                      aria-label={`Quitar uno de ${item.name}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-rule text-muted hover:bg-cream"
                      aria-label={`Agregar uno de ${item.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-1 rounded-full p-1 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isEmpty && (
          <div className="border-t border-rule px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="font-display text-xl font-bold text-ink">{formatMXN(cartTotal)}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleOrder}
              disabled={isPending}
            >
              {isPending ? 'Enviando pedido…' : 'Hacer pedido'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
