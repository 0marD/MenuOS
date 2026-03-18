'use client';

import { useState, useTransition } from 'react';
import { Button, FormField, Input } from '@menuos/ui';
import { saveIntegrationKey } from './actions';

interface IntegrationsFormProps {
  keys: Record<string, string>;
}

type FieldDef = {
  key: string;
  label: string;
  hint: string;
  type?: string;
  placeholder: string;
};

const FIELDS: FieldDef[] = [
  {
    key: 'wa_api_key',
    label: 'API Key de 360dialog',
    hint: 'Encuéntrala en tu panel de 360dialog → API Keys',
    type: 'password',
    placeholder: 'sk_live_...',
  },
  {
    key: 'wa_phone_number_id',
    label: 'Phone Number ID (WhatsApp)',
    hint: 'ID del número verificado en 360dialog',
    placeholder: '120364xxxxxx',
  },
  {
    key: 'wa_webhook_secret',
    label: 'Webhook Secret',
    hint: 'Para verificar los eventos entrantes de 360dialog',
    type: 'password',
    placeholder: 'whsec_...',
  },
];

export function IntegrationsForm({ keys }: IntegrationsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(keys);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(fieldKey: string) {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      const val = values[fieldKey] ?? '';
      const res = await saveIntegrationKey(fieldKey, val);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(fieldKey);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-rule bg-paper p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>💬</span>
          <div>
            <h2 className="font-display text-base font-semibold text-ink">WhatsApp Business (360dialog)</h2>
            <p className="text-xs text-muted">Necesario para enviar campañas y automatizaciones</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <FormField label={field.label} htmlFor={field.key} hint={field.hint}>
                <div className="flex gap-2">
                  <Input
                    id={field.key}
                    type={field.type ?? 'text'}
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSave(field.key)}
                  >
                    {isPending && saved === null ? 'Guardando…' : 'Guardar'}
                  </Button>
                </div>
              </FormField>
              {saved === field.key && (
                <p role="status" className="text-xs text-green-600">✓ Guardado correctamente</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <section className="rounded-xl border border-rule bg-cream p-5">
        <h3 className="mb-2 font-display text-sm font-semibold text-ink">Cómo configurar el webhook</h3>
        <p className="mb-3 text-xs text-muted">
          En tu panel de 360dialog, configura la URL de webhook como:
        </p>
        <code className="block rounded bg-ink/5 px-3 py-2 font-mono text-xs text-ink break-all">
          https://[tu-proyecto].supabase.co/functions/v1/webhook-whatsapp
        </code>
        <p className="mt-2 text-xs text-muted">
          Suscríbete a los eventos: <strong>message_status_updates</strong>
        </p>
      </section>
    </div>
  );
}
