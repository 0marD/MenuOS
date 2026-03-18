export const PLANS = {
  STARTER: 'starter',
  PRO: 'pro',
  BUSINESS: 'business',
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export const PLAN_LIMITS = {
  starter: {
    branches: 1,
    customers: 200,
    whatsappMessages: 50,
    automations: 0,
    loyaltyPrograms: 0,
    hasOrders: false,
  },
  pro: {
    branches: 2,
    customers: Infinity,
    whatsappMessages: 500,
    automations: 5,
    loyaltyPrograms: 1,
    hasOrders: true,
  },
  business: {
    branches: 5,
    customers: Infinity,
    whatsappMessages: Infinity,
    automations: Infinity,
    loyaltyPrograms: Infinity,
    hasOrders: true,
  },
} as const satisfies Record<Plan, object>;

export const PLAN_PRICES_MXN = {
  starter: 499,
  pro: 999,
  business: 1899,
} as const satisfies Record<Plan, number>;

export const TRIAL_DAYS = 14;
