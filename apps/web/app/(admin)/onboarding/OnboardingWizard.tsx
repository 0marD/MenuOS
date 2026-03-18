'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@menuos/ui';

interface Step {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

const STEPS: Step[] = [
  {
    id: 'brand',
    title: 'Configura tu marca',
    description: 'Agrega el nombre, logo y colores de tu restaurante.',
    href: '/settings/brand',
    cta: 'Configurar marca',
  },
  {
    id: 'menu',
    title: 'Crea tu menú',
    description: 'Añade categorías y platillos con precios.',
    href: '/menu',
    cta: 'Ir al menú',
  },
  {
    id: 'branch',
    title: 'Agrega tu sucursal',
    description: 'Configura dirección, teléfono y zona horaria.',
    href: '/settings/branches',
    cta: 'Agregar sucursal',
  },
  {
    id: 'qr',
    title: 'Descarga tu QR',
    description: 'Imprime el código QR y colócalo en tus mesas.',
    href: '/qr',
    cta: 'Ver código QR',
  },
  {
    id: 'team',
    title: 'Invita a tu equipo',
    description: 'Crea accesos para meseros y cocina.',
    href: '/settings/team',
    cta: 'Gestionar equipo',
  },
];

interface OnboardingWizardProps {
  completedSteps: string[];
}

export function OnboardingWizard({ completedSteps }: OnboardingWizardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const completed = completedSteps.length;
  const total = STEPS.length;
  const pct = Math.round((completed / total) * 100);

  if (completed === total) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-accent/30 bg-paper">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <div>
          <p className="font-display font-semibold text-ink">Configura tu restaurante</p>
          <p className="text-xs text-muted">{completed} de {total} pasos completados</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted hover:text-ink"
          aria-label="Cerrar guía"
        >
          Cerrar
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-cream">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="divide-y divide-rule">
        {STEPS.map((step, i) => {
          const done = completedSteps.includes(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-5 py-4 ${done ? 'opacity-60' : ''}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  done
                    ? 'bg-accent text-white'
                    : 'border-2 border-rule text-muted'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${done ? 'line-through text-muted' : 'text-ink'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted">{step.description}</p>
              </div>
              {!done && (
                <Button asChild size="sm" variant="outline">
                  <Link href={step.href}>{step.cta}</Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
