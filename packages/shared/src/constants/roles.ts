export const ROLES = ['super_admin', 'manager', 'waiter', 'kitchen'] as const;
export type UserRole = (typeof ROLES)[number];

export const PERMISSIONS = {
  super_admin: [
    'menu:*', 'orders:*', 'crm:*', 'campaigns:*',
    'loyalty:*', 'settings:*', 'billing:*', 'analytics:*', 'users:*',
  ],
  manager: [
    'menu:read', 'menu:write', 'orders:*', 'crm:read',
    'campaigns:read', 'campaigns:create', 'loyalty:read', 'loyalty:grant_stamp',
    'settings:read', 'analytics:read', 'users:manage_staff',
  ],
  waiter: [
    'menu:read', 'orders:read', 'orders:confirm', 'orders:reject',
    'loyalty:grant_stamp', 'loyalty:redeem',
  ],
  kitchen: [
    'orders:read', 'orders:mark_ready',
  ],
} as const satisfies Record<UserRole, readonly string[]>;

export type Permission = (typeof PERMISSIONS)[UserRole][number];

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms: readonly string[] = PERMISSIONS[role];
  return perms.some(
    (p) => p === permission || p === `${permission.split(':')[0]}:*`
  );
}
