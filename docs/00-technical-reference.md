# MenuOS — Technical Reference

> This file supplements CLAUDE.md with detailed technical patterns.
> Claude Code: read this when implementing a specific module, not upfront.

---

## DETAILED FOLDER STRUCTURE

```
menuos/
├── apps/web/
│   ├── app/
│   │   ├── (public)/[slug]/
│   │   │   ├── page.tsx              # Menu landing (SSR)
│   │   │   ├── menu/page.tsx
│   │   │   ├── cart/page.tsx         # Phase 2
│   │   │   ├── order/[id]/page.tsx   # Phase 2
│   │   │   ├── loyalty/page.tsx      # Phase 3
│   │   │   └── register/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx            # Sidebar + header, auth guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── menu/page.tsx         # Menu editor
│   │   │   ├── menu/[id]/page.tsx    # Item detail/edit
│   │   │   ├── crm/page.tsx
│   │   │   ├── crm/[id]/page.tsx     # Customer detail
│   │   │   ├── campaigns/page.tsx
│   │   │   ├── campaigns/new/page.tsx
│   │   │   ├── campaigns/[id]/page.tsx
│   │   │   ├── orders/page.tsx       # Phase 2
│   │   │   ├── tables/page.tsx       # Phase 2
│   │   │   ├── loyalty/page.tsx      # Phase 3
│   │   │   └── settings/
│   │   │       ├── brand/page.tsx
│   │   │       ├── team/page.tsx
│   │   │       ├── branches/page.tsx
│   │   │       ├── schedules/page.tsx
│   │   │       ├── billing/page.tsx
│   │   │       └── integrations/page.tsx
│   │   ├── (waiter)/
│   │   │   ├── layout.tsx            # PIN auth guard, simplified nav
│   │   │   ├── orders/page.tsx
│   │   │   └── stamps/page.tsx       # Phase 3
│   │   ├── (kitchen)/
│   │   │   ├── layout.tsx            # PIN auth guard, dark mode forced
│   │   │   └── tickets/page.tsx
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       ├── pin/page.tsx          # PIN login for waiter/kitchen
│   │       └── forgot-password/page.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts             # createServerClient()
│   │   │   ├── client.ts             # createBrowserClient()
│   │   │   └── middleware.ts          # Auth middleware
│   │   └── utils/                    # App-specific utils
│   └── public/
│       ├── sw.js                     # Service worker
│       └── icons/
├── packages/ui/
│   ├── atoms/
│   │   ├── Button.tsx, Input.tsx, Badge.tsx, Toggle.tsx
│   │   ├── Avatar.tsx, Spinner.tsx, Icon.tsx
│   │   └── index.ts
│   ├── molecules/
│   │   ├── FormField.tsx, MenuItemCard.tsx, OrderCard.tsx
│   │   ├── CustomerRow.tsx, StampCard.tsx, AlertBanner.tsx
│   │   └── index.ts
│   ├── organisms/
│   │   ├── MenuEditor.tsx, OrderList.tsx, CategoryNav.tsx
│   │   ├── CampaignBuilder.tsx, TableMap.tsx, StampGrid.tsx
│   │   └── index.ts
│   ├── templates/
│   │   ├── AdminLayout.tsx, CustomerLayout.tsx
│   │   ├── WaiterLayout.tsx, KitchenLayout.tsx
│   │   └── index.ts
│   └── tokens/
│       ├── colors.ts, typography.ts, spacing.ts
│       └── index.ts
├── packages/shared/
│   ├── constants/
│   │   ├── roles.ts                  # ROLES enum + permission maps
│   │   ├── plans.ts                  # Plan limits (WA msgs, branches, etc.)
│   │   ├── segments.ts               # DORMANT_THRESHOLD_DAYS = 21, etc.
│   │   └── order-status.ts
│   ├── utils/
│   │   ├── format-price.ts           # formatMXN(1234.5) → "$1,234.50"
│   │   ├── validate-phone.ts         # isValidMexicanMobile("+525512345678")
│   │   ├── generate-pin.ts           # 4-digit random PIN
│   │   ├── generate-qr.ts            # QR code with logo
│   │   ├── date-helpers.ts           # timezone-aware, relative dates
│   │   └── slug.ts                   # generateSlug("Mi Restaurante") → "mi-restaurante"
│   ├── hooks/
│   │   ├── use-auth.ts               # useAuth() → { user, role, permissions, org }
│   │   ├── use-menu.ts               # useMenu(orgId) → menu data + mutations
│   │   ├── use-orders.ts             # useOrders(branchId) → realtime orders
│   │   ├── use-realtime.ts           # Generic realtime subscription hook
│   │   ├── use-offline.ts            # Online/offline state + queue
│   │   └── use-customer.ts           # useCustomer() → current customer profile
│   ├── services/
│   │   ├── whatsapp.service.ts       # Abstract WA sending (swap BSP without code changes)
│   │   ├── payment.service.ts        # Abstract Stripe/Conekta
│   │   └── analytics.service.ts      # PostHog wrapper
│   └── validations/
│       ├── menu.schema.ts            # Zod: menuItemSchema, categorySchema
│       ├── order.schema.ts           # Zod: orderSchema, orderItemSchema
│       ├── customer.schema.ts        # Zod: customerSchema, registrationSchema
│       ├── campaign.schema.ts        # Zod: campaignSchema, templateSchema
│       └── auth.schema.ts            # Zod: loginSchema, registerSchema, pinSchema
└── supabase/functions/
    ├── send-whatsapp/index.ts
    ├── process-order/index.ts
    ├── grant-stamp/index.ts
    ├── redeem-reward/index.ts
    ├── webhook-whatsapp/index.ts
    ├── webhook-payments/index.ts
    ├── import-menu/index.ts
    └── cron-automations/index.ts
```

