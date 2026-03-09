# MenuOS — Lineamientos y Paradigmas de Desarrollo

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Clasificación:** Confidencial — Uso interno  

---

## 1. Filosofía General

Este documento define las reglas, paradigmas y buenas prácticas que todo el equipo de desarrollo debe seguir. Estas no son sugerencias; son compromisos del equipo con la calidad, mantenibilidad y seguridad del producto.

**Principio rector:** Simplicidad deliberada. Cada decisión técnica debe justificarse por el valor que aporta al usuario final (restaurante o comensal), no por su sofisticación técnica. Si una solución simple resuelve el problema, no se busca una compleja.

---

## 2. Mobile-First

### 2.1 Regla

Toda interfaz se diseña y desarrolla primero para la pantalla más pequeña (375px de ancho, equivalente a un iPhone SE) y después se adapta a pantallas mayores. No al revés.

### 2.2 Implementación

- Los breakpoints de Tailwind CSS se usan de menor a mayor: las clases base son para mobile, `md:` para tablet, `lg:` para desktop.
- Los componentes se prueban primero en viewport de 375px antes de verificar desktop.
- Todos los elementos interactivos tienen un área de tap mínima de 44×44px (estándar WCAG).
- Los formularios usan inputs nativos del sistema (date picker, number input) para aprovechar teclados móviles.
- Los modales se reemplazan por sheets/drawers en mobile (deslizar desde abajo).

### 2.3 Excepciones

El KDS de cocina se diseña para tablet (768px mínimo) ya que su uso es exclusivamente en ese dispositivo. Sin embargo, debe funcionar en cualquier pantalla que soporte un navegador moderno.

---

## 3. Atomic Design

### 3.1 Regla

La UI se estructura siguiendo los niveles de Atomic Design de Brad Frost, adaptados al contexto del proyecto.

### 3.2 Estructura

**Atoms (átomos):** Componentes indivisibles y reutilizables. Botones, inputs, labels, badges, avatares, iconos, loaders.

**Molecules (moléculas):** Combinaciones de átomos que forman una unidad funcional. Campo de formulario (label + input + error), card de platillo (foto + nombre + precio + badge), item de lista del CRM (nombre + segmento + fecha).

**Organisms (organismos):** Secciones completas de UI compuestas por moléculas. Formulario de edición de platillo, lista de pedidos pendientes, grid de tarjeta de sellos, tabla del CRM.

**Templates (plantillas):** Layouts que definen la estructura de una página sin datos reales. Layout del admin (sidebar + header + content area), layout del comensal (header del restaurante + content + nav inferior).

**Pages (páginas):** Templates con datos reales. Dashboard del dueño, menú del comensal, vista de pedidos del mesero.

### 3.3 Ubicación en el Monorepo

```
packages/ui/
├── atoms/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   └── ...
├── molecules/
│   ├── MenuItemCard.tsx
│   ├── FormField.tsx
│   └── ...
├── organisms/
│   ├── MenuEditor.tsx
│   ├── OrderList.tsx
│   └── ...
└── templates/
    ├── AdminLayout.tsx
    ├── CustomerLayout.tsx
    └── ...
```

---

## 4. Clean Code

### 4.1 Regla

El código debe ser legible, predecible y mantenible. Se prioriza la claridad sobre la brevedad.

### 4.2 Prácticas Obligatorias

**Nombres descriptivos:** Variables, funciones y componentes usan nombres que describen su propósito sin necesidad de leer la implementación.

```typescript
// ✗ Bad
const d = getD();
const handleClick = () => { ... };

// ✓ Good
const dormantCustomers = getDormantCustomers();
const handleConfirmOrder = () => { ... };
```

**Funciones pequeñas:** Cada función hace una sola cosa. Si una función necesita más de 30 líneas, probablemente debe dividirse.

**Early returns:** Evitar anidamiento excesivo usando returns tempranos.

```typescript
// ✗ Bad
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        // ... logic
      }
    }
  }
}

// ✓ Good
function processOrder(order: Order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (order.status !== 'pending') return;
  // ... logic
}
```

