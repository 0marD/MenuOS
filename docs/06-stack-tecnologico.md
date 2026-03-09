# MenuOS — Stack Tecnológico

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Clasificación:** Confidencial — Uso interno  

---

## 1. Resumen del Stack

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend (PWA + Admin) | Next.js 14+ (App Router) + React 18 | SSR, PWA, monorepo |
| UI Components | shadcn/ui + Tailwind CSS | Componentes accesibles, mobile-friendly |
| Lenguaje | TypeScript (strict mode) | Type safety end-to-end |
| Backend / API | Supabase (PostgreSQL + Edge Functions) | BaaS completo |
| Realtime | Supabase Realtime (WebSockets) | Pedidos en vivo, KDS, cambios de menú |
| Auth | Supabase Auth | JWT, magic links, custom flows |
| Storage | Supabase Storage + Cloudflare R2 (CDN) | Imágenes de platillos |
| WhatsApp API | 360dialog BSP | Envío/recepción de mensajes |
| Pagos (suscripciones) | Stripe + Conekta | Tarjetas, OXXO Pay, SPEI |
| Hosting frontend | Vercel | Edge functions en LATAM, preview deploys |
| CDN | Cloudflare | Cache de imágenes, protección DDoS |
| Analytics | PostHog (cloud o self-hosted) | Product analytics, feature flags |
| Monitoreo | Sentry + Uptime Robot | Errores en producción, uptime |
| CI/CD | GitHub Actions + Vercel | Lint, tests, deploy automático |
| Control de versiones | Git + GitHub | Monorepo |

---

## 2. Decisiones y Justificaciones

### 2.1 Next.js como Framework Frontend

**Elección:** Next.js 14+ con App Router.

**Razones:**
- **SSR para el menú público:** El menú del comensal necesita carga rápida y SEO. Next.js genera la página en servidor, enviando HTML listo al navegador. Esto es crítico para que el menú cargue en <2 segundos sobre 3G.
- **PWA nativa:** Next.js soporta service workers y manifest.json, permitiendo instalación como app sin framework adicional.
- **Monorepo natural:** El panel admin y la PWA del comensal viven en el mismo proyecto, compartiendo tipos, utilidades y componentes base.
- **Vercel como plataforma:** Deploy con un push, preview por PR, edge functions en LATAM, sin configurar infraestructura.

**Alternativas consideradas:**
- **Remix:** Excelente para formularios y datos, pero su ecosistema de deployment es menos maduro que Vercel y el soporte PWA requiere más configuración manual.
- **Astro:** Ideal para sitios estáticos, pero el menú necesita interactividad dinámica (tiempo real, carrito, filtros) que requiere un framework completo de SPA.
- **SvelteKit:** Rendimiento superior en bundle size, pero el ecosistema de componentes (shadcn/ui equivalente) es menos maduro y la curva de contratación es mayor en LATAM.

### 2.2 shadcn/ui + Tailwind CSS

**Elección:** shadcn/ui como sistema de componentes, Tailwind CSS para estilos utilitarios.

**Razones:**
- **Componentes copiados, no instalados:** shadcn/ui genera los componentes directamente en el proyecto, permitiendo personalización completa sin depender de las actualizaciones de una librería externa.
- **Accesibilidad built-in:** Basado en Radix UI, con ARIA roles, keyboard navigation y focus management incluidos.
- **Mobile-friendly por defecto:** Los componentes están diseñados para funcionar bien en pantallas pequeñas.
- **Tailwind CSS:** Utilidades atómicas que evitan CSS muerto, facilitan responsive design y son consistentes con el principio de atomic design.

**Mejora sugerida:** Crear un paquete `@menuos/ui` dentro del monorepo que extienda shadcn/ui con los tokens de diseño de MenuOS (colores, tipografía, espaciado), garantizando consistencia entre PWA comensal, admin, mesero y KDS.

### 2.3 TypeScript (Strict Mode)

**Elección:** TypeScript en todo el proyecto, con `strict: true`.

**Razones:**
- **Type safety end-to-end:** Los tipos de Supabase se generan automáticamente con `supabase gen types`, garantizando que frontend y base de datos están siempre sincronizados.
- **Reducción de bugs en runtime:** Errores de tipo se capturan en compilación, no en producción.
- **Documentación viva:** Los tipos sirven como documentación del esquema de datos y las interfaces de la API.
- **Facilita refactoring:** Cambiar un campo en la base de datos muestra inmediatamente todos los archivos afectados.

### 2.4 Supabase como Backend

