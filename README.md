# MenuOS

**SaaS vertical para restaurantes independientes en México y LATAM.**

MenuOS digitaliza la operación completa de un restaurante: menú QR editable en tiempo real, captura de clientes con marketing por WhatsApp, sistema de pedidos mesa→cocina, y programa de lealtad con sellos digitales.

---

## Módulos

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **M1 — QR Menu** | Menú digital editable en tiempo real, multi-sucursal, con filtros dietéticos y gestión de fotos | MVP |
| **M2 — CRM + WhatsApp** | Captura de datos, segmentación, campañas automatizadas via 360dialog BSP | MVP |
| **M3 — Pedidos + KDS** | PWA cliente → mesero → cocina con actualizaciones en tiempo real | MVP |
| **M4 — Lealtad** | Sellos digitales, programas configurables, canje de recompensas | MVP |

---

## Stack tecnológico

- **Frontend:** Next.js 15, React 19, TypeScript 5 (strict), Tailwind CSS 3
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Pagos:** Stripe (checkout + portal + webhooks)
- **WhatsApp:** 360dialog BSP
- **Monitoreo:** Sentry + PostHog
- **Infraestructura:** Vercel + Cloudflare CDN
- **Tooling:** pnpm 10, Turborepo 2, ESLint, Prettier

---

## Arquitectura del monorepo

```
MenuOS/
├── apps/
│   └── web/                        # Aplicación Next.js principal
│       ├── app/
│       │   ├── (admin)/            # Panel de administración
│       │   │   ├── dashboard/      # Métricas y acceso rápido
│       │   │   ├── menu/           # Editor de categorías e ítems
│       │   │   ├── orders/         # Gestión de pedidos
│       │   │   ├── crm/            # Tabla de clientes y segmentos
│       │   │   ├── campaigns/      # Campañas WhatsApp
│       │   │   ├── loyalty/        # Programas de lealtad
│       │   │   ├── qr/             # Generador de códigos QR
│       │   │   ├── onboarding/     # Wizard de configuración inicial
│       │   │   └── settings/       # Marca, sucursales, equipo, billing
│       │   ├── (public)/[slug]/    # PWA pública del cliente
│       │   ├── (waiter)/waiter/    # PWA del mesero (PIN auth)
│       │   ├── (kitchen)/kitchen/  # KDS (Kitchen Display System)
│       │   └── auth/               # Login, registro, PIN, forgot-password
│       ├── components/             # Componentes globales (PushSubscriber, SW)
│       └── lib/                    # Auth, Supabase client/server, push, utils
├── packages/
│   ├── ui/                         # Design system (atoms, molecules, organisms)
│   ├── shared/                     # Constantes, utilidades, validaciones Zod
│   ├── database/                   # Tipos generados por Supabase
│   └── config/                     # Configs compartidas (Tailwind, ESLint, TS)
├── supabase/
│   ├── migrations/                 # 22 migraciones SQL (0001–0022)
│   ├── functions/                  # Edge Functions (WhatsApp, Stripe, push, OTP, cron)
│   └── seed.sql                    # Datos de desarrollo
└── docs/                           # Documentación técnica y de producto
```

---

## Roles de usuario

| Rol | Autenticación | Acceso |
|-----|--------------|--------|
| `super_admin` | Email + contraseña | Panel completo + billing |
| `manager` | Email + contraseña | Panel sin billing, limitado a sus sucursales |
| `waiter` | PIN (4 dígitos) | PWA mesero: pedidos + sellos |
| `kitchen` | PIN (4 dígitos) | KDS: visualización y marcado de platillos |
| Cliente | WhatsApp OTP (opcional) | Menú público + carrito + lealtad |

---

## Requisitos previos