**No magic numbers/strings:** Toda constante tiene un nombre descriptivo.

```typescript
// ✗ Bad
if (daysSinceLastVisit > 21) { ... }

// ✓ Good
const DORMANT_THRESHOLD_DAYS = 21;
if (daysSinceLastVisit > DORMANT_THRESHOLD_DAYS) { ... }
```

**Composición sobre herencia:** En React, componer componentes con props y children. No usar class inheritance.

**Evitar sobrecomplejidad:** No usar patrones de diseño por el hecho de usarlos. Un simple `if/else` es mejor que un Strategy Pattern si solo hay 2 casos. Un archivo plano es mejor que un Factory si solo hay una implementación.

### 4.3 Code Review Checklist

Antes de aprobar un PR, verificar:
- ¿Los nombres son descriptivos y consistentes?
- ¿Hay funciones de más de 30 líneas que deberían dividirse?
- ¿Se evita la duplicación de lógica?
- ¿Los tipos de TypeScript son específicos (no `any`)?
- ¿El componente es reutilizable o está acoplado a un contexto específico?
- ¿Los errores se manejan de forma explícita?

---

## 5. Idioma del Código

### 5.1 Regla

Todo el código, comentarios, nombres de variables/funciones, mensajes de commit, documentación técnica y el README.md se escriben en inglés.

### 5.2 Excepciones

- El contenido visible para el usuario (UI strings) está en español y se gestiona desde archivos de internacionalización (i18n), no hardcodeado en componentes.
- Los datos en la base de datos (nombres de platillos, descripciones, nombres de restaurantes) están en el idioma del restaurante.
- La documentación de producto (este mismo documento y similares) puede estar en español.

### 5.3 Convención de Commits

Se sigue Conventional Commits:

```
feat(menu): add drag-and-drop reordering for categories
fix(orders): resolve race condition in concurrent order confirmation
chore(deps): update supabase sdk to 2.x
docs(api): document public API endpoints for Business plan
```

---

## 6. Minimizar Contenido Estático

### 6.1 Regla

Todo el contenido del sistema debe poder crearse, modificarse, habilitarse/deshabilitarse y eliminarse desde el panel de administración. El contenido hardcodeado en el código debe ser la excepción absoluta.

### 6.2 Qué Debe Ser Dinámico (gestionable desde admin)

| Elemento | Gestionable desde | Ejemplo |
|----------|-------------------|---------|
| Platillos del menú | Editor de menú | Nombre, precio, foto, descripción, disponibilidad |
| Categorías | Editor de categorías | Nombre, icono, color, orden, visibilidad |
| Filtros del menú | Configuración de menú | Vegetariano, sin gluten, picante (crear/eliminar) |
| Colores y marca | Configuración de marca | Logo, colores, banner, plantilla |
| Horarios | Configuración de horarios | Apertura, cierre, días, horario por categoría |
| Roles y permisos | Gestión de usuarios | Crear roles, asignar permisos por módulo |
| Plantillas de WA | Campañas | Crear, editar, activar/desactivar plantillas |
| Automatizaciones | Automatizaciones | Triggers, condiciones, acciones, on/off |
| Programas de lealtad | Fidelización | Sellos, recompensas, reglas, expiración |
| Mesas y zonas | Configuración de mesas | Crear, eliminar, renombrar, asignar a zona |
| Textos de la PWA | Configuración del restaurante | Mensaje de bienvenida, horario cerrado, etc. |
| Notificaciones | Configuración | Habilitar/deshabilitar por tipo y canal |
| Módulos activos | Facturación/Config | Activar/desactivar módulos según plan |
| Sucursales | Configuración | Crear, modificar, desactivar sucursales |

### 6.3 Qué Puede Ser Estático (en código)

- Estructura de la UI (layouts, componentes).
- Lógica de negocio (validaciones, cálculos).
- Textos del sistema de MenuOS (UI del admin, mensajes de error genéricos).
- Configuración técnica (API keys, feature flags de PostHog).

