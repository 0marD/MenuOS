# MenuOS — Funcionalidades del SaaS

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Clasificación:** Confidencial — Uso interno  

---

## Mapa General de Módulos

El producto se estructura en 4 módulos funcionales más una capa de plataforma transversal. Cada módulo puede activarse de forma independiente, y todos se gestionan desde un panel de administración centralizado.

| Módulo | Nombre | Fase | Timeline |
|--------|--------|------|----------|
| M1 | Menú QR Editable en Tiempo Real | MVP | Mes 0–3 |
| M2 | Captura de Datos + WhatsApp Marketing | MVP | Mes 1–4 |
| M3 | Pedidos a Mesa → Cocina | Fase 2 | Mes 4–7 |
| M4 | Sellos Digitales y Fidelización | Fase 3 | Mes 7–10 |
| Core | Plataforma Transversal y Panel de Control | Continuo | Mes 0+ |

---

## Módulo 1 — Menú QR Editable en Tiempo Real

### Flujo Principal del Comensal

1. Escanea QR en mesa o entrada.
2. Abre PWA en su navegador, sin descarga.
3. Navega el menú por categorías, fotos y filtros.
4. Ve precios actualizados al instante.
5. (Opcional) Instala la PWA en su home screen.

### Funcionalidades del Admin

**Editor de menú mobile-first:**
- Cambio de precio con confirmación por tap.
- Toggle "Agotado hoy" sin eliminar el platillo.
- Reordenamiento de platillos por arrastrar.
- Cambios reflejados en tiempo real para todos los comensales activos.
- Historial de cambios de precio (auditoría).

**Gestión de categorías y secciones:**
- Categorías con icono y color personalizables.
- Sección "Especiales del día" destacada visualmente.
- Ocultar categorías completas (ej. desayunos fuera de horario).
- Orden de secciones arrastrable.

**Gestión de fotos:**
- Upload desde cámara del celular directo.
- Compresión automática (máx 200kb sin pérdida visible).
- Placeholder elegante si no hay foto.
- Recorte cuadrado automático al subir.

**Multi-sucursal:**
- Una cuenta, hasta 5 sucursales.
- Menú base compartido con variaciones por sucursal.
- QR único por sucursal.
- Cambio de precio global o por sucursal.
- Dashboard consolidado con vista por sucursal.

**Personalización de marca:**
- Logo, banner y colores primario/secundario.
- URL personalizada: turestaurante.menuos.mx.
- Dominio propio en plan premium.
- 5 plantillas de diseño predefinidas.

### Funcionalidades del Comensal (PWA)

- Logo, colores y tipografía del restaurante.
- Navegación por categorías con scroll horizontal.
- Filtros: vegetariano, sin gluten, picante.
- Búsqueda por nombre de platillo.
- Modo oscuro automático según sistema.
- Carga <2 segundos en 3G.

### Decisión de Diseño Clave

El QR apunta siempre a la misma URL permanente. Si el dueño cambia el menú, la URL no cambia y los stickers físicos en las mesas siguen funcionando de por vida.

---

## Módulo 2 — Captura de Datos + WhatsApp Marketing

### Flujo de Captura y Recompra

1. Comensal abre menú (escanea QR).
2. Aparece prompt de sello: "¿Quieres tu sello digital?".
3. Captura nombre + WhatsApp (1 tap por WhatsApp).
4. Datos van al CRM del restaurante (base propia del dueño).
5. Dueño envía campaña WhatsApp (18–25% conversión).

### Funcionalidades

**Captura de datos no intrusiva:**
- Formulario de 2 campos: nombre + WhatsApp.
- Login con WhatsApp (un tap — abre WA y regresa).
- Consentimiento explícito (LFPDPPP / opt-in doble).
- Opción "solo ver menú" sin registrarse.
- Reconocimiento de número en visitas posteriores.

**CRM ligero del restaurante:**
- Lista de comensales con fecha primera/última visita.
- Número de visitas por comensal.
- Segmentos automáticos: Nuevos, Frecuentes, Dormidos.
- Búsqueda y filtros básicos.
- Exportación CSV (datos son del restaurante).

**Campañas WhatsApp:**
- Plantillas aprobadas por Meta listas para usar.
- Variables dinámicas: {nombre}, {platillo}, {descuento}.
- Segmentación: todos, frecuentes, dormidos (>30 días).
- Programación de envío por fecha y hora.
- Reportes de entregado / leído / click.
- Límite de envíos según plan (anti-spam).

**Automatizaciones básicas:**
- "Te extrañamos" — comensal sin visita en 21 días.
- Mensaje de cumpleaños con oferta especial.
- Confirmación de sello registrado.
- Notificación de recompensa desbloqueada.
- Bienvenida en primera visita.

**Integración WhatsApp Business API:**
- BSP recomendado: 360dialog o Vonage (costo por mensaje).
- Número verificado del restaurante (no el de MenuOS).
- Respuestas entrantes gestionadas vía bandeja unificada.
- Webhook para eventos de entrega/lectura.

**Analytics de campañas:**
- Tasa de apertura y respuesta por campaña.
- Comensales recuperados (dormidos → activos).
- ROI estimado por campaña (visitas atribuidas).
- Comparativa semana a semana.

### Métricas de Referencia

| Métrica | Valor |
|---------|-------|
| Conversión WhatsApp en restaurantes LATAM | 18–25% |
| Mayor apertura vs email marketing | 7× |
| Ventana ideal para reactivación | 21 días |
| Costo por cliente recuperado | $3–8 MXN |

---

## Módulo 3 — Pedidos a Mesa → Cocina

### Flujo Completo de un Pedido

