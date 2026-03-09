import { PHONE_MX_REGEX } from '../constants';

export function isValidMexicanMobile(phone: string): boolean {
  return PHONE_MX_REGEX.test(phone);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  return phone;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  const visible = digits.slice(-4);
  return `${'*'.repeat(digits.length - 4)}${visible}`;
}
