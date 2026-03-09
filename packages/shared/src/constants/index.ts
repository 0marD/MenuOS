export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 499,
    currency: 'MXN',
    branches: 1,
    crmContacts: 200,
    whatsappMessages: 50,
    automations: 0,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 999,
    currency: 'MXN',
    branches: 2,
    crmContacts: Infinity,
    whatsappMessages: 500,
    automations: 5,
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 1899,
    currency: 'MXN',
    branches: 5,
    crmContacts: Infinity,
    whatsappMessages: Infinity,
    automations: Infinity,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const CUSTOMER_SEGMENTS = ['new', 'frequent', 'dormant'] as const;
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];

export const USER_ROLES = ['super_admin', 'manager', 'waiter', 'kitchen'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const MENU_ITEM_FILTERS = ['vegetariano', 'sin_gluten', 'picante', 'vegano'] as const;
export type MenuItemFilter = (typeof MENU_ITEM_FILTERS)[number];

export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const PHONE_MX_REGEX = /^(\+52)?[0-9]{10}$/;
