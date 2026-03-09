'use client';

import { useState, useEffect, useTransition } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@menuos/ui/atoms/Button';
import { customerRegistrationSchema, type CustomerRegistrationInput } from '@menuos/shared/validations';
import { registerCustomer } from '../actions';

const DISMISS_KEY = 'menuos_reg_dismissed';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24h
const SHOW_DELAY_MS = 10_000;

interface CustomerRegistrationSheetProps {
  orgId: string;
  orgName: string;
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}

export function CustomerRegistrationSheet({ orgId, orgName }: CustomerRegistrationSheetProps) {
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegistrationInput>({
    resolver: zodResolver(customerRegistrationSchema),
    defaultValues: { phone: '+52' },
  });

  useEffect(() => {
    if (isDismissed()) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setDismissed();
    setVisible(false);
  }

  function onSubmit(data: CustomerRegistrationInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await registerCustomer(orgId, data);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setVisible(false), 2500);
      } else {
        setServerError(result.error ?? 'Ocurrió un error, intenta de nuevo');
      }
    });
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-sheet-title"
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-paper px-5 pb-8 pt-5 shadow-2xl"
      >
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-cream"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="text-4xl" aria-hidden="true">🎉</span>
            <p id="reg-sheet-title" className="font-display text-xl font-bold text-ink">
              ¡Bienvenido!
            </p>
            <p className="text-sm font-sans text-muted">
              Ya estás registrado en {orgName}. Acumula visitas y gana recompensas.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">🎁</span>
              <div>
                <p id="reg-sheet-title" className="font-display text-lg font-bold text-ink">
                  ¿Quieres tu sello?
                </p>
                <p className="text-sm font-sans text-muted">
                  Regístrate y acumula visitas para obtener recompensas en {orgName}.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              {serverError && (
                <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="reg-name" className="mb-1 block text-xs font-medium font-sans text-ink">
                  Nombre
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  {...register('name')}
                  className="h-10 w-full rounded-lg border border-rule bg-cream px-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-describedby={errors.name ? 'reg-name-error' : undefined}
                />
                {errors.name && (
                  <p id="reg-name-error" role="alert" className="mt-1 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-phone" className="mb-1 block text-xs font-medium font-sans text-ink">
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageCircle
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+52 55 1234 5678"
                    {...register('phone')}
                    className="h-10 w-full rounded-lg border border-rule bg-cream pl-9 pr-3 text-sm font-sans placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
                  />
                </div>
                {errors.phone && (
                  <p id="reg-phone-error" role="alert" className="mt-1 text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="reg-consent"
                  type="checkbox"
                  {...register('consent')}
                  className="mt-0.5 h-4 w-4 accent-accent"
                  aria-describedby={errors.consent ? 'reg-consent-error' : undefined}
                />
                <label htmlFor="reg-consent" className="text-xs font-sans text-muted leading-relaxed">
                  Acepto recibir mensajes de {orgName} por WhatsApp sobre promociones y mi cuenta de fidelidad.{' '}
                  <a href="/privacidad" className="underline hover:text-ink">
                    Aviso de privacidad
                  </a>
                </label>
              </div>
              {errors.consent && (
                <p id="reg-consent-error" role="alert" className="text-xs text-destructive">
                  {errors.consent.message}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={dismiss}
                  className="flex-1"
                >
                  Ahora no
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? 'Registrando...' : 'Registrarme'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
