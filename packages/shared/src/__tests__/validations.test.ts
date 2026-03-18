import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  pinSchema,
  forgotPasswordSchema,
} from '../validations/auth.schema';
import {
  categorySchema,
  menuItemSchema,
} from '../validations/menu.schema';
import {
  brandSettingsSchema,
  branchSchema,
  staffMemberSchema,
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

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'admin@test.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Juan',
    email: 'juan@test.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
    restaurantName: 'La Cantina',
  };

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'password1!', confirmPassword: 'password1!' }).success).toBe(false);
  });

  it('rejects password without digit', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Passwordone!', confirmPassword: 'Passwordone!' }).success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'Different1!' }).success).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false);
  });

  it('rejects empty restaurantName', () => {
    expect(registerSchema.safeParse({ ...valid, restaurantName: '' }).success).toBe(false);
  });
});

describe('pinSchema', () => {
  it('accepts a valid 4-digit PIN and branch UUID', () => {
    const result = pinSchema.safeParse({
      pin: '1234',
      branchId: '00000000-0000-0000-0000-000000000001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric PIN', () => {
    expect(pinSchema.safeParse({ pin: 'abcd', branchId: '00000000-0000-0000-0000-000000000001' }).success).toBe(false);
  });

  it('rejects PIN with wrong length', () => {
    expect(pinSchema.safeParse({ pin: '12345', branchId: '00000000-0000-0000-0000-000000000001' }).success).toBe(false);
    expect(pinSchema.safeParse({ pin: '123', branchId: '00000000-0000-0000-0000-000000000001' }).success).toBe(false);
  });

  it('rejects invalid branch UUID', () => {
    expect(pinSchema.safeParse({ pin: '1234', branchId: 'not-a-uuid' }).success).toBe(false);
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

describe('categorySchema', () => {
  it('accepts valid category', () => {
    const result = categorySchema.safeParse({ name: 'Tacos' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects invalid color hex', () => {
    expect(categorySchema.safeParse({ name: 'Tacos', color: 'red' }).success).toBe(false);
    expect(categorySchema.safeParse({ name: 'Tacos', color: '#FF0000' }).success).toBe(true);
  });
});

describe('menuItemSchema', () => {
  const valid = {
    name: 'Taco al pastor',
    base_price: 35,
    category_id: '00000000-0000-0000-0000-000000000001',
  };

  it('accepts valid menu item', () => {
    expect(menuItemSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects negative price', () => {
    expect(menuItemSchema.safeParse({ ...valid, base_price: -1 }).success).toBe(false);
  });

  it('rejects zero price', () => {
    expect(menuItemSchema.safeParse({ ...valid, base_price: 0 }).success).toBe(false);
  });

  it('rejects invalid photo URL', () => {
    expect(menuItemSchema.safeParse({ ...valid, photo_url: 'not-a-url' }).success).toBe(false);
  });

  it('accepts empty string for photo_url', () => {
    expect(menuItemSchema.safeParse({ ...valid, photo_url: '' }).success).toBe(true);
  });

  it('accepts dietary flags', () => {
    expect(menuItemSchema.safeParse({ ...valid, is_vegetarian: true, is_gluten_free: true }).success).toBe(true);
  });
});

// ─── Organization Schemas ─────────────────────────────────────────────────────

describe('brandSettingsSchema', () => {
  it('accepts valid brand data', () => {
    const result = brandSettingsSchema.safeParse({ name: 'La Cantina' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(brandSettingsSchema.safeParse({ name: 'X' }).success).toBe(false);
  });

  it('accepts valid URL for logo', () => {
    expect(brandSettingsSchema.safeParse({ name: 'Test', logo_url: 'https://cdn.example.com/logo.png' }).success).toBe(true);
  });

  it('rejects non-URL for logo', () => {
    expect(brandSettingsSchema.safeParse({ name: 'Test', logo_url: 'not-a-url' }).success).toBe(false);
  });

  it('accepts empty string for logo_url', () => {
    expect(brandSettingsSchema.safeParse({ name: 'Test', logo_url: '' }).success).toBe(true);
  });

  it('rejects invalid color hex', () => {
    expect(brandSettingsSchema.safeParse({ name: 'Test', primary_color: 'red' }).success).toBe(false);
    expect(brandSettingsSchema.safeParse({ name: 'Test', primary_color: '#D4500A' }).success).toBe(true);
  });
});

describe('branchSchema', () => {
  it('accepts valid branch', () => {
    expect(branchSchema.safeParse({ name: 'Centro' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(branchSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('defaults timezone to America/Mexico_City', () => {
    const result = branchSchema.safeParse({ name: 'Centro' });
    if (result.success) expect(result.data.timezone).toBe('America/Mexico_City');
  });
});

describe('staffMemberSchema', () => {
  it('accepts valid staff member', () => {
    expect(staffMemberSchema.safeParse({ name: 'Carlos', role: 'waiter' }).success).toBe(true);
  });

  it('rejects invalid role', () => {
    expect(staffMemberSchema.safeParse({ name: 'Carlos', role: 'owner' }).success).toBe(false);
  });

  it('rejects invalid UUID in branch_ids', () => {
    expect(staffMemberSchema.safeParse({ name: 'Carlos', role: 'waiter', branch_ids: ['bad-id'] }).success).toBe(false);
  });

  it('accepts valid UUID in branch_ids', () => {
    expect(staffMemberSchema.safeParse({
      name: 'Carlos',
      role: 'waiter',
      branch_ids: ['00000000-0000-0000-0000-000000000001'],
    }).success).toBe(true);
  });
});

// ─── Campaign Schema ──────────────────────────────────────────────────────────

describe('campaignSchema', () => {
  const valid = {
    name: 'Promo verano',
    template_name: 'promo_verano',
    segment: 'all' as const,
  };

  it('accepts valid campaign', () => {
    expect(campaignSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing template_name', () => {
    const { template_name: _, ...withoutTemplate } = valid;
    expect(campaignSchema.safeParse(withoutTemplate).success).toBe(false);
  });

  it('rejects invalid segment', () => {
    expect(campaignSchema.safeParse({ ...valid, segment: 'vip' }).success).toBe(false);
  });

  it('accepts all valid segments', () => {
    for (const segment of ['all', 'new', 'frequent', 'dormant'] as const) {
      expect(campaignSchema.safeParse({ ...valid, segment }).success).toBe(true);
    }
  });

  it('accepts optional message_body', () => {
    expect(campaignSchema.safeParse({ ...valid, message_body: 'Hola!' }).success).toBe(true);
  });
});

// ─── Loyalty Schema ───────────────────────────────────────────────────────────

describe('loyaltyProgramSchema', () => {
  const valid = {
    name: 'Tarjeta de sellos',
    stamps_required: 8,
    reward_type: 'free_item' as const,
    reward_description: 'Café americano gratis',
  };

  it('accepts valid loyalty program', () => {
    expect(loyaltyProgramSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects stamps_required below 3', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, stamps_required: 2 }).success).toBe(false);
  });

  it('rejects stamps_required above 20', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, stamps_required: 21 }).success).toBe(false);
  });

  it('rejects invalid reward_type', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, reward_type: 'points' }).success).toBe(false);
  });

  it('accepts all valid reward types', () => {
    for (const reward_type of ['discount', 'free_item', 'bogo'] as const) {
      expect(loyaltyProgramSchema.safeParse({ ...valid, reward_type }).success).toBe(true);
    }
  });

  it('accepts optional stamps_expiry_days', () => {
    expect(loyaltyProgramSchema.safeParse({ ...valid, stamps_expiry_days: 90 }).success).toBe(true);
  });
});