### 6.4 Implementación

- Usar una tabla `settings` con key-value para configuración dinámica a nivel de organización.
- Usar feature flags (PostHog) para habilitar/deshabilitar funcionalidades completas.
- Las plantillas de diseño se almacenan como registros en base de datos, no como archivos de código.
- Los textos visibles al comensal se almacenan en una tabla `organization_texts` que el admin puede editar.

---

## 7. Ciberseguridad

### 7.1 Autenticación y Sesiones

- Passwords hasheados con bcrypt (gestionado por Supabase Auth).
- JWT con expiración corta (15 minutos) + refresh tokens.
- Rate limiting en endpoints de login: máximo 5 intentos por minuto por IP.
- Protección CSRF en todos los formularios.
- Cookies httpOnly y Secure para tokens de sesión.

### 7.2 Autorización

- Row Level Security (RLS) en todas las tablas de Supabase. Ninguna tabla es accesible sin política RLS activa.
- Principio de mínimo privilegio: cada rol solo accede a lo que necesita.
- Validación de permisos tanto en frontend (UI) como en backend (RLS + Edge Functions). Nunca confiar solo en el frontend.
- API keys con scopes limitados para la API pública del plan Business.

### 7.3 Datos Sensibles

- Números de WhatsApp cifrados en reposo (AES-256).
- Datos de pago nunca tocan nuestros servidores (manejados por Stripe/Conekta).
- Cumplimiento de LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares):
  - Aviso de privacidad obligatorio en registro.
  - Opt-in explícito para marketing por WhatsApp.
  - Derecho de acceso, rectificación, cancelación y oposición (ARCO).
  - Exportación de datos del comensal bajo solicitud.

### 7.4 Protección de Infraestructura

- HTTPS obligatorio en todos los endpoints (certificados SSL automáticos vía Cloudflare).
- Headers de seguridad: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options.
- Protección DDoS vía Cloudflare.
- Supabase con acceso restringido: solo la API key `anon` es pública; la `service_role` nunca se expone al cliente.
- Variables de entorno para todos los secrets, nunca en código.

### 7.5 Inputs y Validación

- Validación de inputs en frontend (UX) y backend (seguridad) con Zod.
- Sanitización de HTML en campos de texto para prevenir XSS.
- Queries parameterizadas (Supabase SDK las usa por defecto) para prevenir SQL injection.
- Límites de tamaño en uploads de imágenes (máximo 5MB antes de compresión).

### 7.6 Auditoría

- Tabla `audit_log` que registra toda acción sensible: cambios de precio, envío de campañas, otorgamiento de sellos, cambios de configuración.
- Cada registro incluye: user_id, action, resource_type, resource_id, old_value, new_value, timestamp, IP.
- Los logs son inmutables (insert-only, sin update/delete).

---

## 8. Escalabilidad

### 8.1 Estrategia

La arquitectura se diseña para escalar verticalmente hasta ~5,000 restaurantes sin cambios estructurales. Más allá de ese punto, se evalúa escalado horizontal.

### 8.2 Prácticas

- Queries optimizados con índices en las columnas más consultadas.
- Paginación en todas las listas (no cargar todos los registros).
- Cache de menús en CDN con invalidación instantánea en cambios (stale-while-revalidate).
- Imágenes servidas desde Cloudflare R2/CDN, no desde el servidor de aplicación.
- Edge Functions stateless, sin dependencia de estado en memoria.
- Database connection pooling vía Supabase (pgBouncer incluido).

### 8.3 Límites por Plan

Los límites se aplican como soft limits con alertas y hard limits con bloqueo:

| Recurso | Starter | Pro | Business |
|---------|---------|-----|----------|
| Sucursales | 1 | 2 | 5 |
| Comensales en CRM | 200 | Ilimitado | Ilimitado |
| Mensajes WA / mes | 50 | 500 | Ilimitado |
| Automatizaciones | 0 | 5 flujos | Ilimitado |
| Programas de lealtad | 0 | 1 | Ilimitado |