**Elección:** Supabase (PostgreSQL gestionado + Auth + Realtime + Storage + Edge Functions).

**Razones:**
- **Todo-en-uno:** Base de datos relacional, autenticación, WebSockets, almacenamiento y funciones serverless en una sola plataforma con pricing predecible.
- **PostgreSQL nativo:** Base de datos robusta, con soporte para JSON, full-text search, triggers, funciones PL/pgSQL, y Row Level Security.
- **RLS (Row Level Security):** Permite definir políticas de acceso a nivel de fila directamente en la base de datos, eliminando la necesidad de middleware de autorización en muchos casos.
- **Realtime nativo:** WebSockets para actualizaciones instantáneas de pedidos, cambios de menú y status de cocina, sin necesidad de configurar un servidor de WebSockets separado.
- **Costo predecible:** A 300 restaurantes con ~180K operaciones/mes, el costo es ~$25 USD/mes en tier Pro. La arquitectura escala sin refactor hasta ~5,000 restaurantes.
- **Client SDK auto-generado:** PostgREST genera automáticamente una API REST a partir del esquema de la base de datos, reduciendo código boilerplate.

**Alternativas consideradas:**
- **Firebase:** Realtime excelente, pero Firestore (NoSQL) complica queries relacionales que son fundamentales para el CRM y analytics. El pricing de Firestore escala de forma menos predecible con muchos reads.
- **Backend custom (Node.js + Express):** Máxima flexibilidad, pero requiere implementar auth, realtime, storage y API desde cero. El time-to-market se multiplica por 3–4×.
- **PlanetScale / Neon + Clerk + Pusher:** Stack modular excelente, pero más piezas que integrar y mantener. Supabase ofrece la misma funcionalidad en un solo SDK.

**Mejora sugerida:** Para las Edge Functions con lógica de negocio compleja (envío masivo de WA, generación de reportes), considerar usar Supabase Edge Functions con Deno para mantener el ecosistema unificado, pero tener un plan de migración a Cloudflare Workers o AWS Lambda si alguna función requiere tiempos de ejecución >30 segundos.

### 2.5 Supabase Realtime

**Elección:** Supabase Realtime para todos los canales de actualización en tiempo real.

**Razones:**
- **Integración nativa:** No requiere setup adicional; se activa por tabla/canal directamente desde el SDK de Supabase.
- **Broadcast y Presence:** Soporta tanto cambios en base de datos como mensajes custom entre clientes (útil para notificaciones entre mesero y cocina).
- **Escalabilidad:** Soporta miles de conexiones simultáneas, suficiente para el volumen proyectado.

**Mejora sugerida:** Para el KDS, implementar un mecanismo de heartbeat/ping que detecte desconexiones del WebSocket y muestre una alerta inmediata, ya que un KDS desconectado es un problema operativo crítico.

### 2.6 360dialog (WhatsApp Business API)

**Elección:** 360dialog como BSP (Business Service Provider) para WhatsApp.

**Razones:**
- **Certificado por Meta:** BSP oficial con cobertura en LATAM.
- **API REST simple:** Fácil de integrar con Edge Functions.
- **Pricing por mensaje transparente:** Sin cargos mensuales fijos, solo por mensaje enviado.
- **Número verificado del restaurante:** Cada restaurante envía desde su propio número, no desde el de MenuOS.
- **Absorbe cambios de Meta:** Si Meta cambia precios o políticas, 360dialog gestiona la transición.

**Alternativas consideradas:**
- **Twilio:** Más caro por mensaje en LATAM, mejor para SMS multi-país.
- **Vonage:** Alternativa viable, pricing similar, pero 360dialog tiene mejor documentación para LATAM.
- **API directa de Meta:** Sin BSP intermediario hay riesgo de cambios sin previo aviso y mayor complejidad de compliance.

**Mejora sugerida:** Implementar una capa de abstracción sobre el BSP (`WhatsAppService`) que permita cambiar de proveedor (360dialog → Vonage → otro) sin modificar la lógica de negocio. Incluir fallback a SMS vía Twilio para mensajes críticos (confirmación de pedido, OTP).

### 2.7 Stripe + Conekta (Pagos)

**Elección:** Dual: Stripe para tarjetas internacionales y suscripciones; Conekta para métodos de pago mexicanos.

**Razones:**
- **Stripe:** Mejor plataforma de suscripciones del mundo. Manejo automático de retries, dunning (cobros fallidos), upgrades/downgrades, y portal de cliente.
- **Conekta:** OXXO Pay es fundamental en México (muchos restaurantes pagan en efectivo en OXXO). También soporta tarjetas mexicanas con menos rechazos que Stripe.
- **SPEI (futuro):** Para plan Business, transferencia bancaria directa.

