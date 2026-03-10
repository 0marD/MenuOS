import { describe, it, expect } from 'vitest';
import {
  ROLES,
  PERMISSIONS,
  hasPermission,
  PLAN_IDS,
  PLANS,
  getPlanLimit,
  isWithinPlanLimit,
  CUSTOMER_SEGMENTS,
  getSegmentFromVisitCount,
  DORMANT_THRESHOLD_DAYS,
  FREQUENT_VISIT_THRESHOLD,
  ORDER_STATUSES,
  TERMINAL_STATUSES,
  ACTIVE_STATUSES,
  isTerminalStatus,
  getNextStatus,
  MENU_ITEM_FILTERS,
  PHONE_MX_REGEX,
  SLUG_REGEX,
} from '../constants';

// ─── Roles & Permissions ────────────────────────────────────────────────────

describe('ROLES', () => {
  it('contains the four expected roles', () => {
    expect(ROLES).toContain('super_admin');
    expect(ROLES).toContain('manager');
    expect(ROLES).toContain('waiter');
    expect(ROLES).toContain('kitchen');
    expect(ROLES).toHaveLength(4);
  });
});

describe('hasPermission', () => {
  it('super_admin can do everything', () => {
    expect(hasPermission('super_admin', 'menu:read')).toBe(true);
    expect(hasPermission('super_admin', 'billing:read')).toBe(true);
    expect(hasPermission('super_admin', 'crm:export')).toBe(true);
  });

  it('waiter can read orders and grant stamps', () => {
    expect(hasPermission('waiter', 'orders:read')).toBe(true);
    expect(hasPermission('waiter', 'loyalty:grant_stamp')).toBe(true);
  });

  it('waiter cannot access billing or settings', () => {
    expect(hasPermission('waiter', 'billing:read')).toBe(false);
    expect(hasPermission('waiter', 'settings:read')).toBe(false);
    expect(hasPermission('waiter', 'crm:read')).toBe(false);
  });

  it('kitchen can only read and mark orders ready', () => {
    expect(hasPermission('kitchen', 'orders:read')).toBe(true);
    expect(hasPermission('kitchen', 'orders:mark_ready')).toBe(true);
    expect(hasPermission('kitchen', 'orders:confirm')).toBe(false);
    expect(hasPermission('kitchen', 'menu:read')).toBe(false);
  });

  it('manager can read CRM but not billing', () => {
    expect(hasPermission('manager', 'crm:read')).toBe(true);
    expect(hasPermission('manager', 'billing:read')).toBe(false);
  });

  it('wildcard permission matches any action in the category', () => {
    expect(hasPermission('super_admin', 'orders:cancel')).toBe(true);
    expect(hasPermission('super_admin', 'menu:anything')).toBe(true);
  });
});

// ─── Plans ───────────────────────────────────────────────────────────────────

describe('PLANS', () => {
  it('has starter, pro, and business plans', () => {
    expect(PLAN_IDS).toContain('starter');
    expect(PLAN_IDS).toContain('pro');
    expect(PLAN_IDS).toContain('business');
  });

  it('starter has lowest limits', () => {
    expect(PLANS.starter.branches).toBeLessThan(PLANS.pro.branches);
    expect(PLANS.starter.whatsappMessages).toBeLessThan(PLANS.pro.whatsappMessages);
  });

  it('business plan has unlimited messages', () => {
    expect(PLANS.business.whatsappMessages).toBe(Infinity);
    expect(PLANS.business.crmContacts).toBe(Infinity);
  });

  it('getPlanLimit returns correct limit', () => {
    expect(getPlanLimit('starter', 'whatsappMessages')).toBe(PLANS.starter.whatsappMessages);
    expect(getPlanLimit('business', 'whatsappMessages')).toBe(Infinity);
  });

  it('isWithinPlanLimit works correctly', () => {
    expect(isWithinPlanLimit('starter', 'whatsappMessages', 0)).toBe(true);
    expect(isWithinPlanLimit('starter', 'whatsappMessages', PLANS.starter.whatsappMessages)).toBe(false);
    expect(isWithinPlanLimit('business', 'whatsappMessages', 999999)).toBe(true);
  });
});

// ─── Customer Segments ───────────────────────────────────────────────────────

describe('CUSTOMER_SEGMENTS', () => {
  it('has new, frequent, and dormant', () => {
    expect(CUSTOMER_SEGMENTS).toContain('new');
    expect(CUSTOMER_SEGMENTS).toContain('frequent');
    expect(CUSTOMER_SEGMENTS).toContain('dormant');
  });
});

