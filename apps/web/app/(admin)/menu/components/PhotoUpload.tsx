'use client';

import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { uploadMenuItemPhoto } from '../actions';

interface PhotoUploadProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onError?: (msg: string) => void;
}

export function PhotoUpload({ currentUrl, onUrlChange, onError }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    const fd = new FormData();
    fd.append('file', file);

    startTransition(async () => {
      const result = await uploadMenuItemPhoto(fd);
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);

      if (result.error) {
        onError?.(result.error);
        if (inputRef.current) inputRef.current.value = '';
      } else if (result.url) {
        onUrlChange(result.url);
      }
    });
  }

  function handleRemove() {
    onUrlChange('');
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const preview = localPreview ?? (currentUrl || null);

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className="relative h-36 w-full overflow-hidden rounded-lg border border-rule bg-cream">
          <Image
            src={preview}
            alt="Vista previa del platillo"
            fill
            className="object-cover"
            unoptimized
          />
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          {!isPending && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-ink/60 p-1 text-white hover:bg-ink/80"
              aria-label="Eliminar foto"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-rule bg-cream text-muted transition-colors hover:border-accent/50 hover:text-ink disabled:opacity-50"
          aria-label="Subir foto del platillo"
        >
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Subir foto</span>
              <span className="text-[10px] text-muted">JPG, PNG, WebP · máx 5 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden
      />
    </div>
  );
}
