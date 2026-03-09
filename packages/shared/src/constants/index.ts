export * from './roles';
export * from './plans';
export * from './segments';
export * from './order-status';

export const MENU_ITEM_FILTERS = ['vegetariano', 'sin_gluten', 'picante', 'vegano'] as const;
export type MenuItemFilter = (typeof MENU_ITEM_FILTERS)[number];

export const MENU_ITEM_FILTER_LABELS: Record<MenuItemFilter, string> = {
  vegetariano: 'Vegetariano',
  sin_gluten: 'Sin gluten',
  picante: 'Picante',
  vegano: 'Vegano',
};

export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const PHONE_MX_REGEX = /^\+52[1-9][0-9]{9}$/;
export const OTP_LENGTH = 4;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
