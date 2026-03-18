'use client';

import { useTransition } from 'react';
import { Button } from '@menuos/ui';
import type { Plan } from '@menuos/shared';
import { createCheckoutSession, createPortalSession } from './actions';

interface CheckoutButtonProps {
  plan: Plan;
}

export function CheckoutButton({ plan }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleUpgrade() {
    startTransition(async () => {
      await createCheckoutSession(plan);
    });
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className="w-full"
      disabled={isPending}
      onClick={handleUpgrade}
    >
      {isPending ? 'Redirigiendo…' : 'Contratar'}
    </Button>
  );
}

export function PortalButton() {
  const [isPending, startTransition] = useTransition();

  function handlePortal() {
    startTransition(async () => {
      await createPortalSession();
    });
  }

  return (
    <Button size="sm" variant="secondary" disabled={isPending} onClick={handlePortal}>
      {isPending ? 'Cargando…' : 'Gestionar suscripción'}
    </Button>
  );
}