describe('getSegmentFromVisitCount', () => {
  it('new customer with recent visit', () => {
    expect(getSegmentFromVisitCount(1, 0)).toBe('new');
    expect(getSegmentFromVisitCount(2, 5)).toBe('new');
  });

  it('frequent customer', () => {
    expect(getSegmentFromVisitCount(FREQUENT_VISIT_THRESHOLD, 1)).toBe('frequent');
    expect(getSegmentFromVisitCount(10, 10)).toBe('frequent');
  });

  it('dormant overrides visit count', () => {
    expect(getSegmentFromVisitCount(10, DORMANT_THRESHOLD_DAYS)).toBe('dormant');
    expect(getSegmentFromVisitCount(0, 30)).toBe('dormant');
  });

  it('dormant threshold is exactly 21 days', () => {
    expect(DORMANT_THRESHOLD_DAYS).toBe(21);
    expect(getSegmentFromVisitCount(5, 20)).toBe('frequent');
    expect(getSegmentFromVisitCount(5, 21)).toBe('dormant');
  });
});

// ─── Order Statuses ──────────────────────────────────────────────────────────

describe('ORDER_STATUSES', () => {
  it('contains all expected statuses', () => {
    expect(ORDER_STATUSES).toContain('pending');
    expect(ORDER_STATUSES).toContain('confirmed');
    expect(ORDER_STATUSES).toContain('preparing');
    expect(ORDER_STATUSES).toContain('ready');
    expect(ORDER_STATUSES).toContain('delivered');
    expect(ORDER_STATUSES).toContain('cancelled');
  });
});

describe('isTerminalStatus', () => {
  it('delivered and cancelled are terminal', () => {
    expect(isTerminalStatus('delivered')).toBe(true);
    expect(isTerminalStatus('cancelled')).toBe(true);
  });

  it('active statuses are not terminal', () => {
    for (const s of ACTIVE_STATUSES) {
      expect(isTerminalStatus(s)).toBe(false);
    }
  });

  it('TERMINAL_STATUSES and ACTIVE_STATUSES are disjoint', () => {
    const overlap = TERMINAL_STATUSES.filter((s) => ACTIVE_STATUSES.includes(s as never));
    expect(overlap).toHaveLength(0);
  });
});

describe('getNextStatus', () => {
  it('follows the correct order flow', () => {
    expect(getNextStatus('pending')).toBe('confirmed');
    expect(getNextStatus('confirmed')).toBe('preparing');
    expect(getNextStatus('preparing')).toBe('ready');
    expect(getNextStatus('ready')).toBe('delivered');
  });

  it('returns null for terminal statuses', () => {
    expect(getNextStatus('delivered')).toBeNull();
    expect(getNextStatus('cancelled')).toBeNull();
  });
});

// ─── Regex Constants ─────────────────────────────────────────────────────────

describe('SLUG_REGEX', () => {
  it('accepts valid slugs', () => {
    expect(SLUG_REGEX.test('la-cantina')).toBe(true);
    expect(SLUG_REGEX.test('mi-restaurante-123')).toBe(true);
    expect(SLUG_REGEX.test('abc')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(SLUG_REGEX.test('La Cantina')).toBe(false);
    expect(SLUG_REGEX.test('mi_restaurante')).toBe(false);
    expect(SLUG_REGEX.test('café')).toBe(false);
  });
});

describe('PHONE_MX_REGEX', () => {
  it('accepts valid Mexican phone numbers', () => {
    expect(PHONE_MX_REGEX.test('+525512345678')).toBe(true);
    expect(PHONE_MX_REGEX.test('+523312345678')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(PHONE_MX_REGEX.test('5215512345678')).toBe(false);  // missing +
    expect(PHONE_MX_REGEX.test('+521234')).toBe(false);         // too short
    expect(PHONE_MX_REGEX.test('+5200000000000')).toBe(false);  // leading 0
    expect(PHONE_MX_REGEX.test('+5212345678')).toBe(false);     // 9 digits only
  });
});

describe('MENU_ITEM_FILTERS', () => {
  it('contains expected dietary filters', () => {
    expect(MENU_ITEM_FILTERS).toContain('vegetariano');
    expect(MENU_ITEM_FILTERS).toContain('sin_gluten');
    expect(MENU_ITEM_FILTERS).toContain('picante');
    expect(MENU_ITEM_FILTERS).toContain('vegano');
  });
});
