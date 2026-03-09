import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Crear cuenta — MenuOS',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">MenuOS</h1>
          <p className="mt-1 text-sm font-sans text-muted">
            14 días gratis, sin tarjeta de crédito
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