- Node.js >= 20
- pnpm >= 10
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Stripe](https://stripe.com) (para billing)
- Cuenta en [360dialog](https://www.360dialog.com) (para WhatsApp)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

---

## Instalación y desarrollo

```bash
# Clonar el repositorio
git clone <repo-url>
cd MenuOS

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp apps/web/.env.example apps/web/.env.local
# Editar apps/web/.env.local con tus credenciales

# Iniciar base de datos local (requiere Supabase CLI)
supabase start
supabase db reset   # aplica migraciones + seed

# Iniciar servidor de desarrollo
pnpm dev
```

La app estará disponible en `http://localhost:3000`.

---

## Variables de entorno

Copia `apps/web/.env.example` a `apps/web/.env.local` y completa:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `STRIPE_PRICE_STARTER` | Price ID del plan Starter en Stripe |
| `STRIPE_PRICE_PRO` | Price ID del plan Pro en Stripe |
| `STRIPE_PRICE_BUSINESS` | Price ID del plan Business en Stripe |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID para push notifications |
| `PHONE_ENCRYPTION_KEY` | Clave de 32 chars para cifrar números de teléfono |
| `SENTRY_ORG` | Organización en Sentry (opcional) |
| `SENTRY_PROJECT` | Proyecto en Sentry (opcional) |
| `SENTRY_AUTH_TOKEN` | Token de Sentry para upload de source maps (opcional) |
| `NEXT_PUBLIC_POSTHOG_KEY` | API key de PostHog (opcional) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Host de PostHog (opcional) |

Las claves de Supabase Edge Functions (VAPID privado, 360dialog, cron secret) se configuran en `supabase secrets set`.

---

## Comandos disponibles

```bash
pnpm dev          # Inicia todos los paquetes en modo desarrollo
pnpm build        # Build de producción
pnpm typecheck    # Verificación de tipos TypeScript
pnpm lint         # ESLint en todo el monorepo
pnpm test         # Ejecuta tests
pnpm clean        # Limpia caché y node_modules
```

---

## Base de datos

Las migraciones están en `supabase/migrations/` y se aplican en orden. Las principales entidades son:

```
organizations → branches → tables
                         → staff_users
                         → menu_categories → menu_items
                         → customers → stamp_cards → stamps
                         → orders → order_items
                         → loyalty_programs → rewards
                         → campaigns → campaign_analytics
```

Todas las tablas tienen Row Level Security (RLS) habilitado.

---

## Edge Functions

| Función | Trigger | Descripción |
|---------|---------|-------------|
| `send-whatsapp` | HTTP (admin action) | Envía campaña a segmento de clientes |
| `webhook-whatsapp` | HTTP (360dialog) | Procesa estados de entrega/lectura |
| `send-push` | HTTP (internal) | Envía notificaciones push a staff |
| `webhook-stripe` | HTTP (Stripe) | Actualiza plan y estado de suscripción |
| `send-otp` | HTTP (customer PWA) | Genera y envía OTP por WhatsApp |
| `grant-stamp` | HTTP (waiter) | Otorga sello con validación anti-fraude |
| `cron-automations` | pg_cron (daily 10am MXC) | Reactivación dormant, cumpleaños, expiración sellos |

---

## Deploy a producción

1. **Supabase:** Aplica las migraciones en el proyecto de producción con `supabase db push`.
2. **pg_cron:** Habilitar en Supabase Dashboard → Database → Extensions y configurar el schedule de `cron-automations`.
3. **Edge Functions:** `supabase functions deploy --project-ref <ref>`
4. **Stripe webhook:** Registrar el endpoint `https://<dominio>/api/webhooks/stripe` en el Dashboard de Stripe para los eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`.
5. **Vercel:** Conectar el repositorio, seleccionar `apps/web` como root directory y configurar las variables de entorno.

---

## Precios

| Plan | Precio | Sucursales | Clientes | Mensajes WA/mes |
|------|--------|------------|----------|-----------------|
| Starter | $499 MXN/mes | 1 | 500 | 1,000 |
| Pro | $999 MXN/mes | 3 | 2,000 | 5,000 |
| Business | $1,899 MXN/mes | Ilimitadas | Ilimitados | Ilimitados |

Todos los planes incluyen 14 días de prueba gratuita.

---

## Documentación

Los documentos de producto, arquitectura y lineamientos de desarrollo se encuentran en la carpeta [`docs/`](./docs/):

- `01-resumen-ejecutivo.md` — Visión general del producto y modelo de negocio
- `02-plan-de-negocios.md` — Plan completo con proyecciones financieras
- `03-libro-de-marca.md` — Identidad visual, tipografía y tono de voz
- `04-funcionalidades-saas.md` — Especificación detallada de funcionalidades
- `05-arquitectura-app.md` — Arquitectura técnica y esquema de base de datos
- `06-stack-tecnologico.md` — Decisiones de stack y justificaciones
- `07-lineamientos-paradigmas.md` — Paradigmas de desarrollo y estándares de código
- `08-interaccion-agentes.md` — Flujos de interacción por tipo de usuario

---

## Licencia

Software propietario. Todos los derechos reservados. Ver [LICENSE](./LICENSE) para más información.

© 2026 MenuOS. Prohibida su reproducción, distribución o uso no autorizado.
