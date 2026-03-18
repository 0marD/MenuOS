# MenuOS

**Full-stack SaaS for independent restaurants in Mexico and LATAM.**

MenuOS digitalizes the complete restaurant operation: real-time editable QR menu, customer data capture with WhatsApp marketing, table-to-kitchen order flow, and digital loyalty stamp cards — all from a single platform.

---

## Modules

| Module | Description | Status |
|--------|-------------|--------|
| **M1 — QR Menu** | Real-time editable digital menu with photo management, dietary filters, drag-and-drop reordering, multi-branch support | ✅ MVP |
| **M2 — CRM + WhatsApp** | Customer capture, segmentation (new/frequent/dormant), WhatsApp campaigns via 360dialog BSP, automated drip messages | ✅ MVP |
| **M3 — Orders + KDS** | Customer PWA cart → waiter confirmation → kitchen display with real-time updates | ✅ MVP |
| **M4 — Loyalty** | Configurable digital stamp cards, reward redemption, anti-fraud stamp granting | ✅ MVP |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS 3, shadcn/ui, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Payments | Stripe (subscriptions, checkout, billing portal, webhooks) |
| WhatsApp | 360dialog BSP |
| Monitoring | Sentry (runtime errors), PostHog (product analytics) |
| Infrastructure | Vercel (hosting), Cloudflare (CDN) |
| Tooling | pnpm 10, Turborepo 2, ESLint 9, Vitest, Playwright |

---

## Monorepo Structure

```
MenuOS/
├── apps/
│   └── web/                        # Main Next.js application
│       ├── app/
│       │   ├── (admin)/            # Admin panel (email auth)
│       │   │   ├── dashboard/      # Metrics, active orders, quick actions
│       │   │   ├── menu/           # Category + item CRUD, photo upload, drag-and-drop
│       │   │   ├── orders/         # Order management with status tracking
│       │   │   ├── crm/            # Customer table, segments, CSV export
│       │   │   ├── campaigns/      # WhatsApp campaign builder + analytics
│       │   │   ├── loyalty/        # Loyalty program configuration
│       │   │   ├── qr/             # QR code generator per branch/table
│       │   │   ├── onboarding/     # 5-step setup wizard
│       │   │   └── settings/       # Brand, branches, schedules, team, billing,
│       │   │                       # integrations, WhatsApp templates
│       │   ├── (public)/[slug]/    # Customer-facing PWA (public)
│       │   ├── (waiter)/waiter/    # Waiter PWA (PIN auth)
│       │   ├── (kitchen)/kitchen/  # Kitchen Display System (PIN auth)
│       │   └── auth/               # Login, register, PIN, forgot-password
│       ├── components/             # Global components (PushSubscriber, ServiceWorker)
│       └── lib/                    # Auth context, Supabase clients, push utils
├── packages/
│   ├── ui/                         # Design system (atoms → molecules → organisms)
│   ├── shared/                     # Constants, utilities, Zod validation schemas
│   ├── database/                   # Auto-generated Supabase TypeScript types
│   └── config/                     # Shared ESLint, Tailwind, TypeScript configs
├── supabase/
│   ├── migrations/                 # 24 SQL migrations (0001–0024)
│   ├── functions/                  # Edge Functions (Deno runtime)
│   └── seed.sql                    # Development seed data
└── docs/                           # Product and technical documentation
```

---

## User Roles

| Role | Authentication | Access |
|------|---------------|--------|
| `super_admin` | Email + password | Full admin panel + billing |
| `manager` | Email + password | Admin panel (no billing), assigned branches only |
| `waiter` | 4-digit PIN | Waiter PWA: orders + stamp granting |
| `kitchen` | 4-digit PIN | Kitchen display: view and mark items ready |
| Customer | WhatsApp OTP (optional) | Public menu, cart, loyalty card |

