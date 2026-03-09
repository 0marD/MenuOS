# MenuOS — Arquitectura de la Aplicación

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Clasificación:** Confidencial — Uso interno  

---

## 1. Visión General de Arquitectura

MenuOS sigue una arquitectura de tres capas con separación clara entre presentación, lógica de negocio y datos. El sistema se compone de múltiples aplicaciones frontend que comparten un backend unificado.

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ PWA      │ │ Panel    │ │ App      │ │ KDS      │   │
│  │ Comensal │ │ Admin    │ │ Mesero   │ │ Cocina   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │            │            │            │          │
├───────┴────────────┴────────────┴────────────┴──────────┤
│                    CAPA DE LÓGICA                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Supabase Edge Functions                │   │
│  │  (Auth · Business Logic · Validaciones · Webhooks)│   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Supabase Realtime (WebSockets)         │   │
│  │  (Pedidos en vivo · Cambios de menú · KDS)       │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    CAPA DE DATOS                         │
│  ┌──────────────┐ ┌────────────┐ ┌──────────────────┐   │
│  │ PostgreSQL   │ │ Supabase   │ │ Cloudflare R2/   │   │
│  │ (Supabase)   │ │ Auth       │ │ Storage (imgs)   │   │
│  └──────────────┘ └────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                          │
    ┌────┴────┐              ┌──────┴──────┐
    │ 360dialog│              │ Stripe /    │
    │ (WA API) │              │ Conekta     │
    └─────────┘              └─────────────┘
