const MEXICAN_MOBILE_REGEX = /^\+52[1-9]\d{9}$/;
const LATAM_MOBILE_REGEX = /^\+[1-9]\d{9,14}$/;

export function isValidMexicanMobile(phone: string): boolean {
  return MEXICAN_MOBILE_REGEX.test(phone);
}

export function isValidLatamMobile(phone: string): boolean {
  return LATAM_MOBILE_REGEX.test(phone);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  return `+${digits}`;
}
