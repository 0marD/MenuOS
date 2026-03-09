import type { Metadata } from 'next';
import { PinLoginForm } from './PinLoginForm';

export const metadata: Metadata = {
  title: 'Acceso — MenuOS',
};

export default function PinPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">MenuOS</h1>
          <p className="mt-1 text-sm font-sans text-muted">Ingresa tu PIN de 4 dígitos</p>
        </div>
        <PinLoginForm />
      </div>
    </main>
  );
}
