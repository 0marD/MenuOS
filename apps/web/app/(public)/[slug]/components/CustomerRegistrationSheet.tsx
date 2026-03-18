'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, FormField, Input } from '@menuos/ui';
import { sendOtp, verifyOtpAndRegister } from '../actions';

const step1Schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  phone: z
    .string()
    .regex(/^(\+?52)?[1-9]\d{9}$/, 'Número de WhatsApp inválido')
    .transform((v) => v.replace(/\D/g, '').replace(/^52/, '')),
  optIn: z.boolean().default(true),
});

const step2Schema = z.object({
  code: z.string().length(6, 'El código tiene 6 dígitos').regex(/^\d+$/, 'Solo números'),
});

type Step1Input = z.infer<typeof step1Schema>;
type Step2Input = z.infer<typeof step2Schema>;

interface CustomerRegistrationSheetProps {
  orgId: string;
  orgName: string;
  onSuccess: (customerId: string) => void;
  onClose: () => void;
}

export function CustomerRegistrationSheet({
  orgId,
  orgName,
  onSuccess,
  onClose,
}: CustomerRegistrationSheetProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [registrationData, setRegistrationData] = useState<Step1Input | null>(null);
  const [isPending, startTransition] = useTransition();

  const step1Form = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    defaultValues: { optIn: true },
  });

  const step2Form = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
  });

  function onStep1Submit(data: Step1Input) {
    startTransition(async () => {
      const result = await sendOtp(orgId, data.phone);
      if (result.error) {
        step1Form.setError('root', { message: result.error });
        return;
      }
      setRegistrationData(data);
      setStep(2);
    });
  }

  function onStep2Submit(data: Step2Input) {
    if (!registrationData) return;
    startTransition(async () => {
      const result = await verifyOtpAndRegister(
        orgId,
        registrationData.name,
        registrationData.phone,
        data.code,
        registrationData.optIn,
      );
      if (result.error) {
        step2Form.setError('root', { message: result.error });
        return;
      }
      if (result.customerId) {
        onSuccess(result.customerId);
      }
    });
  }

  function handleResend() {
    if (!registrationData) return;
    startTransition(async () => {
      step2Form.clearErrors();
      await sendOtp(orgId, registrationData.phone);
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label="Regístrate para hacer tu pedido"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-paper px-6 pb-8 pt-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-cream hover:text-ink"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 1 ? (
          <>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">Bienvenido</h2>
            <p className="mb-6 text-sm text-muted">
              Regístrate para hacer tu pedido en {orgName}.
            </p>

            <form
              onSubmit={step1Form.handleSubmit(onStep1Submit)}
              className="flex flex-col gap-4"
              noValidate
            >
              <FormField
                label="Tu nombre"
                htmlFor="reg-name"
                error={step1Form.formState.errors.name?.message}
                required
              >
                <Input
                  id="reg-name"
                  autoFocus
                  placeholder="Nombre y apellido"
                  error={!!step1Form.formState.errors.name}
                  {...step1Form.register('name')}
                />
              </FormField>

              <FormField
                label="WhatsApp"
                htmlFor="reg-phone"
                error={step1Form.formState.errors.phone?.message}
                hint="Ej. 5512345678"
                required
              >
                <Input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="5512345678"
                  error={!!step1Form.formState.errors.phone}
                  {...step1Form.register('phone')}
                />
              </FormField>

              <label className="flex items-start gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[var(--accent,#D4500A)]"
                  {...step1Form.register('optIn')}
                />
                <span>
                  Acepto recibir promociones y novedades de {orgName} por WhatsApp. Puedes darte de
                  baja cuando quieras.
                </span>
              </label>

              {step1Form.formState.errors.root && (
                <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                  {step1Form.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
                {isPending ? 'Enviando código…' : 'Continuar'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="mb-1 font-display text-xl font-bold text-ink">Verifica tu número</h2>
            <p className="mb-6 text-sm text-muted">
              Ingresa el código de 6 dígitos que enviamos a tu WhatsApp{' '}
              <span className="font-medium text-ink">{registrationData?.phone}</span>.
            </p>

            <form
              onSubmit={step2Form.handleSubmit(onStep2Submit)}
              className="flex flex-col gap-4"
              noValidate
            >
              <FormField
                label="Código de verificación"
                htmlFor="otp-code"
                error={step2Form.formState.errors.code?.message}
                required
              >
                <Input
                  id="otp-code"
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  error={!!step2Form.formState.errors.code}
                  className="text-center text-2xl tracking-widest"
                  {...step2Form.register('code')}
                />
              </FormField>

              {step2Form.formState.errors.root && (
                <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                  {step2Form.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? 'Verificando…' : 'Verificar'}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-muted hover:text-ink"
                  onClick={() => setStep(1)}
                >
                  ← Cambiar número
                </button>
                <button
                  type="button"
                  className="text-sm text-accent hover:underline"
                  onClick={handleResend}
                  disabled={isPending}
                >
                  Reenviar código
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