---

## 9. Modularidad y Reutilización

### 9.1 Componentes

- Todo componente de UI vive en `packages/ui/` y se exporta para uso en cualquier app del monorepo.
- Los componentes no conocen la fuente de datos; reciben props y emiten eventos. El data fetching vive en la capa de página/layout.
- Si un patrón visual aparece 2 veces, se extrae a un componente. Si aparece 3 veces, se convierte en un átomo o molécula del design system.

### 9.2 Hooks y Utilidades

- Custom hooks para lógica reutilizable: `useOrder()`, `useMenu()`, `useCustomer()`, `useRealtime()`.
- Utilidades compartidas en `packages/shared/`: formateo de precios (MXN), cálculo de segmentos, validación de WhatsApp mexicano, generación de QR.
- Servicios de dominio en `packages/shared/services/`: `WhatsAppService`, `PaymentService`, `AnalyticsService`. Abstracciones que permiten cambiar el proveedor subyacente sin afectar el resto del código.

### 9.3 Base de Datos

- Las queries complejas se encapsulan en funciones PL/pgSQL o views de PostgreSQL, no en el código del frontend.
- Las migraciones son incrementales y reversibles. Cada migración tiene su `up` y `down`.
- Los seeds generan datos de prueba realistas para desarrollo y testing.

---

## 10. Testing

### 10.1 Estrategia

- **Unit tests (Vitest):** Para utilidades, hooks y lógica de negocio. Cobertura mínima: 80% en `packages/shared/`.
- **Component tests (Vitest + Testing Library):** Para componentes de UI en `packages/ui/`. Verifican renderizado, interacción y accesibilidad.
- **Integration tests (Vitest):** Para Edge Functions y flujos de datos. Usan Supabase local para tests contra la base de datos real.
- **E2E tests (Playwright):** Para flujos críticos: onboarding, edición de menú, envío de campaña WA, flujo de pedido completo. Se ejecutan en CI contra staging.

### 10.2 Regla de PR

Ningún PR se merge sin:
- Pasar todos los tests existentes.
- Incluir tests para la nueva funcionalidad (si aplica).
- Pasar linting (ESLint) y type-check (tsc --noEmit).
- Al menos 1 code review aprobado.

---

## 11. Performance

### 11.1 Objetivos

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| LCP (Largest Contentful Paint) del menú | <2s en 3G | Lighthouse |
| FID (First Input Delay) | <100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | <0.1 | Lighthouse |
| TTI (Time to Interactive) del admin | <3s en 4G | Lighthouse |
| Tamaño de bundle JS del menú comensal | <150KB gzipped | Webpack analyzer |

### 11.2 Prácticas

- Code splitting por ruta (Next.js lo hace automáticamente).
- Lazy loading de imágenes de platillos con blur placeholder.
- Compresión de imágenes en upload (máx 200KB).
- Prefetch de datos en rutas probables (ej. desde categoría hacia detalle del platillo).
- No cargar módulos innecesarios (si el restaurante no tiene pedidos activos, no cargar el módulo de pedidos).

---

## 12. Documentación

### 12.1 README.md

Cada paquete y app del monorepo tiene un README.md en inglés con:
- Descripción del propósito del paquete.
- Instrucciones de setup local.
- Scripts disponibles.
- Dependencias principales.
- Convenciones específicas del paquete.

### 12.2 Comentarios en Código

- En inglés.
- Solo cuando el "por qué" no es obvio. No comentar el "qué" (el código debe hablar por sí mismo).
- JSDoc para funciones públicas exportadas.
- TODO/FIXME con ticket reference: `// TODO(MOS-123): Implement retry logic for WA send failures`.

### 12.3 ADR (Architecture Decision Records)

Las decisiones arquitectónicas significativas se documentan en `docs/adr/` con formato:
- Título, fecha, status (proposed/accepted/deprecated).
- Contexto: qué problema se resuelve.
- Decisión: qué se decidió.
- Consecuencias: pros y contras aceptados.
