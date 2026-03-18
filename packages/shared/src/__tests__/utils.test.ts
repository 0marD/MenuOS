import { describe, it, expect } from 'vitest';
import { generateSlug } from '../utils/slug';
import { isValidMexicanMobile, normalizePhone } from '../utils/validate-phone';
import { generatePin } from '../utils/generate-pin';
import { formatMXN, formatPrice } from '../utils/format-price';
import { daysSince, formatDate, formatRelativeDate } from '../utils/date-helpers';

// ─── Slug ─────────────────────────────────────────────────────────────────────

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

  it('rejects too short numbers', () => {
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

// ─── PIN generation ──────────────────────────────────────────────────────────

describe('generatePin', () => {
  it('returns a 4-digit string by default', () => {
    const pin = generatePin();
    expect(pin).toHaveLength(4);
    expect(/^\d{4}$/.test(pin)).toBe(true);
  });

  it('returns different PINs (not always the same)', () => {
    const pins = new Set(Array.from({ length: 20 }, () => generatePin()));
    expect(pins.size).toBeGreaterThan(1);
  });

  it('respects custom length', () => {
    const pin = generatePin(6);
    expect(pin).toHaveLength(6);
    expect(/^\d{6}$/.test(pin)).toBe(true);
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

  it('includes two decimal places', () => {
    const result = formatMXN(99.5);
    expect(result).toContain('50');
  });
});

describe('formatPrice', () => {
  it('defaults to MXN', () => {
    const mxn = formatPrice(100);
    expect(mxn).toContain('100');
  });

  it('accepts different currencies', () => {
    const usd = formatPrice(100, 'USD');
    expect(usd).toContain('100');
  });
});

// ─── Date helpers ─────────────────────────────────────────────────────────────

describe('daysSince', () => {
  it('returns 0 for right now', () => {
    expect(daysSince(new Date())).toBe(0);
  });

  it('returns 5 for 5 days ago', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(daysSince(past)).toBe(5);
  });

  it('returns 21 at the dormant threshold', () => {
    const past = new Date();
    past.setDate(past.getDate() - 21);
    expect(daysSince(past)).toBe(21);
  });
});

describe('formatDate', () => {
  it('returns a non-empty string', () => {
    const result = formatDate(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRelativeDate', () => {
  it('returns "Hoy" for today', () => {
    expect(formatRelativeDate(new Date())).toBe('Hoy');
  });

  it('returns "Ayer" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe('Ayer');
  });

  it('returns a non-empty string for older dates', () => {
    const old = new Date();
    old.setDate(old.getDate() - 30);
    const result = formatRelativeDate(old);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
