# MenuOS

> **Sistema de gestión digital para restaurantes independientes.**
> Menú QR en tiempo real · CRM · Campañas WhatsApp · Pedidos · Fidelidad

---

## ¿Qué es MenuOS?

MenuOS es una plataforma SaaS diseñada para restaurantes independientes en México. Permite a los dueños publicar su menú digital con un QR permanente, gestionar clientes, enviar campañas de WhatsApp, recibir pedidos en tiempo real y administrar programas de lealtad — todo desde un panel centralizado.

### Módulos principales

| Módulo | Descripción |
|--------|-------------|
| **Menú QR** | Menú digital con URL permanente, edición en tiempo real, fotos, filtros y modo offline |
| **CRM** | Base de clientes propia, segmentación automática (nuevo/frecuente/dormido), exportación CSV |
| **Campañas WA** | Mensajes WhatsApp segmentados, programables, con analytics de entrega y lectura |
| **Pedidos** | Carrito del cliente → mesero → cocina en tiempo real. App de mesero + KDS |
| **Fidelidad** | Tarjeta de sellos digital, recompensas configurables, detección de fraude |
| **Admin** | Dashboard con métricas, editor de menú, gestión de sucursales, equipo y horarios |

---

## Stack tecnológico

- **Frontend** — Next.js 15 · React 19 · TypeScript strict · Tailwind CSS · shadcn/ui
- **Backend** — Supabase (PostgreSQL · Auth · Realtime · Storage)
- **Monorepo** — pnpm workspaces · Turborepo
- **Hosting** — Vercel (frontend) · Supabase Cloud (backend)
- **Monitoreo** — Sentry · PostHog
- **Testing** — Vitest (unitarios) · TypeScript strict

---

## Estructura del proyecto

```
menuos/
├── apps/
│   └── web/                     # Next.js 15 App Router
│       ├── app/
│       │   ├── (admin)/         # Panel de administración
│       │   ├── (public)/[slug]/ # PWA del cliente (menú + carrito + fidelidad)
│       │   ├── (waiter)/        # App del mesero
│       │   ├── (kitchen)/       # KDS (Kitchen Display System)
│       │   └── auth/            # Login · Register · PIN
│       ├── components/
│       ├── lib/
│       └── public/
├── packages/
│   ├── ui/                      # Design system (atoms → molecules → organisms)
│   ├── shared/                  # Constants · Utils · Validaciones Zod
│   ├── database/                # Tipos de Supabase
│   └── config/                  # TypeScript · ESLint · Tailwind compartidos
├── supabase/
│   ├── migrations/              # 15 migraciones SQL con RLS
│   └── seed.sql
└── docs/                        # Especificaciones del producto
```

---

## Requisitos previos

- **Node.js** ≥ 20
- **pnpm** ≥ 10 — `npm install -g pnpm`
- **Supabase CLI** — `brew install supabase/tap/supabase`
- Cuenta en [supabase.com](https://supabase.com) (para producción)

---

## Configuración local

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd menuos
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example apps/web/.env.local
```

Edita `apps/web/.env.local` con tus valores. Las variables mínimas para desarrollo:

```bash
# Supabase local (se obtienen con `supabase start`)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Seguridad — genera con: openssl rand -base64 32
PIN_SALT=tu_salt_aleatorio_de_minimo_32_chars
PHONE_ENCRYPTION_KEY=tu_clave_aleatoria_de_minimo_32_chars

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=menuos.mx
```

### 3. Iniciar Supabase local

```bash
supabase start
```

Esto levanta PostgreSQL, Auth y Storage localmente. La primera vez aplica las migraciones automáticamente.

### 4. Levantar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/auth/login` | Login de administrador |
| `/auth/register` | Registro + creación de restaurante |
| `/auth/pin` | Acceso de mesero/cocina por PIN |
| `/admin/dashboard` | Panel principal con métricas |
| `/admin/menu` | Editor de categorías y platillos |
| `/admin/crm` | Lista de clientes con segmentos |
| `/admin/campaigns` | Campañas de WhatsApp |
| `/admin/loyalty` | Programa de fidelidad |
| `/admin/orders` | Pedidos del día con métricas |
| `/admin/orders/tables` | Configuración de mesas y QRs |
| `/admin/qr` | Generador de código QR del restaurante |
| `/admin/settings/brand` | Logo, banner y plantilla del menú |
| `/admin/settings/branches` | Sucursales |
| `/admin/settings/team` | Equipo y PINs |
| `/admin/settings/schedules` | Horarios de atención |
| `/admin/onboarding` | Guía de configuración inicial (5 pasos) |
| `/[slug]` | PWA pública del cliente (menú + carrito) |
| `/[slug]/loyalty` | Tarjeta de sellos del cliente |
| `/waiter` | App del mesero |
| `/kitchen` | KDS de cocina |

---

## Scripts disponibles

```bash
pnpm dev          # Servidor de desarrollo (todos los paquetes)
pnpm build        # Build de producción
pnpm typecheck    # Verificación de tipos TypeScript
pnpm test         # Tests unitarios (Vitest)
pnpm lint         # ESLint
```

---

## Base de datos

El proyecto usa **15 migraciones SQL** en `supabase/migrations/`:

| Migración | Contenido |
|-----------|-----------|
| 0001–0007 | Organizations, branches, staff, menu, settings, audit log |
| 0008 | RLS policies (Row Level Security en todas las tablas) |
| 0009–0010 | Customers (CRM) + Campaigns |
| 0011 | RLS adicional para customers |
| 0012 | Branch schedules |
| 0013 | Loyalty (programs, stamp cards, stamps, rewards) |
| 0014 | Orders (restaurant tables, orders, order items, status history) |
| 0015 | Security hardening (pgcrypto, RLS restrictivo) |

Para aplicar migraciones en local:

```bash
supabase db reset    # Resetea y aplica todas las migraciones + seed
```

Para generar tipos tras una migración nueva:

```bash
supabase gen types typescript --local > packages/database/types/supabase.ts
```

---

## Testing

```bash
# Unitarios — 111 tests
pnpm --filter @menuos/shared test

# TypeScript en todos los paquetes
pnpm typecheck
```

Los tests cubren: constantes de negocio, utilidades (slug, teléfono, PIN, precios, fechas) y todos los schemas de validación Zod.

---

## Deploy

### Variables de entorno en producción

Además de las de desarrollo, agrega en Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # de producción
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # de producción
PIN_SALT=<32+ chars aleatorios>
PHONE_ENCRYPTION_KEY=<32+ chars aleatorios>
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=tu-org
SENTRY_PROJECT=menuos
SENTRY_AUTH_TOKEN=sntrys_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### Pasos

```bash
# 1. Aplicar migraciones en Supabase Cloud
supabase db push

# 2. Deploy en Vercel (automático desde main)
git push origin main
```

---

## Seguridad

- **RLS** habilitado en todas las tablas — aislamiento por `organization_id`
- **PIN hashing** con PBKDF2-SHA256 (100,000 iteraciones)
- **Teléfonos** cifrados con AES-256 via pgcrypto
- **Server actions** con `requireAuthSession()` / `requireOrgSession()` en todas las rutas protegidas
- **Precios** validados server-side en cada pedido (nunca se confía en el cliente)
- Soft deletes en todas las tablas (`deleted_at`)

---

## Licencia

Software propietario. Ver [LICENSE](./LICENSE) para los términos completos.

© 2026 MenuOS. Todos los derechos reservados.
