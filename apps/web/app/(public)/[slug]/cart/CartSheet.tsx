'use client';

import { useState, useTransition } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn } from '@menuos/ui';
import { useCartStore } from './CartStore';
import { placeOrder } from '../actions';

interface CartSheetProps {
  slug: string;
  orgId: string;
  branchId: string;
  tableToken?: string;
  tableNumber?: number;
}

export function CartSheet({ slug, orgId, branchId, tableToken, tableNumber }: CartSheetProps) {
  const { items, updateQuantity, removeItem, total, clear } = useCartStore();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNotes, setTableNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (itemCount === 0 && !open) return null;

  if (orderId) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 bg-paper px-5 pb-8 pt-5 rounded-t-2xl shadow-2xl text-center">
        <span className="text-4xl" aria-hidden="true">🎉</span>
        <p className="mt-2 font-display text-xl font-bold text-ink">¡Pedido enviado!</p>
        <p className="mt-1 text-sm font-sans text-muted">
          Tu pedido está siendo preparado. El mesero te atenderá en breve.
        </p>
        <button
          onClick={() => { clear(); setOrderId(null); setOpen(false); }}
          className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white"
        >
          Ver menú
        </button>
      </div>
    );
  }

  return (
    <>
      {/* FAB */}
      {!open && itemCount > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-white shadow-lg"
          aria-label={`Ver carrito · ${itemCount} artículo${itemCount !== 1 ? 's' : ''}`}
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold">{itemCount}</span>
          <span className="font-medium">${total().toFixed(2)}</span>
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      {/* Sheet */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tu pedido"
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-2xl bg-paper shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-rule px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">Tu pedido</h2>
            <button onClick={() => setOpen(false)} aria-label="Cerrar carrito">
              <X className="h-5 w-5 text-muted" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {error && (
              <div role="alert" className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Table info */}
            {tableNumber && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-cream px-3 py-2">
                <span className="text-sm font-sans text-muted">Mesa</span>
                <span className="font-display text-lg font-bold text-ink">{tableNumber}</span>
              </div>
            )}

            {/* Items */}
            <ul className="space-y-3" aria-label="Artículos en el carrito">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-rule bg-cream">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label={`Quitar uno de ${item.name}`}
                    >
                      <Minus className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center font-mono text-sm font-bold text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label={`Agregar uno más de ${item.name}`}
                    >
                      <Plus className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-sans font-medium text-ink">{item.name}</p>
                  </div>
                  <span className="shrink-0 text-sm font-mono text-muted">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Name */}
            <div className="mt-5">
              <label htmlFor="customer-name" className="mb-1 block text-xs font-medium text-muted">
                Tu nombre (opcional)
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Para el mesero..."
                className="h-9 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Notes */}
            <div className="mt-3">
              <label htmlFor="order-notes" className="mb-1 block text-xs font-medium text-muted">
                Nota para la cocina (opcional)
              </label>
              <textarea
                id="order-notes"
                rows={2}
                value={tableNotes}
                onChange={(e) => setTableNotes(e.target.value)}
                placeholder="Alergias, preferencias..."
                className="w-full resize-none rounded-lg border border-rule bg-cream px-3 py-2 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-rule px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-sans text-sm text-muted">Total</span>
              <span className="font-display text-xl font-bold text-ink">${total().toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await placeOrder({
                    orgId,
                    branchId,
                    tableToken: tableToken ?? null,
                    tableNumber: tableNumber ?? null,
                    customerName: customerName.trim() || null,
                    notes: tableNotes.trim() || null,
                    items: items.map((i) => ({
                      menu_item_id: i.id,
                      name: i.name,
                      price: i.price,
                      quantity: i.quantity,
                      notes: i.notes ?? null,
                    })),
                  });
                  if (result.success && result.orderId) {
                    setOrderId(result.orderId);
                  } else {
                    setError(result.error ?? 'Error al enviar el pedido');
                  }
                });
              }}
              disabled={isPending || items.length === 0}
              className="w-full rounded-xl bg-accent py-3 text-base font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
            >
              {isPending ? 'Enviando pedido...' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