1. Comensal arma orden desde su celular.
2. Envía a mesero (o envía directo).
3. Mesero confirma desde su app.
4. Ticket llega a cocina (tablet o impresora).
5. Cocina marca plato/ticket como listo.
6. Comensal ve status en su PWA.

### Funcionalidades

**Carrito y orden desde el menú (Comensal):**
- Carrito persistente durante la sesión de mesa.
- Notas por platillo (personalizaciones).
- Resumen antes de confirmar.
- Opción de ordenar más en rondas posteriores.
- Indicador de tiempo estimado de preparación.

**App de mesero (PWA):**
- Vista de pedidos pendientes de confirmar.
- Confirmar o rechazar pedido con un tap.
- Mapa de mesas en tiempo real.
- Notificación push cuando cocina marca listo.
- Modo sin conexión con sync automático.

**Display de cocina (KDS):**
- Tipografía grande, fondo oscuro, alto contraste.
- Tickets ordenados por hora de entrada.
- Alarma visual si ticket lleva >15 min sin atenderse.
- Marcar plato individual o ticket completo como listo.
- Funciona en cualquier tablet Android o iPad.
- Compatible con impresora térmica vía WiFi (opcional).

**Configuración de mesas (Admin):**
- Editor visual de mesas (drag & drop).
- Generación masiva de QR por mesa.
- Etiquetas para zonas (terraza, interior, barra).
- QR descargable en PDF para imprimir.

**Cierre de cuenta y cobro:**
- Resumen de consumo por mesa.
- División de cuenta entre comensales.
- Propina sugerida (10%, 15%, 20%).
- Integración futura: Clip, Conekta, Stripe.

**Métricas de operación:**
- Tiempo promedio de preparación por platillo.
- Platillos más ordenados del día/semana/mes.
- Ticket promedio por mesa.
- Hora pico de pedidos.
- Tasa de personalización (notas en pedidos).

### Consideración de Go-to-Market

Este módulo requiere que el restaurante tenga una tablet en cocina. Antes de activarlo, el equipo de ventas debe verificar que el restaurante ya tiene el dispositivo o ofrecer una tablet económica a precio de costo como incentivo de upgrade.

---

## Módulo 4 — Sellos Digitales y Fidelización

### Funcionalidades

**Tarjeta de sellos digital (Comensal):**
- Tarjeta visual con sellos (configurable 5–12 sellos).
- Animación de sello al acumular.
- Progreso visible: "Te faltan 2 visitas para tu café gratis".
- Historial de recompensas canjeadas.
- Instalable en wallet del iPhone/Android (futuro).

**Constructor de programa (Admin):**
- Número de sellos para recompensa (configurable).
- Tipo de recompensa: descuento, platillo gratis, 2×1.
- Condición del sello: por visita, por consumo mínimo, por platillo específico.
- Fecha de expiración del sello (ej. 6 meses).
- Múltiples programas simultáneos.

**Otorgamiento de sello (Mesero):**
- El comensal muestra su código en la PWA.
- Mesero escanea o ingresa código de 4 dígitos.
- Confirmación visual instantánea para ambos.
- Prevención de fraude: 1 sello por mesa por día.
- Registro de quién otorgó cada sello.

**Canje de recompensas (Comensal):**
- Notificación WA al completar la tarjeta.
- Código de canje único y con expiración.
- Mesero confirma canje y lo marca usado.
- Historial de canjes en panel del dueño.

**Analytics de fidelización (Admin):**
- Tasa de participación en el programa.
- Tiempo promedio para completar tarjeta.
- Tasa de canje de recompensas.
- Impacto en frecuencia de visita (antes vs después).
- Platillos más canjeados.

**Niveles de membresía (Opcional):**
- Niveles configurables por visitas acumuladas.
- Beneficios exclusivos por nivel.
- Badge visible en la PWA del comensal.
- Segmentación de campañas WA por nivel.

---

## Plataforma Transversal y Panel de Control

### Dashboard del Dueño

- Visitas al menú hoy / esta semana.
- Pedidos activos en tiempo real.
- Nuevos comensales registrados.
- Campañas WA enviadas y su performance.
- Sellos otorgados esta semana.
- Alertas: platillos agotados sin actualizar, QR con muchos escaneos.

### Gestión de Usuarios y Roles

- Roles: Super Admin, Gerente, Mesero, Cocina.
- Permisos granulares por módulo.
- Acceso por PIN (meseros) o email (gerentes).
- Registro de actividad por usuario.
- Multi-sucursal: acceso restringido por ubicación.

### Notificaciones y Alertas

- Nuevo pedido → mesero y cocina.
- Platillo marcado listo → mesero.
- Comensal completó tarjeta → dueño.
- Campaña WA enviada → resumen de resultados.
- Límite de mensajes WA cerca → aviso de upgrade.

### Horarios y Disponibilidad

- Horario de apertura / cierre por día.
- Modo "cerrado temporalmente" con un tap.
- Mensaje personalizable para horario fuera de servicio.
- Platillos disponibles solo en ciertos horarios.

### Integraciones y API

- Google Business Profile (actualizar horarios).
- Meta Pixel para retargeting de comensales.
- Zapier / Make para automatizaciones externas.
- API pública documentada (plan Business).
- Futuro: Rappi, Uber Eats, sistemas contables.

### Onboarding Guiado

- Wizard de 5 pasos: Datos → Menú → QR → WA → Lanzar.
- Importación de menú desde PDF o foto (OCR básico).
- Templates de menú por tipo de restaurante.
- Checklist de completitud visible en dashboard.
- Video tutorial contextual en cada paso.
