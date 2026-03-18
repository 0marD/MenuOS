'use client';

import { useState, useTransition } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@menuos/ui';
import { saveTemplate, resetTemplate } from './actions';

interface Template {
  id: string;
  template_key: string;
  display_name: string;
  message_body: string;
  variables: string[];
  organization_id: string | null;
}

interface TemplatesFormProps {
  templates: Template[];
  orgId: string;
}

export function TemplatesForm({ templates, orgId }: TemplatesFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {templates.map((tpl) => (
        <TemplateCard key={tpl.template_key} template={tpl} orgId={orgId} />
      ))}
    </div>
  );
}

function TemplateCard({ template, orgId }: { template: Template; orgId: string }) {
  const [body, setBody] = useState(template.message_body);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const isCustomized = template.organization_id === orgId;

  function handleSave() {
    setError('');
    startTransition(async () => {
      const result = await saveTemplate(template.template_key, body);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  function handleReset() {
    if (!confirm('¿Restaurar el mensaje original? Se perderá tu personalización.')) return;
    startTransition(async () => {
      await resetTemplate(template.template_key);
    });
  }

  return (
    <section className="rounded-xl border border-rule bg-paper p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink">{template.display_name}</h2>
          <p className="mt-0.5 font-mono text-[10px] text-muted">{template.template_key}</p>
        </div>
        {isCustomized && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs text-muted hover:bg-cream hover:text-ink"
            aria-label="Restaurar mensaje original"
          >
            <RotateCcw className="h-3 w-3" />
            Restaurar
          </button>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {template.variables.map((v) => (
          <span
            key={v}
            className="rounded bg-cream px-1.5 py-0.5 font-mono text-[10px] text-muted"
          >
            {v}
          </span>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value); setSaved(false); }}
        rows={4}
        className="w-full resize-none rounded border border-rule bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label={`Mensaje: ${template.display_name}`}
        maxLength={1024}
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted">{body.length}/1024</span>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600">✓ Guardado</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
          <Button size="sm" onClick={handleSave} disabled={isPending || body === template.message_body}>
            {isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
    </section>
  );
}