---

## EDGE FUNCTIONS SPEC

### send-whatsapp
- **Input**: `{ phone, template_id, variables, campaign_id? }`
- **Validate**: phone format (Mexican mobile)
- **Call**: 360dialog REST API with template + variables
- **Log**: Insert into `campaign_messages` (or `notifications` if not campaign)
- **Error handling**: invalid number, blocked, rate limited → log error, don't throw
- **Fallback**: If WA delivery fails, attempt SMS via Twilio (for OTP only)

### process-order
- **Input**: `{ branch_id, table_id, items: [{ menu_item_id, quantity, notes }], customer_id? }`
- **Validate**: all items exist, are available, not sold out, prices match DB
- **Transaction**: create order (status: pending) + order_items
- **Broadcast**: Realtime to `orders:{branch_id}` channel
- **Return**: order object with id, status, items

### grant-stamp
- **Input**: `{ customer_id, program_id, table_id, granted_by }`
- **Validate**: program active, card exists (create if not), no stamp today for this table
- **Create**: stamp record
- **Check**: if card now complete → create reward, trigger send-whatsapp
- **Return**: updated stamp card

### redeem-reward
- **Input**: `{ reward_id, redeemed_by }`
- **Validate**: reward exists, not expired, not already redeemed
- **Update**: mark as redeemed with timestamp + waiter_id
- **Return**: confirmation

### webhook-whatsapp
- **Receive**: delivery/read events from 360dialog
- **Update**: `campaign_messages.status` (sent → delivered → read)
- **Aggregate**: update `campaign_analytics` counters

### webhook-payments
- **Receive**: Stripe/Conekta subscription events
- **Update**: `organizations.subscription_status` and `plan`
- **Handle**: failed payments → set status to past_due, send WA alert to admin

### import-menu (Phase 1)
- **Input**: file as base64 (image or PDF)
- **Process**: OCR via Tesseract or Google Vision API
- **Parse**: extract dish names and prices from text
- **Return**: structured menu for admin to review and confirm (not auto-import)

### cron-automations (daily)
- **Dormant check**: customers with no visit in 21+ days → trigger "We miss you" WA
- **Birthday check**: customers with birthday today → trigger "Happy birthday" WA
- **Stamp expiration**: stamps expiring in 7 days → notify customer
- **Respect**: plan limits, automation on/off status, opt-in consent

---

## CODE PATTERNS

### Server Component Data Fetching
```typescript
// app/(admin)/menu/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function MenuPage() {
  const supabase = await createServerClient();
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*, menu_item_photos(*))')
    .eq('organization_id', /* from auth context */)
    .is('deleted_at', null)
    .order('sort_order');

  return <MenuEditor categories={categories ?? []} />;
}
```

### Realtime Subscription Hook
```typescript
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export function useRealtimeOrders(branchId: string) {
  const [orders, setOrders] = useState([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    // Initial fetch
    supabase.from('orders').select('*, order_items(*)')
      .eq('branch_id', branchId)
      .in('status', ['pending', 'confirmed', 'preparing'])
      .then(({ data }) => setOrders(data ?? []));

    // Subscribe
    const channel = supabase
      .channel(`orders:${branchId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `branch_id=eq.${branchId}`,
      }, (payload) => {
        setOrders(prev => handleOrderChange(prev, payload));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [branchId]);

  return orders;
}
```

### Protected Layout
```typescript
// app/(admin)/layout.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users')
    .select('role, organization_id, branch_ids')
    .eq('auth_id', user.id).single();

  if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
    redirect('/auth/unauthorized');
  }

  return <AdminLayoutShell user={profile}>{children}</AdminLayoutShell>;
}
```

### Zod Schema + Form
```typescript
// packages/shared/validations/menu.schema.ts
import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive().multipleOf(0.01),
  category_id: z.string().uuid(),
  preparation_time_minutes: z.number().int().positive().optional(),
  is_available: z.boolean().default(true),
});

// In component: useForm({ resolver: zodResolver(menuItemSchema) })
```

### Offline Queue (Waiter App)
```typescript
// packages/shared/hooks/use-offline.ts
export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  useEffect(() => {
    const goOnline = async () => {
      setIsOnline(true);
      // Flush queue
      for (const action of queue) {
        await executeAction(action);
      }
      setQueue([]);
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [queue]);

  const enqueue = (action: QueuedAction) => {
    if (isOnline) return executeAction(action);
    setQueue(prev => [...prev, action]);
    // Also persist to IndexedDB for crash recovery
  };

  return { isOnline, pendingActions: queue.length, enqueue };
}
```

---

## TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0F0E0C',
        paper: '#F5F0E8',
        cream: '#EDE8DC',
        accent: { DEFAULT: '#D4500A', green: '#2A6B3F', blue: '#1A3A5C' },
        muted: '#7A7060',
        highlight: '#F7C948',
        rule: '#C8BFA8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        'kds': ['24px', { lineHeight: '1.3' }], // Kitchen display minimum
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## PERMISSION MAP

```typescript
// packages/shared/constants/roles.ts
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
} as const;

export function hasPermission(role: string, permission: string): boolean {
  const perms = PERMISSIONS[role] ?? [];
  return perms.some(p => p === permission || p === permission.split(':')[0] + ':*');
}
```