'use client';

import { Download, ExternalLink } from 'lucide-react';
import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@menuos/ui';

interface QrGeneratorProps {
  slug: string;
  orgName: string;
  menuUrl: string;
}

export function QrGenerator({ slug, orgName, menuUrl }: QrGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  function downloadSvg() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-menu-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const SIZE = 512;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `qr-menu-${slug}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(svgUrl);
      });
    };
    img.src = svgUrl;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-xl border border-rule bg-paper p-6">
        <div className="mb-4 text-center">
          <p className="font-display text-lg font-semibold text-ink">{orgName}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">Escanea para ver el menú</p>
        </div>

        <div ref={qrRef} className="flex items-center justify-center rounded-lg bg-white p-4">
          <QRCode value={menuUrl} size={220} level="M" />
        </div>

        <p className="mt-4 text-center font-mono text-xs text-muted break-all">{menuUrl}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={downloadSvg} className="gap-2">
          <Download className="h-4 w-4" />
          Descargar SVG
        </Button>
        <Button variant="outline" onClick={downloadPng} className="gap-2">
          <Download className="h-4 w-4" />
          Descargar PNG
        </Button>
        <Button asChild variant="ghost" className="gap-2">
          <a href={menuUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Ver menú
          </a>
        </Button>
      </div>

      <div className="w-full max-w-md rounded-lg border border-rule bg-cream p-4">
        <p className="mb-1 text-xs font-medium text-ink">URL del menú público</p>
        <p className="break-all font-mono text-sm text-muted">{menuUrl}</p>
      </div>
    </div>
  );
}
