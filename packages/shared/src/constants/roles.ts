export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  super_admin: [
    'menu:*',
    'orders:*',
    'crm:*',
    'campaigns:*',
    'loyalty:*',
    'settings:*',
    'billing:*',
    'analytics:*',
    'users:*',
  ],
  manager: [
    'menu:read',
    'menu:write',
    'orders:*',
    'crm:read',
    'campaigns:read',
    'campaigns:create',
    'loyalty:read',
    'loyalty:grant_stamp',
    'settings:read',
    'analytics:read',
    'users:manage_staff',
  ],
  waiter: [
    'menu:read',
    'orders:read',
    'orders:confirm',
    'orders:reject',
    'loyalty:grant_stamp',
    'loyalty:redeem',
  ],
  kitchen: [
    'orders:read',
    'orders:mark_ready',
  ],
} as const;

export function hasPermission(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role] ?? [];
  return perms.some(
    (p) => p === permission || p === permission.split(':')[0] + ':*',
  );
}

export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.MANAGER];
export const STAFF_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.KITCHEN];
