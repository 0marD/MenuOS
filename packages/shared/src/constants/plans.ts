export const PLAN_IDS = ['starter', 'pro', 'business'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const PLANS = {
  starter: {
    id: 'starter' as const,
    name: 'Starter',
    price: 499,
    currency: 'MXN',
    branches: 1,
    crmContacts: 200,
    whatsappMessages: 50,
    automations: 0,
  },
  pro: {
    id: 'pro' as const,
    name: 'Pro',
    price: 999,
    currency: 'MXN',
    branches: 2,
    crmContacts: Infinity,
    whatsappMessages: 500,
    automations: 5,
  },
  business: {
    id: 'business' as const,
    name: 'Business',
    price: 1899,
    currency: 'MXN',
    branches: 5,
    crmContacts: Infinity,
    whatsappMessages: Infinity,
    automations: Infinity,
  },
} as const satisfies Record<PlanId, { id: PlanId; name: string; price: number; currency: string; branches: number; crmContacts: number; whatsappMessages: number; automations: number }>;

export type Plan = (typeof PLANS)[PlanId];

export function getPlanLimit(planId: PlanId, key: keyof Omit<Plan, 'id' | 'name' | 'currency'>): number {
  return PLANS[planId][key];
}

export function isWithinPlanLimit(planId: PlanId, key: keyof Omit<Plan, 'id' | 'name' | 'currency'>, current: number): boolean {
  const limit = getPlanLimit(planId, key);
  return limit === Infinity || current < limit;
}
