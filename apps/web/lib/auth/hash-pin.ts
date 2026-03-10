'use server';

/**
 * Hashes a 4-digit PIN using PBKDF2-SHA256 with 100,000 iterations.
 * Much stronger than plain SHA-256: adds cost factor and requires PIN_SALT env var.
 */
export async function hashPin(pin: string): Promise<string> {
  const salt = process.env['PIN_SALT'];
  if (!salt || salt.length < 16) {
    throw new Error('PIN_SALT env var must be set and at least 16 characters long');
  }

  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
