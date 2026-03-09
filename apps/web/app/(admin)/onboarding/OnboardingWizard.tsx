'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { cn } from '@menuos/ui';

interface OnboardingWizardProps {
  org: { id: string; name: string; slug: string; logo_url: string | null };
  staffName: string;
  progress: { hasBranch: boolean; hasMenu: boolean; hasLogo: boolean };
}

const APP_DOMAIN = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'menuos.mx';

const STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a MenuOS',
    emoji: '👋',
  },
  {
    id: 'branch',
    title: 'Crea tu primera sucursal',
    emoji: '📍',
  },
  {
    id: 'menu',
    title: 'Agrega tu menú',
    emoji: '🍽️',
  },
  {
    id: 'brand',
    title: 'Personaliza tu marca',
    emoji: '🎨',
  },
  {
    id: 'qr',
    title: 'Tu código QR listo',
    emoji: '📱',
  },
] as const;

export function OnboardingWizard({ org, staffName, progress }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const completedSteps = [
    true,                    // welcome always complete once seen
    progress.hasBranch,
    progress.hasMenu,
    progress.hasLogo,
    true,                    // QR always available
  ];

  const totalDone = completedSteps.filter(Boolean).length;
  const percent = Math.round((totalDone / STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-sm font-sans text-muted">Hola, {staffName} 👋</p>
        <h1 className="font-display text-3xl font-bold text-ink">Configura tu restaurante</h1>
        <p className="mt-1 text-sm font-sans text-muted">Completa estos pasos en menos de 15 minutos</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-muted mb-1">
          <span>{totalDone} de {STEPS.length} pasos</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-cream overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-2 mb-8">
        {STEPS.map((s, i) => {
          const done = completedSteps[i] ?? false;
          const active = i === step;
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all',
                active ? 'border-accent bg-accent/5' : 'border-rule bg-card hover:bg-cream'
              )}
            >
              <span className="text-2xl shrink-0" aria-hidden="true">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('font-sans font-medium', active ? 'text-accent' : 'text-ink')}>
                  {s.title}
                </p>
              </div>
              {done ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-green" aria-label="Completado" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-rule" aria-label="Pendiente" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step detail panel */}
      <div className="rounded-2xl border border-rule bg-card p-6">
        {step === 0 && (
          <div className="space-y-4 text-center">
            <p className="text-4xl" aria-hidden="true">🎉</p>
            <h2 className="font-display text-xl font-bold text-ink">¡Cuenta creada!</h2>
            <p className="text-sm font-sans text-muted max-w-sm mx-auto">
              Tu restaurante <strong>{org.name}</strong> ya está en MenuOS. Completa los siguientes pasos para publicar tu menú digital.
            </p>
            <div className="rounded-xl bg-cream px-4 py-3 text-sm font-mono text-muted">
              Tu URL permanente: <strong className="text-accent">{APP_DOMAIN}/{org.slug}</strong>
            </div>
            <Button onClick={() => setStep(1)} className="w-full">
              Empezar <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-ink">📍 Sucursal</h2>
            <p className="text-sm font-sans text-muted">
              Crea al menos una sucursal para que el sistema pueda asociar pedidos y horarios.
            </p>
            {progress.hasBranch ? (
              <div className="flex items-center gap-2 rounded-xl bg-green/10 px-4 py-3">
                <CheckCircle className="h-5 w-5 text-green" aria-hidden="true" />
                <p className="text-sm font-sans text-green font-medium">Sucursal configurada</p>
              </div>
            ) : (
              <p className="text-sm font-sans text-muted rounded-xl bg-cream px-4 py-3">
                Aún no tienes sucursales. Crea una desde Configuración → Sucursales.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <a href="/admin/settings/branches">Ir a Sucursales</a>
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Siguiente <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-ink">🍽️ Menú</h2>
            <p className="text-sm font-sans text-muted">
              Agrega categorías y platillos con precios y fotos.
            </p>
            {progress.hasMenu ? (
              <div className="flex items-center gap-2 rounded-xl bg-green/10 px-4 py-3">
                <CheckCircle className="h-5 w-5 text-green" aria-hidden="true" />
                <p className="text-sm font-sans text-green font-medium">Menú con contenido</p>
              </div>
            ) : (
              <p className="text-sm font-sans text-muted rounded-xl bg-cream px-4 py-3">
                Tu menú está vacío. Empieza creando categorías y platillos.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <a href="/admin/menu">Editar menú</a>
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Siguiente <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-ink">🎨 Marca</h2>
            <p className="text-sm font-sans text-muted">
              Sube tu logo y elige los colores de tu restaurante para que el menú refleje tu identidad.
            </p>
            {progress.hasLogo ? (
              <div className="flex items-center gap-2 rounded-xl bg-green/10 px-4 py-3">
                <CheckCircle className="h-5 w-5 text-green" aria-hidden="true" />
                <p className="text-sm font-sans text-green font-medium">Logo configurado</p>
              </div>
            ) : (
              <p className="text-sm font-sans text-muted rounded-xl bg-cream px-4 py-3">
                Aún no tienes logo. Añádelo desde Configuración → Marca.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <a href="/admin/settings/brand">Configurar marca</a>
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Siguiente <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <p className="text-4xl" aria-hidden="true">📱</p>
            <h2 className="font-display text-xl font-bold text-ink">¡Tu menú está listo!</h2>
            <p className="text-sm font-sans text-muted max-w-sm mx-auto">
              Comparte este enlace o código QR con tus clientes. Imprímelo y ponlo en cada mesa.
            </p>
            <div className="rounded-xl bg-cream px-4 py-3 text-sm font-mono text-accent font-bold">
              {APP_DOMAIN}/{org.slug}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <a href="/admin/qr">Ver mi QR</a>
              </Button>
              <Button onClick={() => router.push('/admin/dashboard')} className="flex-1">
                Ir al dashboard
              </Button>
            </div>
            <p className="text-xs font-sans text-muted">
              Puedes volver a esta guía en cualquier momento desde el menú de ayuda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