```

---

## 2. Aplicaciones Frontend

### 2.1 PWA del Comensal

**Propósito:** Mostrar el menú del restaurante con su marca, permitir la captura de datos, hacer pedidos y gestionar sellos de fidelización.

**Características técnicas:**
- Next.js con SSR para carga rápida y SEO del menú.
- Service workers para cache offline (menú cargado previamente disponible sin conexión).
- Manifest.json para instalación como app en home screen.
- Responsive mobile-first; la experiencia desktop es secundaria.
- Tema dinámico: colores, logo y tipografía del restaurante se cargan desde la configuración del admin.

**Rutas principales:**
- `/:slug` — Menú principal del restaurante.
- `/:slug/menu` — Vista de menú con categorías y filtros.
- `/:slug/cart` — Carrito de pedido (M3).
- `/:slug/order/:id` — Status del pedido en tiempo real (M3).
- `/:slug/loyalty` — Tarjeta de sellos del comensal (M4).
- `/:slug/register` — Captura de datos (nombre + WA).

### 2.2 Panel de Administración

**Propósito:** Dashboard central del dueño/gerente para gestionar todo el sistema.

**Características técnicas:**
- Next.js + shadcn/ui para componentes accesibles y mobile-friendly.
- Mismo monorepo que la PWA del comensal.
- Autenticación por email + password o magic link.
- Layout con sidebar colapsable en mobile.

**Secciones principales:**
- Dashboard (métricas del día/semana).
- Menú (editor de platillos, categorías, fotos).
- CRM (lista de comensales, segmentos, exportación).
- Campañas WA (crear, programar, ver resultados).
- Pedidos (vista en tiempo real de pedidos activos).
- Mesas (editor visual, generación de QR).
- Fidelización (configurar programas, ver analytics).
- Configuración (marca, horarios, usuarios, roles, sucursales).
- Facturación (plan actual, historial, upgrades).

### 2.3 App del Mesero (PWA)

**Propósito:** Vista simplificada para que el mesero gestione pedidos y mesas sin complejidad.

**Características técnicas:**
- PWA instalable, optimizada para uso con una mano.
- Autenticación por PIN de 4 dígitos (sin email).
- Notificaciones push para pedidos nuevos y platos listos.
- Modo offline con cola de acciones que se sincronizan al recuperar conexión.

**Vistas principales:**
- Pedidos pendientes de confirmar.
- Mesas activas con status visual.
- Otorgamiento de sellos (escaneo o código de 4 dígitos).
- Cierre de cuenta por mesa.

### 2.4 Display de Cocina (KDS)

**Propósito:** Pantalla de tickets para la cocina, legible a 2 metros de distancia.

**Características técnicas:**
- PWA en modo fullscreen (kiosk).
- Siempre en modo oscuro con alto contraste.
- Tipografía grande (mínimo 24px).
- Actualización en tiempo real vía WebSockets.
- Compatible con tablet Android, iPad o cualquier navegador moderno.
- Sonido de alerta para nuevos tickets.

**Vistas principales:**
- Cola de tickets ordenados por hora de entrada.
- Alarma visual para tickets >15 min sin atender.
- Marcar plato individual o ticket completo como listo.

---

## 3. Backend y API

### 3.1 Supabase como Backend

Supabase provee el stack completo de backend:

**PostgreSQL (Base de datos):** Toda la lógica de datos relacional. Row Level Security (RLS) para control de acceso a nivel de fila.

**Supabase Auth:** Autenticación de admins (email/password, magic link), comensales (WhatsApp login via custom flow) y meseros/cocina (PIN + session token).

**Supabase Realtime:** WebSockets para actualización instantánea de pedidos en cocina, cambios de menú reflejados en comensales activos y status de pedidos para el comensal.

**Supabase Storage:** Almacenamiento de imágenes de platillos con CDN via Cloudflare. Compresión automática en upload.

**Edge Functions:** Lógica de negocio que no puede vivir solo en el cliente: validación de pedidos, envío de mensajes WA, procesamiento de webhooks de pagos y WA, generación de reportes, cron jobs para automatizaciones.

### 3.2 API Design

La API es implícita vía Supabase Client SDK (PostgREST auto-generado), complementada con Edge Functions para lógica custom.

**Convenciones:**
- Las operaciones CRUD estándar se hacen directamente contra las tablas de Supabase con RLS.
- La lógica de negocio compleja se expone como Edge Functions con rutas RESTful.
- Todas las respuestas siguen el formato JSON estándar.
- Versionado de API pública: `/api/v1/...` (para plan Business).

**Edge Functions principales:**
- `POST /functions/v1/send-whatsapp` — Enviar mensaje WA individual o masivo.
- `POST /functions/v1/process-order` — Validar y confirmar un pedido.
- `POST /functions/v1/grant-stamp` — Otorgar sello con validación anti-fraude.
- `POST /functions/v1/redeem-reward` — Canjear recompensa.
- `POST /functions/v1/webhook-whatsapp` — Recibir eventos de 360dialog.
- `POST /functions/v1/webhook-payments` — Recibir eventos de Stripe/Conekta.
- `GET /functions/v1/analytics/:restaurantId` — Generar reporte de métricas.
- `POST /functions/v1/import-menu` — Importar menú desde PDF/foto (OCR).

---

## 4. Base de Datos

### 4.1 Esquema Principal

**Entidades core:**

```
organizations (restaurante)
├── branches (sucursales)
│   ├── tables (mesas)
│   │   └── table_qr_codes
│   ├── branch_schedules (horarios)
│   └── branch_settings
├── menu_categories
│   └── menu_items (platillos)
│       ├── menu_item_photos
│       ├── menu_item_filters (vegetariano, sin gluten, etc.)
│       └── menu_item_branch_overrides (precio/disponibilidad por sucursal)
├── users (equipo del restaurante)
│   └── user_roles
├── customers (comensales)
│   ├── customer_visits
│   └── customer_consents (LFPDPPP)
├── orders (pedidos)
│   ├── order_items
│   └── order_status_history
├── campaigns (campañas WA)
│   ├── campaign_messages
│   └── campaign_analytics
├── loyalty_programs
│   ├── stamp_cards (tarjeta por comensal)
│   │   └── stamps
│   └── rewards
│       └── reward_redemptions
├── automations (flujos automáticos WA)
├── notifications
└── audit_log (registro de actividad)
```

### 4.2 Tablas Clave (Diseño simplificado)

**organizations:**
- `id` (UUID, PK)
- `name`, `slug` (único, para URL)
- `logo_url`, `banner_url`
- `primary_color`, `secondary_color`
- `template_id` (FK a design_templates)
- `plan` (enum: starter, pro, business)
- `subscription_status`
- `created_at`, `updated_at`

**branches:**
- `id` (UUID, PK)
- `organization_id` (FK)
- `name`, `address`, `phone`
- `latitude`, `longitude`
- `is_active`, `is_temporarily_closed`
- `timezone`

**menu_items:**
- `id` (UUID, PK)
- `organization_id` (FK)
- `category_id` (FK)
- `name`, `description`
- `base_price` (decimal)
- `is_available` (boolean)
- `is_sold_out_today` (boolean)
- `sort_order` (integer)
- `preparation_time_minutes` (integer)
- `created_at`, `updated_at`

**menu_item_branch_overrides:**
- `id` (UUID, PK)
- `menu_item_id` (FK)
- `branch_id` (FK)
- `price_override` (decimal, nullable)
- `is_available_override` (boolean, nullable)

**customers:**
- `id` (UUID, PK)
- `organization_id` (FK)
- `name`
- `whatsapp_number` (cifrado en reposo)
- `segment` (enum: new, frequent, dormant)
- `first_visit_at`, `last_visit_at`
- `visit_count` (integer)
- `birthday` (date, nullable)
- `opt_in_marketing` (boolean)

**orders:**
- `id` (UUID, PK)
- `branch_id` (FK)
- `table_id` (FK)
- `customer_id` (FK, nullable)
- `status` (enum: pending, confirmed, preparing, ready, delivered, cancelled)
- `total_amount` (decimal)
- `notes` (text)
- `created_at`, `confirmed_at`, `ready_at`, `delivered_at`

### 4.3 Row Level Security (RLS)

Cada tabla tiene políticas RLS que garantizan que un restaurante solo ve sus propios datos:

- **Admin:** CRUD completo sobre todos los datos de su organización.
- **Gerente:** CRUD sobre su(s) sucursal(es) asignada(s).
- **Mesero:** Lectura de pedidos y menú de su sucursal; escritura limitada a confirmar pedidos y otorgar sellos.
- **Cocina:** Lectura de pedidos de su sucursal; escritura limitada a marcar platos como listos.
- **Comensal:** Lectura del menú público; escritura limitada a crear pedidos y registrar sus datos.
- **API pública (Business):** Lectura según scopes del API key.

### 4.4 Estrategia de Índices

- Índice compuesto en `(organization_id, is_available)` para consultas de menú.
- Índice en `(branch_id, status)` para pedidos activos.
- Índice en `(organization_id, segment)` para segmentación del CRM.
- Índice en `(customer_id, organization_id)` para lookup de visitas.
- Índice GIN en `name` de menu_items para búsqueda full-text.

---

## 5. Sistema de Roles y Autenticación

### 5.1 Roles del Sistema

| Rol | Autenticación | Scope | Permisos |
|-----|--------------|-------|----------|
| Super Admin | Email + password / Magic link | Toda la organización | CRUD completo, facturación, configuración |
| Gerente | Email + password | Sucursal(es) asignada(s) | Menú, pedidos, CRM, campañas. Sin facturación |
| Mesero | PIN de 4 dígitos | Sucursal asignada | Confirmar pedidos, otorgar sellos, cerrar cuentas |
| Cocina | PIN de 4 dígitos | Sucursal asignada | Ver tickets, marcar platos listos |
| Comensal | WhatsApp login (sin password) | Solo sus datos + menú público | Ver menú, hacer pedidos, ver sus sellos |

### 5.2 Flujo de Autenticación

**Admin / Gerente:**
1. Registro con email + password.
2. Verificación de email.
3. Login genera JWT con claims de `organization_id`, `role` y `branch_ids`.
4. JWT se almacena en cookie httpOnly.
5. Refresh token para sesiones largas.

**Mesero / Cocina:**
1. Admin crea el usuario con nombre y rol.
2. Se genera PIN de 4 dígitos.
3. Mesero/cocina ingresa PIN en la PWA de su sucursal.
4. Se genera session token con scope limitado.
5. Sesión expira al cierre del turno (configurable) o por inactividad.

**Comensal:**
1. Escanea QR → abre PWA.
2. (Opcional) Ingresa nombre + WhatsApp.
3. Se envía código OTP por WhatsApp.
4. Al confirmar OTP, se crea/recupera perfil de comensal.
5. Session almacenada en localStorage de la PWA.
6. En visitas posteriores, se reconoce automáticamente.

### 5.3 Permisos Granulares

Los permisos se definen por módulo y acción:

```
menu:read, menu:write, menu:delete
orders:read, orders:confirm, orders:cancel
crm:read, crm:export
campaigns:read, campaigns:send
loyalty:read, loyalty:grant_stamp, loyalty:redeem
settings:read, settings:write
billing:read, billing:manage
analytics:read
users:manage
```

El Super Admin tiene todos los permisos. Los demás roles tienen subsets predefinidos pero personalizables.

---

## 6. Comunicación en Tiempo Real

### 6.1 Canales de Realtime

El sistema usa Supabase Realtime (WebSockets) para los siguientes canales:

**Canal `orders:{branch_id}`:**
- Eventos: nuevo pedido, pedido confirmado, plato listo, pedido entregado.
- Suscriptores: App Mesero, KDS Cocina, PWA Comensal (solo su pedido).

**Canal `menu:{organization_id}`:**
- Eventos: precio actualizado, platillo agotado, categoría modificada.
- Suscriptores: PWA Comensal (todos los activos en ese menú).

**Canal `tables:{branch_id}`:**
- Eventos: mesa ocupada, mesa libre, pedido activo en mesa.
- Suscriptores: App Mesero.

### 6.2 Estrategia Offline

**PWA Comensal:** Service workers cachean el menú completo. Si no hay conexión, el menú se muestra desde cache con un banner "Precios pueden no estar actualizados".

**App Mesero:** Las acciones (confirmar pedido, otorgar sello) se encolan en IndexedDB y se sincronizan al recuperar conexión. Un indicador visual muestra el estado de conectividad.

**KDS Cocina:** Reconexión automática de WebSocket con backoff exponencial. Si la conexión se pierde, se muestra alerta visual prominente.

---

## 7. Integraciones Externas

### 7.1 WhatsApp Business API (360dialog)

- Conexión: REST API de 360dialog.
- Autenticación: API key por restaurante (gestionado por MenuOS).
- Flujo de envío: Edge Function construye el mensaje → llama a 360dialog API → registra resultado.
- Webhooks entrantes: 360dialog envía eventos de entrega/lectura a Edge Function que actualiza `campaign_messages`.

### 7.2 Pagos (Stripe + Conekta)

- Stripe: Suscripciones de planes + pagos con tarjeta internacional.
- Conekta: Pagos con OXXO Pay y tarjetas mexicanas.
- Webhook de Stripe/Conekta → Edge Function → actualiza `subscription_status`.
- Pagos en mesa (Fase 3): Integración con terminales Clip/Conekta vía API.

### 7.3 Servicios Externos

- Google Business Profile API: Sincronización de horarios.
- Meta Pixel: Tracking de conversiones para retargeting.
- Zapier / Make: Webhooks para que el restaurante conecte herramientas externas.
- OCR (menú desde foto/PDF): Servicio de OCR para onboarding (Tesseract o Google Vision API).

---

## 8. Infraestructura y Deployment

### 8.1 Ambientes

| Ambiente | Propósito | URL |
|----------|----------|-----|
| Development | Desarrollo local | localhost:3000 |
| Staging | QA y pruebas pre-producción | staging.menuos.mx |
| Production | Producción | menuos.mx / *.menuos.mx |

### 8.2 CI/CD

- Repositorio en GitHub (monorepo).
- GitHub Actions para CI (lint, tests, type-check).
- Deploy automático a Vercel en merge a `main` (producción) y `develop` (staging).
- Preview deploys para cada PR.

### 8.3 Monitoreo

- Sentry: Errores en frontend y Edge Functions.
- Uptime Robot: Disponibilidad de la plataforma.
- PostHog: Analytics de producto (funnels, session recordings, feature flags).
- Supabase Dashboard: Métricas de base de datos, auth y realtime.

### 8.4 Escalabilidad

A 300 restaurantes con ~600 scans/mes cada uno = 180,000 operaciones/mes. Este volumen está dentro del tier Pro de Supabase (~$25 USD/mes). La arquitectura escala sin refactor hasta aproximadamente 5,000 restaurantes, punto en el cual se evaluaría migración a infraestructura dedicada o escalado horizontal de Supabase.