---

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- [Supabase](https://supabase.com) account
- [Stripe](https://stripe.com) account (billing)
- [360dialog](https://www.360dialog.com) account (WhatsApp campaigns)
- [Vercel](https://vercel.com) account (production deploy)

---

## Installation & Development

```bash
# Clone the repository
git clone <repo-url>
cd MenuOS

# Install all dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your credentials

# Start local Supabase (requires Supabase CLI)
supabase start
supabase db reset   # applies all migrations + seed data

# Start development server
pnpm dev
```

App available at `http://localhost:3000`.

---

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | ✅ |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for Starter plan | ✅ |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro plan | ✅ |
| `STRIPE_PRICE_BUSINESS` | Stripe Price ID for Business plan | ✅ |
| `PHONE_ENCRYPTION_KEY` | 32-char hex key for encrypting phone numbers | ✅ |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | ✅ |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for runtime error reporting | optional |
| `SENTRY_AUTH_TOKEN` | Sentry token for source map upload (CI only, needs `project:releases` scope) | optional |
| `SENTRY_ORG` | Sentry organization slug | optional |
| `SENTRY_PROJECT` | Sentry project slug | optional |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API key | optional |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL | optional |

> **Note:** VAPID private key, 360dialog API key, and cron secret are configured as Supabase secrets, not `.env` variables:
> ```bash
> supabase secrets set VAPID_PRIVATE_KEY=<key>
> supabase secrets set VAPID_PUBLIC_KEY=<key>
> supabase secrets set VAPID_SUBJECT=mailto:hola@menuos.mx
> supabase secrets set WHATSAPP_API_KEY=<360dialog-key>
> ```

---

## Available Commands

```bash
pnpm dev          # Start all packages in development mode
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking across all packages
pnpm lint         # ESLint across the entire monorepo
pnpm test         # Run unit tests (Vitest)
pnpm clean        # Clear .next, dist, and turbo cache
```

---

## Database

Migrations live in `supabase/migrations/` and are applied in order. Core entity relationships:

```
organizations → branches → tables
                         → staff_users
                         → menu_categories → menu_items (dietary flags, photos)
                         → customers → stamp_cards → stamps
                         → orders → order_items
                         → loyalty_programs → rewards
                         → campaigns → campaign_analytics
                         → org_settings
                         → push_subscriptions
```

All tables have Row Level Security (RLS) enabled. Tenant isolation is enforced at the database level.

---

## Edge Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `send-whatsapp` | HTTP (admin action) | Sends a campaign to a customer segment |
| `webhook-whatsapp` | HTTP (360dialog) | Processes delivery/read status events |
| `send-push` | HTTP (internal) | Sends push notifications to staff |
| `webhook-stripe` | HTTP (Stripe) | Updates plan and subscription state |
| `send-otp` | HTTP (customer PWA) | Generates and sends OTP via WhatsApp |
| `grant-stamp` | HTTP (waiter) | Grants a stamp with anti-fraud validation |
| `cron-automations` | pg_cron (daily 10am MXC) | Dormant reactivation, birthdays, stamp expiry |

---

## Production Deployment

1. **Supabase:** Push migrations with `supabase db push --project-ref <ref>`.
2. **Edge Functions:** `supabase functions deploy --project-ref <ref>`
3. **pg_cron:** Enable in Supabase Dashboard → Database → Extensions.
4. **Stripe webhook:** Register `https://<domain>/api/webhooks/stripe` for events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`.
5. **Vercel:** Connect the repository, set root directory to `apps/web`, and configure all environment variables.

---

## Pricing

| Plan | Price | Branches | Customers | WhatsApp msgs/mo |
|------|-------|----------|-----------|-----------------|
| Starter | $499 MXN/mo | 1 | 500 | 1,000 |
| Pro | $999 MXN/mo | 3 | 2,000 | 5,000 |
| Business | $1,899 MXN/mo | Unlimited | Unlimited | Unlimited |

All plans include a 14-day free trial.

---

## Documentation

Product, architecture, and development guidelines are in [`docs/`](./docs/):

| File | Contents |
|------|----------|
| `01-resumen-ejecutivo.md` | Product vision and business model |
| `02-plan-de-negocios.md` | Full business plan with financial projections |
| `03-libro-de-marca.md` | Visual identity, typography, tone of voice |
| `04-funcionalidades-saas.md` | Detailed feature specification per module |
| `05-arquitectura-app.md` | Technical architecture and database schema |
| `06-stack-tecnologico.md` | Stack decisions and justifications |
| `07-lineamientos-paradigmas.md` | Development paradigms and code standards |
| `08-interaccion-agentes.md` | Interaction flows per user type |

---

## License

Proprietary software. All rights reserved. See [LICENSE](./LICENSE) for details.

© 2026 MenuOS. Unauthorized reproduction, distribution, or use is prohibited.
