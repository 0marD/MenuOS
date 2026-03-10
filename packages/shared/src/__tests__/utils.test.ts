import { describe, it, expect } from 'vitest';
import { generateSlug } from '../utils/slug';
import { isValidMexicanMobile, normalizePhone, maskPhone } from '../utils/validate-phone';
import { generatePin, generateOtp } from '../utils/generate-pin';
import { formatMXN, formatCurrency } from '../utils/format-price';
import { getDaysSince, formatDate, formatTime, getRelativeTime } from '../utils/date-helpers';

// ─── Slug ────────────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  it('converts spaces to hyphens', () => {
    expect(generateSlug('La Cantina')).toBe('la-cantina');
  });

  it('lowercases all characters', () => {
    expect(generateSlug('MI RESTAURANTE')).toBe('mi-restaurante');
  });

  it('removes accents and special characters', () => {
    expect(generateSlug('Café & Barra')).toBe('cafe-barra');
    expect(generateSlug('El Taquería Número Uno')).toBe('el-taqueria-numero-uno');
  });

  it('removes leading/trailing hyphens', () => {
    const slug = generateSlug('  Restaurante  ');
    expect(slug).not.toMatch(/^-|-$/);
  });

  it('collapses consecutive hyphens', () => {
    const slug = generateSlug('A  B   C');
    expect(slug).not.toContain('--');
  });

  it('returns only allowed characters', () => {
    const slug = generateSlug('Taco! @Loco# 2024');
    expect(/^[a-z0-9-]+$/.test(slug)).toBe(true);
  });

  it('handles already valid slugs', () => {
    expect(generateSlug('mi-restaurant')).toBe('mi-restaurant');
  });
});

// ─── Phone validation ─────────────────────────────────────────────────────────

describe('isValidMexicanMobile', () => {
  it('accepts valid +52 numbers', () => {
    expect(isValidMexicanMobile('+525512345678')).toBe(true);
    expect(isValidMexicanMobile('+523312345678')).toBe(true);
  });

  it('rejects numbers without +52 prefix', () => {
    expect(isValidMexicanMobile('5512345678')).toBe(false);
  });

  it('rejects too short', () => {
    expect(isValidMexicanMobile('+52551234567')).toBe(false);
  });

  it('rejects 0 after +52', () => {
    expect(isValidMexicanMobile('+5205512345678')).toBe(false);
  });
});

describe('normalizePhone', () => {
  it('adds +52 to 10-digit number', () => {
    expect(normalizePhone('5512345678')).toBe('+525512345678');
  });

  it('adds + to 12-digit number starting with 52', () => {
    expect(normalizePhone('525512345678')).toBe('+525512345678');
  });
});

describe('maskPhone', () => {
  it('shows only last 4 digits', () => {
    const masked = maskPhone('+525512345678');
    expect(masked).toMatch(/\*+5678$/);
  });

  it('returns original for very short strings', () => {
    expect(maskPhone('123')).toBe('123');
  });
});

// ─── PIN generation ──────────────────────────────────────────────────────────

describe('generatePin', () => {
  it('returns a 4-digit string', () => {
    const pin = generatePin();
    expect(pin).toHaveLength(4);
    expect(/^\d{4}$/.test(pin)).toBe(true);
  });

  it('generates values between 1000 and 9999', () => {
    for (let i = 0; i < 50; i++) {
      const n = Number(generatePin());
      expect(n).toBeGreaterThanOrEqual(1000);
      expect(n).toBeLessThanOrEqual(9999);
    }
  });

  it('returns different PINs (not always the same)', () => {
    const pins = new Set(Array.from({ length: 20 }, () => generatePin()));
    expect(pins.size).toBeGreaterThan(1);
  });
});

describe('generateOtp', () => {
  it('returns a 4-digit string', () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(4);
    expect(/^\d{4}$/.test(otp)).toBe(true);
  });
});

// ─── Price formatting ────────────────────────────────────────────────────────

describe('formatMXN', () => {
  it('formats positive amounts with MXN currency', () => {
    const result = formatMXN(99);
    expect(result).toContain('99');
    expect(result).toContain('$');
  });

  it('formats zero correctly', () => {
    const result = formatMXN(0);
    expect(result).toContain('0');
  });

  it('formats large amounts with separators', () => {
    const result = formatMXN(1000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('includes two decimal places', () => {
    const result = formatMXN(99.5);
    expect(result).toContain('50');
  });
});

describe('formatCurrency', () => {
  it('defaults to MXN', () => {
    const mxn = formatCurrency(100);
    expect(mxn).toContain('100');
  });

  it('accepts different currencies', () => {
    const usd = formatCurrency(100, 'USD', 'en-US');
    expect(usd).toContain('100');
  });
});

// ─── Date helpers ─────────────────────────────────────────────────────────────

describe('getDaysSince', () => {
  it('returns 0 for right now', () => {
    expect(getDaysSince(new Date())).toBe(0);
  });

  it('returns 5 for 5 days ago', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(getDaysSince(past)).toBe(5);
  });

  it('returns 21 at the dormant threshold', () => {
    const past = new Date();
    past.setDate(past.getDate() - 21);
    expect(getDaysSince(past)).toBe(21);
  });
});

describe('formatDate', () => {
  it('returns a non-empty string', () => {
    const result = formatDate(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('accepts locale parameter', () => {
    const result = formatDate(new Date(), 'en-US');
    expect(typeof result).toBe('string');
  });
});

describe('formatTime', () => {
  it('returns HH:MM formatted string', () => {
    const result = formatTime(new Date());
    expect(/\d{1,2}:\d{2}/.test(result)).toBe(true);
  });
});

describe('getRelativeTime', () => {
  it('returns a non-empty string', () => {
    const result = getRelativeTime(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
