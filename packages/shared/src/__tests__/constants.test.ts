import { describe, it, expect } from 'vitest';
import {
  ROLES,
  STAFF_ROLES,
  ADMIN_ROLES,
  hasPermission,
  PLANS,
  PLAN_LIMITS,
  PLAN_PRICES_MXN,
  TRIAL_DAYS,
  SEGMENTS,
  DORMANT_THRESHOLD_DAYS,
  FREQUENT_VISIT_THRESHOLD,
  ORDER_STATUS,
  ACTIVE_ORDER_STATUSES,
  KDS_ALERT_MINUTES,
} from '../constants';

// ─── Roles & Permissions ─────────────────────────────────────────────────────

describe('ROLES', () => {
  it('contains the four expected roles', () => {
    expect(Object.values(ROLES)).toContain('super_admin');
    expect(Object.values(ROLES)).toContain('manager');
    expect(Object.values(ROLES)).toContain('waiter');
    expect(Object.values(ROLES)).toContain('kitchen');
    expect(Object.values(ROLES)).toHaveLength(4);
  });

  it('STAFF_ROLES and ADMIN_ROLES are subsets of ROLES values', () => {
    const allRoles = Object.values(ROLES);
    for (const r of STAFF_ROLES) expect(allRoles).toContain(r);
    for (const r of ADMIN_ROLES) expect(allRoles).toContain(r);
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
  it('has starter, pro, and business plan values', () => {
    expect(Object.values(PLANS)).toContain('starter');
    expect(Object.values(PLANS)).toContain('pro');
    expect(Object.values(PLANS)).toContain('business');
  });
});

describe('PLAN_LIMITS', () => {
  it('starter has lowest branch limit', () => {
    expect(PLAN_LIMITS.starter.branches).toBeLessThan(PLAN_LIMITS.pro.branches as number);
  });

  it('starter has fewer WhatsApp messages than pro', () => {
    expect(PLAN_LIMITS.starter.whatsappMessages).toBeLessThan(PLAN_LIMITS.pro.whatsappMessages as number);
  });

  it('business plan has unlimited messages and customers', () => {
    expect(PLAN_LIMITS.business.whatsappMessages).toBe(Infinity);
    expect(PLAN_LIMITS.business.customers).toBe(Infinity);
  });

  it('starter plan does not have orders feature', () => {
    expect(PLAN_LIMITS.starter.hasOrders).toBe(false);
  });

  it('pro and business plans have orders feature', () => {
    expect(PLAN_LIMITS.pro.hasOrders).toBe(true);
    expect(PLAN_LIMITS.business.hasOrders).toBe(true);
  });
});

describe('PLAN_PRICES_MXN', () => {
  it('prices increase from starter to business', () => {
    expect(PLAN_PRICES_MXN.starter).toBeLessThan(PLAN_PRICES_MXN.pro);
    expect(PLAN_PRICES_MXN.pro).toBeLessThan(PLAN_PRICES_MXN.business);
  });

  it('trial period is 14 days', () => {
    expect(TRIAL_DAYS).toBe(14);
  });
});

// ─── Customer Segments ───────────────────────────────────────────────────────

describe('SEGMENTS', () => {
  it('has new, frequent, and dormant', () => {
    expect(Object.values(SEGMENTS)).toContain('new');
    expect(Object.values(SEGMENTS)).toContain('frequent');
    expect(Object.values(SEGMENTS)).toContain('dormant');
  });

  it('dormant threshold is 21 days', () => {
    expect(DORMANT_THRESHOLD_DAYS).toBe(21);
  });

  it('frequent threshold is 3 visits', () => {
    expect(FREQUENT_VISIT_THRESHOLD).toBe(3);
  });
});

// ─── Order Statuses ──────────────────────────────────────────────────────────

describe('ORDER_STATUS', () => {
  it('contains all expected statuses', () => {
    const statuses = Object.values(ORDER_STATUS);
    expect(statuses).toContain('pending');
    expect(statuses).toContain('confirmed');
    expect(statuses).toContain('preparing');
    expect(statuses).toContain('ready');
    expect(statuses).toContain('delivered');
    expect(statuses).toContain('cancelled');
  });
});

describe('ACTIVE_ORDER_STATUSES', () => {
  it('does not include terminal statuses', () => {
    expect(ACTIVE_ORDER_STATUSES).not.toContain('delivered');
    expect(ACTIVE_ORDER_STATUSES).not.toContain('cancelled');
  });

  it('includes all intermediate statuses', () => {
    expect(ACTIVE_ORDER_STATUSES).toContain('pending');
    expect(ACTIVE_ORDER_STATUSES).toContain('confirmed');
    expect(ACTIVE_ORDER_STATUSES).toContain('preparing');
    expect(ACTIVE_ORDER_STATUSES).toContain('ready');
  });
});

describe('KDS_ALERT_MINUTES', () => {
  it('is 15 minutes', () => {
    expect(KDS_ALERT_MINUTES).toBe(15);
  });
});
