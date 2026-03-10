import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  pinLoginSchema,
  customerRegistrationSchema,
  forgotPasswordSchema,
} from '../validations/auth.schema';
import {
  menuCategorySchema,
  menuItemSchema,
} from '../validations/menu.schema';
import {
  organizationSchema,
  orgBrandSchema,
  branchSchema,
  staffUserSchema,
} from '../validations/organization.schema';
import { campaignSchema } from '../validations/campaign.schema';
import { loyaltyProgramSchema } from '../validations/loyalty.schema';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'admin@test.com', password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password1' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'admin@test.com', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Juan',
    email: 'juan@test.com',
    password: 'Password1',
    orgName: 'La Cantina',
  };

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'password1' }).success).toBe(false);
  });

  it('rejects password without digit', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Passwordone' }).success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'PASSWORD1' }).success).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false);
  });

  it('rejects empty orgName', () => {
    expect(registerSchema.safeParse({ ...valid, orgName: '' }).success).toBe(false);
  });
});

describe('pinLoginSchema', () => {
  it('accepts a valid 4-digit PIN and branch UUID', () => {
    const result = pinLoginSchema.safeParse({
      pin: '1234',
      branch_id: '00000000-0000-0000-0000-000000000001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric PIN', () => {
    expect(pinLoginSchema.safeParse({ pin: 'abcd', branch_id: '00000000-0000-0000-0000-000000000001' }).success).toBe(false);
  });

  it('rejects PIN with wrong length', () => {
    expect(pinLoginSchema.safeParse({ pin: '12345', branch_id: '00000000-0000-0000-0000-000000000001' }).success).toBe(false);
    expect(pinLoginSchema.safeParse({ pin: '123', branch_id: '00000000-0000-0000-0000-000000000001' }).success).toBe(false);
  });

  it('rejects invalid branch UUID', () => {
    expect(pinLoginSchema.safeParse({ pin: '1234', branch_id: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('customerRegistrationSchema', () => {
  const valid = { name: 'María', phone: '+525512345678', consent: true as const };

  it('accepts valid customer data', () => {
    expect(customerRegistrationSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects phone without +52 prefix', () => {
    expect(customerRegistrationSchema.safeParse({ ...valid, phone: '5512345678' }).success).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(customerRegistrationSchema.safeParse({ ...valid, name: 'M' }).success).toBe(false);
  });

  it('rejects consent=false', () => {
    expect(customerRegistrationSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'test@example.com' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-email' }).success).toBe(false);
  });
});

// ─── Menu Schemas ─────────────────────────────────────────────────────────────

describe('menuCategorySchema', () => {
  it('accepts valid category', () => {
    const result = menuCategorySchema.safeParse({ name: 'Tacos', sort_order: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(menuCategorySchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects invalid color hex', () => {
    expect(menuCategorySchema.safeParse({ name: 'Tacos', color: 'red' }).success).toBe(false);
    expect(menuCategorySchema.safeParse({ name: 'Tacos', color: '#FF0000' }).success).toBe(true);
  });
});

describe('menuItemSchema', () => {
  const valid = { name: 'Taco al pastor', price: 35, sort_order: 0 };

  it('accepts valid menu item', () => {
    expect(menuItemSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects negative price', () => {
    expect(menuItemSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });

  it('rejects zero price', () => {
    expect(menuItemSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
  });

  it('rejects price above max', () => {
    expect(menuItemSchema.safeParse({ ...valid, price: 100000 }).success).toBe(false);
  });

  it('accepts valid filters', () => {
    expect(menuItemSchema.safeParse({ ...valid, filters: ['vegetariano', 'sin_gluten'] }).success).toBe(true);
  });

  it('rejects invalid filter values', () => {
    expect(menuItemSchema.safeParse({ ...valid, filters: ['kosher'] }).success).toBe(false);
  });
});

// ─── Organization Schemas ────────────────────────────────────────────────────

describe('organizationSchema', () => {
  it('accepts valid org data', () => {
    const result = organizationSchema.safeParse({
      name: 'La Cantina',
      slug: 'la-cantina',
      plan: 'starter',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug (spaces)', () => {
    expect(organizationSchema.safeParse({ name: 'X', slug: 'la cantina', plan: 'starter' }).success).toBe(false);
  });

  it('rejects invalid plan', () => {
    expect(organizationSchema.safeParse({ name: 'X', slug: 'x', plan: 'enterprise' }).success).toBe(false);
  });
});

describe('orgBrandSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(orgBrandSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid URL for logo', () => {
    expect(orgBrandSchema.safeParse({ logo_url: 'https://cdn.example.com/logo.png' }).success).toBe(true);
  });

  it('rejects non-URL for logo', () => {
    expect(orgBrandSchema.safeParse({ logo_url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects invalid color hex', () => {
    expect(orgBrandSchema.safeParse({ colors: { primary: 'red' } }).success).toBe(false);
    expect(orgBrandSchema.safeParse({ colors: { primary: '#D4500A' } }).success).toBe(true);
  });
});

describe('branchSchema', () => {
  it('accepts valid branch', () => {
    expect(branchSchema.safeParse({ name: 'Centro', timezone: 'America/Mexico_City' }).success).toBe(true);
  });

  it('rejects short name', () => {
    expect(branchSchema.safeParse({ name: 'X' }).success).toBe(false);
  });
});

describe('staffUserSchema', () => {
  it('accepts valid staff member', () => {
    expect(staffUserSchema.safeParse({ name: 'Carlos', role: 'waiter' }).success).toBe(true);
  });

  it('rejects invalid role', () => {
    expect(staffUserSchema.safeParse({ name: 'Carlos', role: 'owner' }).success).toBe(false);
  });

  it('rejects invalid UUID for branch_id', () => {
    expect(staffUserSchema.safeParse({ name: 'Carlos', role: 'waiter', branch_id: 'bad-id' }).success).toBe(false);
  });
});

// ─── Campaign Schema ─────────────────────────────────────────────────────────

describe('campaignSchema', () => {
  const valid = {
    name: 'Promo verano',
    message: 'Hola {{nombre}}, tenemos una oferta para ti!',
    segment: 'all' as const,
  };

  it('accepts valid campaign', () => {
    expect(campaignSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects short message', () => {
    expect(campaignSchema.safeParse({ ...valid, message: 'corto' }).success).toBe(false);
  });

  it('rejects invalid segment', () => {
    expect(campaignSchema.safeParse({ ...valid, segment: 'vip' }).success).toBe(false);
  });

  it('accepts empty scheduled_at as null', () => {
    const result = campaignSchema.safeParse({ ...valid, scheduled_at: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.scheduled_at).toBeNull();
  });

  it('rejects message over 1024 characters', () => {
    expect(campaignSchema.safeParse({ ...valid, message: 'a'.repeat(1025) }).success).toBe(false);
  });
});

// ─── Loyalty Schema ───────────────────────────────────────────────────────────

describe('loyaltyProgramSchema', () => {
  const valid = {
    name: 'Tarjeta de sellos',
    stamps_required: 8,
    reward_type: 'free_item' as const,
    reward_value: 'Café americano gratis',
    expiration_days: 90,
  };

  it('accepts valid loyalty program', () => {
    expect(loyaltyProgramSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects stamps_required below 5', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, stamps_required: 4 }).success).toBe(false);
  });

  it('rejects stamps_required above 12', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, stamps_required: 13 }).success).toBe(false);
  });

  it('rejects invalid reward_type', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, reward_type: 'points' }).success).toBe(false);
  });

  it('transforms expiration_days=0 to null', () => {
    const result = loyaltyProgramSchema.safeParse({ ...valid, expiration_days: 0 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.expiration_days).toBeNull();
  });

  it('accepts null expiration_days', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, expiration_days: null }).success).toBe(true);
  });
});
