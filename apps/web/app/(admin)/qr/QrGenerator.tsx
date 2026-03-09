'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@menuos/ui/atoms/Button';
import { Badge } from '@menuos/ui/atoms/Badge';

interface QrGeneratorProps {
  orgName: string;
  slug: string;
}

const QR_SIZE = 256;
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'menuos.mx';

export function QrGenerator({ orgName, slug }: QrGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const menuUrl = `https://${APP_DOMAIN}/${slug}`;

  useEffect(() => {
    renderQr();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function renderQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(canvas, menuUrl, {
        width: QR_SIZE,
        margin: 2,
        color: { dark: '#0F0E0C', light: '#F5F0E8' },
        errorCorrectionLevel: 'H',
      });
    } catch {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#EDE8DC';
        ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
        ctx.fillStyle = '#7A7060';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', QR_SIZE / 2, QR_SIZE / 2);
      }
    }
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `menuos-qr-${slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
      {/* QR Canvas */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl border-4 border-ink bg-paper p-4 shadow-lg">
          <canvas
            ref={canvasRef}
            width={QR_SIZE}
            height={QR_SIZE}
            className="rounded-lg"
            aria-label={`Código QR para el menú de ${orgName}`}
          />
        </div>
        <p className="text-xs font-mono text-muted">{orgName}</p>
      </div>

      {/* Info & Actions */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="rounded-xl border border-rule bg-card p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">URL del menú</p>
          <p className="mt-1 break-all font-mono text-sm text-accent">{menuUrl}</p>
          <Badge variant="outline" className="mt-2 text-[10px]">Permanente — nunca cambia</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleDownload} className="w-full">
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar PNG
          </Button>
          <Button variant="outline" onClick={handleCopyUrl} className="w-full">
            {copied ? (
              <><Check className="h-4 w-4" aria-hidden="true" />Copiado</>
            ) : (
              <><Copy className="h-4 w-4" aria-hidden="true" />Copiar URL</>
            )}
          </Button>
        </div>

        <div className="rounded-xl border border-rule bg-card p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Instrucciones</p>
          <ol className="space-y-1.5 text-xs font-sans text-muted list-decimal pl-4">
            <li>Descarga el código QR en PNG</li>
            <li>Imprime o coloca en tus mesas, mostrador o puerta</li>
            <li>Los clientes escanean y ven tu menú instantáneamente</li>
            <li>Cada vez que actualices el menú, el QR sigue funcionando</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
