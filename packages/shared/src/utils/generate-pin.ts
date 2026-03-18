export function generatePin(length = 4): string {
  const digits = new Uint32Array(length);
  crypto.getRandomValues(digits);
  return Array.from(digits)
    .map((n) => n % 10)
    .join('');
}