**Mejora sugerida:** Unificar la gestión de suscripciones en Stripe como fuente de verdad, usando Conekta solo como método de pago alternativo que alimenta el subscription state en Stripe vía webhooks. Esto evita mantener dos sistemas de suscripción paralelos.

### 2.8 Vercel + Cloudflare

**Elección:** Vercel para hosting del frontend; Cloudflare para CDN de imágenes y protección.

**Razones:**
- **Vercel:** Deploy en un push, preview deploys por PR, edge functions con nodos en LATAM (GRU, GIG), analytics de rendimiento incluido.
- **Cloudflare:** CDN global con nodos en México (QRO, GDL), transformación de imágenes on-the-fly (resize, format conversion a WebP), protección DDoS, certificados SSL automáticos.

**Mejora sugerida:** Usar Cloudflare Images o R2 para almacenar las fotos de platillos en lugar de Supabase Storage. Cloudflare R2 no tiene costos de egress (transferencia de datos), lo cual es significativo cuando tienes miles de comensales cargando fotos de menú diariamente. Las fotos se sirven directamente desde el edge de Cloudflare en México, garantizando <1s de carga sobre 3G.

### 2.9 PostHog (Analytics)

**Elección:** PostHog para analytics de producto.

**Razones:**
- **Respeta la privacidad:** Los datos de los restaurantes no se comparten con terceros (a diferencia de Google Analytics).
- **Feature flags:** Permite hacer rollouts graduales de features (ej. activar pedidos a mesa solo para 10% de restaurantes).
- **Session recordings:** Ver cómo los dueños interactúan con el panel admin para detectar fricciones.
- **Self-hostable:** Si la escala lo justifica, se puede migrar a instancia propia.

### 2.10 Sentry + Uptime Robot (Monitoreo)

**Elección:** Sentry para errores; Uptime Robot para disponibilidad.

**Razones:**
- **Sentry:** Captura errores con contexto completo (stack trace, breadcrumbs, user info). Integración nativa con Next.js y Vercel.
- **Uptime Robot:** Monitoreo de disponibilidad simple y gratuito para hasta 50 monitors. Alerta por email/Slack si el sitio cae.

**Mejora sugerida:** Agregar Better Uptime o Checkly para monitoreo sintético (simula flujos críticos como "escanear QR → ver menú" y alerta si algún paso falla). Esto es más valioso que un simple ping de uptime.

---

## 3. Herramientas de Desarrollo

| Herramienta | Propósito |
|------------|-----------|
| pnpm | Package manager (más rápido y eficiente en monorepo) |
| Turborepo | Build system para monorepo (cache, parallel tasks) |
| ESLint + Prettier | Linting y formateo de código |
| Husky + lint-staged | Pre-commit hooks |
| Vitest | Testing unitario y de integración |
| Playwright | Testing E2E |
| Supabase CLI | Migraciones, generación de tipos, desarrollo local |
| GitHub Actions | CI/CD |

---

## 4. Monorepo Structure

```
menuos/
├── apps/
│   ├── web/              # Next.js app (PWA comensal + Admin + Mesero + KDS)
│   └── docs/             # Documentación interna
├── packages/
│   ├── ui/               # shadcn/ui extendido con tokens MenuOS
│   ├── database/         # Tipos Supabase, migraciones, seeds
│   ├── shared/           # Utilidades compartidas, constantes, validaciones
│   └── config/           # ESLint, Tailwind, TypeScript configs compartidos
├── supabase/
│   ├── migrations/       # SQL migrations
│   ├── functions/        # Edge Functions (Deno)
│   └── seed.sql          # Datos de prueba
├── turbo.json
├── pnpm-workspace.yaml
└── README.md             # En inglés
```

**Mejora sugerida respecto al documento original:** En lugar de tener proyectos separados para PWA comensal, admin, mesero y KDS, usar un solo app Next.js con rutas diferenciadas y layouts separados. Esto reduce la complejidad del deploy y permite compartir más código. Las distintas "apps" son en realidad route groups de Next.js:

```
apps/web/app/
├── (public)/             # PWA comensal (rutas públicas)
│   └── [slug]/
├── (admin)/              # Panel admin (autenticado)
│   └── dashboard/
├── (waiter)/             # App mesero (PIN auth)
│   └── orders/
└── (kitchen)/            # KDS cocina (PIN auth)
    └── tickets/
```
