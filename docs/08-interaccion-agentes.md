# MenuOS — Interacción de Agentes con la Aplicación

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Clasificación:** Confidencial — Uso interno  

---

## 1. Definición de Agentes

El sistema MenuOS tiene 5 agentes (actores) que interactúan con la aplicación. Cada agente tiene necesidades, interfaces, permisos y flujos distintos. Este documento describe cómo cada uno interactúa con el sistema y cómo se relacionan entre sí.

| Agente | Descripción | Interfaz Principal | Autenticación |
|--------|-------------|-------------------|---------------|
| Dueño / Super Admin | Propietario del restaurante. Control total del sistema | Panel Admin (web/mobile) | Email + password / Magic link |
| Gerente | Encargado de una o más sucursales | Panel Admin (acceso limitado) | Email + password |
| Mesero | Personal de servicio en piso | App Mesero (PWA) | PIN de 4 dígitos |
| Cocina / Chef | Personal de preparación de alimentos | KDS - Display de Cocina (PWA) | PIN de 4 dígitos |
| Comensal | Cliente que visita el restaurante | PWA del Comensal | WhatsApp login (opcional) |

---

## 2. Agente: Dueño / Super Admin

### 2.1 Perfil

Es la persona que controla todo. Quiere ver métricas, ajustar precios, enviar promociones y no depender de nadie técnico. Gestiona desde su celular en la mayoría de los casos.

### 2.2 Puntos de Contacto con el Sistema

**Onboarding (primera vez):**
1. Se registra con email en menuos.mx.
2. Wizard de 5 pasos: Datos del restaurante → Subir menú → Generar QR → Conectar WhatsApp → Lanzar.
3. Puede importar menú desde PDF o foto (OCR).
4. Elige una plantilla de diseño.
5. En <15 minutos tiene su primer QR funcional.

**Operación diaria:**
1. Abre el panel admin desde su celular.
2. Ve el dashboard: visitas al menú hoy, pedidos activos, nuevos comensales.
3. Si hay un platillo agotado, lo marca como "agotado hoy" con un toggle.
4. Revisa alertas: platillo sin actualizar, QR con muchos escaneos, etc.

**Gestión de menú:**
1. Entra al editor de menú.
2. Cambia precio, nombre, descripción o foto de cualquier platillo.
3. Reordena categorías arrastrando.
4. Oculta una categoría completa (ej. desayunos después de las 12pm).
5. Los cambios se reflejan en tiempo real para todos los comensales activos.

**Marketing (WhatsApp):**
1. Entra a la sección de Campañas WA.
2. Selecciona una plantilla prediseñada o crea una custom.
3. Elige segmento: todos, nuevos, frecuentes o dormidos (>30 días).
4. Programa fecha y hora de envío.
5. Revisa resultados: entregados, leídos, clicks, comensales recuperados.

**Fidelización:**
1. Configura un programa de sellos: número de sellos, tipo de recompensa, condiciones.
2. Ve analytics: participación, tiempo promedio para completar, tasa de canje.
3. Ajusta reglas si el programa no está funcionando.

**Administración:**
1. Crea usuarios (gerentes, meseros, cocina) con roles y permisos.
2. Configura sucursales con horarios y mesas.
3. Gestiona su suscripción y facturación.
4. Exporta datos del CRM en CSV.

### 2.3 Mapa de Permisos

| Módulo | Acceso |
|--------|--------|
| Dashboard | Lectura completa (todas las sucursales) |
| Menú | CRUD completo |
| CRM | CRUD + exportación |
| Campañas WA | CRUD + envío |
| Pedidos | Lectura + cancelación |
| Mesas | CRUD |
| Fidelización | CRUD |
| Configuración | CRUD completo |
| Facturación | Gestión completa |
| Usuarios | CRUD + asignación de roles |
| Analytics | Lectura completa |
| Audit log | Lectura |

---

## 3. Agente: Gerente

### 3.1 Perfil

Es el encargado de la operación diaria de una o más sucursales. Necesita gestionar menú, pedidos y personal, pero no accede a facturación ni a configuración global.

### 3.2 Puntos de Contacto con el Sistema

**Operación diaria:**
1. Accede al panel admin con su email.
2. Ve solo las sucursales que tiene asignadas.
3. Gestiona el menú de su(s) sucursal(es): precios, disponibilidad, fotos.
4. Monitorea pedidos activos y tiempos de preparación.
5. Crea/desactiva usuarios mesero y cocina de su sucursal.

**Marketing:**
1. Puede ver campañas WA activas.
2. Puede crear y enviar campañas con aprobación del admin (según configuración).
3. Ve analytics de su(s) sucursal(es).

### 3.3 Mapa de Permisos

| Módulo | Acceso |
|--------|--------|
| Dashboard | Lectura (sus sucursales) |
| Menú | CRUD (sus sucursales) |
| CRM | Lectura + filtros |
| Campañas WA | Lectura. Crear con aprobación (configurable) |
| Pedidos | Lectura + confirmación + cancelación |
| Mesas | CRUD (sus sucursales) |
| Fidelización | Lectura + otorgar sellos |
| Configuración | Lectura limitada (horarios, marca) |
| Facturación | Sin acceso |
| Usuarios | CRUD de meseros/cocina de sus sucursales |
| Analytics | Lectura (sus sucursales) |

---

## 4. Agente: Mesero

### 4.1 Perfil

No quiere apps complicadas. Necesita confirmar pedidos, otorgar sellos y cerrar cuentas sin interrumpir su flujo de trabajo. Opera con una mano, de pie, mientras atiende mesas.

### 4.2 Interfaz

Usa la App de Mesero (PWA), una interfaz simplificada y optimizada para uso rápido con una mano. Se autentica con un PIN de 4 dígitos, sin email.

### 4.3 Puntos de Contacto con el Sistema

**Inicio de turno:**
1. Abre la PWA del mesero en su celular.
2. Ingresa su PIN de 4 dígitos.
3. Ve las mesas activas de su zona asignada.

**Gestión de pedidos:**
1. Recibe notificación push de nuevo pedido en su zona.
2. Abre el pedido: ve platillos, notas de personalización, mesa.
3. Confirma o rechaza con un tap.
4. El pedido confirmado se envía automáticamente a cocina.
5. Cuando cocina marca un plato como listo, recibe notificación push.
6. Lleva el plato a la mesa.

**Sellos de fidelización:**
1. El comensal muestra su código de 4 dígitos o QR en la PWA.
2. El mesero ingresa el código o escanea el QR.
3. Confirmación visual instantánea para ambos.
4. El sistema previene fraude: máximo 1 sello por mesa por día.

**Cierre de cuenta:**
1. El comensal pide la cuenta.
2. El mesero abre el resumen de la mesa.
3. Ve el total, puede dividir entre comensales.
4. Muestra opciones de propina sugerida (10%, 15%, 20%).
5. Marca la mesa como cerrada.

**Modo offline:**
1. Si se pierde la conexión WiFi, la app sigue funcionando.
2. Las acciones (confirmar pedido, otorgar sello) se encolan.
3. Un indicador visual muestra "Sin conexión — acciones pendientes de sincronizar".
4. Al recuperar conexión, se sincronizan automáticamente.

### 4.4 Mapa de Permisos

| Módulo | Acceso |
|--------|--------|
| Pedidos | Lectura + confirmación + rechazo (su sucursal) |
| Mesas | Lectura + cambiar status (su sucursal) |
| Fidelización | Otorgar sellos + confirmar canjes |
| Menú | Lectura (para consultas de comensales) |
| Todo lo demás | Sin acceso |

---

## 5. Agente: Cocina / Chef

### 5.1 Perfil

Recibe tickets claros, confirma platos listos y necesita que la pantalla sea legible desde 2 metros. No interactúa con menú, CRM, marketing ni configuración.

### 5.2 Interfaz

Usa el KDS (Kitchen Display System), una PWA en modo fullscreen (kiosk) diseñada para tablet. Siempre en modo oscuro con tipografía grande y alto contraste.

### 5.3 Puntos de Contacto con el Sistema

**Inicio de turno:**
1. La tablet de cocina ya está encendida con el KDS en fullscreen.
2. Se autentica con PIN (o se configura para auto-login en esa tablet).
3. Ve la cola de tickets vacía (o con pedidos pendientes).

**Recepción de pedidos:**
1. Suena alerta de nuevo ticket (sonido + indicador visual).
2. El ticket aparece en la cola con: número de mesa, hora de entrada, platillos con notas.
3. Los tickets se ordenan por hora de entrada (FIFO).

**Preparación:**
1. El cocinero trabaja los tickets en orden.
2. Puede marcar platos individuales como listos.
3. Puede marcar el ticket completo como listo.
4. Al marcar un plato como listo, el mesero recibe notificación automática.

**Alertas:**
1. Si un ticket lleva >15 minutos sin atenderse, aparece alarma visual (borde rojo parpadeante).
2. Si la conexión se pierde, se muestra alerta prominente: "SIN CONEXIÓN — Los pedidos nuevos no se están recibiendo".

### 5.4 Mapa de Permisos

| Módulo | Acceso |
|--------|--------|
| Pedidos (KDS) | Lectura + marcar platos/tickets como listos (su sucursal) |
| Todo lo demás | Sin acceso |

---

## 6. Agente: Comensal

### 6.1 Perfil

Escanea el QR, ve el menú, quiere pedir sin fricción y no quiere recibir spam. No instala apps. No crea cuentas complicadas. Quiere una experiencia rápida y bonita con la marca del restaurante.

### 6.2 Interfaz

Usa la PWA del Comensal, que se abre directamente en el navegador al escanear el QR. No requiere descarga. Muestra la marca del restaurante, no la de MenuOS.

### 6.3 Puntos de Contacto con el Sistema

**Primera visita (Módulo 1 — Menú):**
1. Escanea QR en la mesa o entrada.
2. Se abre el navegador con la PWA del restaurante.
3. Ve el menú con categorías, fotos, precios actualizados.
4. Navega con scroll horizontal por categorías.
5. Puede filtrar: vegetariano, sin gluten, picante.
6. Puede buscar por nombre de platillo.
7. (Opcional) Instala la PWA en su home screen.

**Captura de datos (Módulo 2):**
1. Aparece un prompt no intrusivo: "¿Quieres tu sello digital? Regístrate con WhatsApp".
2. Puede elegir "Solo ver menú" sin registrarse.
3. Si acepta, ingresa nombre y WhatsApp (2 campos).
4. Alternativa: login con WhatsApp en un tap (abre WA, confirma, regresa).
5. Se muestra consentimiento explícito para marketing.
6. En visitas posteriores, se reconoce automáticamente por número.

**Pedido (Módulo 3):**
1. Agrega platillos al carrito desde el menú.
2. Puede agregar notas por platillo ("sin cebolla", "extra picante").
3. Ve resumen de la orden con total.
4. Envía la orden (a mesero o directo a cocina, según configuración).
5. Ve status en tiempo real: "Pendiente" → "Confirmado" → "Preparando" → "Listo".
6. Puede agregar más platillos en rondas posteriores.
7. Al final, ve el resumen de consumo y puede solicitar la cuenta.

**Fidelización (Módulo 4):**
1. Ve su tarjeta de sellos con progreso visual.
2. Muestra su código de 4 dígitos o QR al mesero para obtener sello.
3. Ve animación de sello al acumularlo.
4. Recibe notificación por WhatsApp cuando completa la tarjeta.
5. Canjea la recompensa mostrando el código de canje al mesero.
6. Ve historial de recompensas canjeadas.

**Comunicación por WhatsApp (pasiva):**
1. Recibe mensaje de bienvenida en primera visita.
2. Recibe campañas del restaurante (promociones, especiales).
3. Recibe "te extrañamos" si no visita en 21 días.
4. Recibe felicitación de cumpleaños con oferta.
5. Puede responder mensajes (bandeja unificada del restaurante).

### 6.4 Mapa de Permisos

| Módulo | Acceso |
|--------|--------|
| Menú público | Lectura |
| Su perfil | Lectura + edición de su nombre y datos |
| Sus pedidos | Crear + lectura de status |
| Su tarjeta de sellos | Lectura + mostrar código |
| Canjes | Solicitar canje |
| Todo lo demás | Sin acceso |

---

## 7. Diagrama de Interacción entre Agentes

```
                    ┌─────────────────────┐
                    │    DUEÑO / ADMIN     │
                    │  (Panel Admin)       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌────────────┐   ┌────────────┐   ┌────────────────┐
     │  GERENTE   │   │  MESERO    │   │    COCINA      │
     │ (Admin     │   │ (App       │   │ (KDS           │
     │  limitado) │   │  Mesero)   │   │  Cocina)       │
     └──────┬─────┘   └──────┬─────┘   └───────┬────────┘
            │                │                  │
            │                │     ◄────────────┘
            │                │     (plato listo)
            │                │
            │                ▼
            │        ┌────────────┐
            └───────►│  COMENSAL  │
                     │  (PWA)     │
                     └────────────┘
```

### 7.1 Flujos de Interacción Clave

**Flujo 1: Pedido completo (M3)**

```
Comensal (PWA)          Mesero (App)           Cocina (KDS)
     │                      │                      │
     ├──arma orden──────►   │                      │
     │                      │                      │
     │  ◄──notificación─────┤                      │
     │                      │                      │
     │                      ├──confirma────────►   │
     │                      │                      │
     │  ◄──"confirmado"─────┤                      │
     │                      │                      │
     │                      │   ◄──"plato listo"───┤
     │                      │                      │
     │  ◄──"listo"──────────┤                      │
     │                      │                      │
```

**Flujo 2: Sello de fidelización (M4)**

```
Comensal (PWA)          Mesero (App)           Sistema
     │                      │                      │
     ├──muestra código──►   │                      │
     │                      │                      │
     │                      ├──ingresa código──►   │
     │                      │                      │
     │                      │   ◄──valida fraude───┤
     │                      │      (1 sello/día)   │
     │                      │                      │
     │  ◄──animación sello──┤──◄──sello otorgado───┤
     │                      │                      │
     │                      │                      ├──si tarjeta completa──►
     │  ◄──notificación WA──────────────────────────┤  envía WA al comensal
     │                      │                      │
```

**Flujo 3: Campaña de marketing (M2)**

```
Dueño (Admin)           Sistema                Comensal
     │                      │                      │
     ├──crea campaña────►   │                      │
     │  (segmento,          │                      │
     │   plantilla,         │                      │
     │   fecha/hora)        │                      │
     │                      │                      │
     │                      ├──en fecha/hora────►  │
     │                      │  envía vía WA        │
     │                      │                      │
     │                      │   ◄──entregado───────┤
     │                      │   ◄──leído───────────┤
     │                      │   ◄──click───────────┤
     │                      │                      │
     │  ◄──reporte──────────┤                      │
     │   (entregas, lecturas,│                     │
     │    clicks, ROI)      │                      │
```

**Flujo 4: Cambio de menú en tiempo real (M1)**

```
Dueño (Admin)           Sistema                Comensal(es) activos
     │                      │                      │
     ├──cambia precio───►   │                      │
     │  de un platillo      │                      │
     │                      │                      │
     │                      ├──WebSocket broadcast─►│
     │                      │  a todos los          │
     │                      │  comensales activos   │
     │                      │                      │
     │                      │                 ◄────┤ (precio se actualiza
     │                      │                      │  en pantalla sin
     │                      │                      │  recargar la página)
```

---

## 8. Matriz de Acceso por Agente

| Funcionalidad | Dueño | Gerente | Mesero | Cocina | Comensal |
|--------------|-------|---------|--------|--------|----------|
| Ver dashboard | ✅ Total | ✅ Sucursal | ❌ | ❌ | ❌ |
| Editar menú | ✅ | ✅ Sucursal | ❌ | ❌ | ❌ |
| Ver menú público | ✅ | ✅ | ✅ | ❌ | ✅ |
| Gestionar CRM | ✅ | 🔵 Lectura | ❌ | ❌ | ❌ |
| Enviar campañas WA | ✅ | 🔵 Con aprobación | ❌ | ❌ | ❌ |
| Ver pedidos activos | ✅ | ✅ | ✅ Sucursal | ✅ Sucursal | 🔵 Solo los propios |
| Confirmar pedidos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Marcar plato listo | ❌ | ❌ | ❌ | ✅ | ❌ |
| Crear pedido | ❌ | ❌ | ❌ | ❌ | ✅ |
| Otorgar sellos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver sus sellos | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configurar programas lealtad | ✅ | 🔵 Lectura | ❌ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ✅ Mesero/Cocina | ❌ | ❌ | ❌ |
| Configurar mesas | ✅ | ✅ Sucursal | ❌ | ❌ | ❌ |
| Facturación | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver analytics | ✅ | ✅ Sucursal | ❌ | ❌ | ❌ |
| Exportar datos | ✅ | ❌ | ❌ | ❌ | ❌ |

✅ = Acceso completo | 🔵 = Acceso limitado | ❌ = Sin acceso

---

## 9. Consideraciones de UX por Agente

### 9.1 Dueño

- La pantalla más importante es el dashboard. Debe responder la pregunta "¿Cómo va mi negocio hoy?" en 10 segundos.
- Todas las acciones deben ser posibles desde el celular. El dueño rara vez está sentado frente a una computadora.
- Alertas proactivas: el sistema avisa antes de que algo se convierta en problema.

### 9.2 Gerente

- Misma interfaz que el dueño, pero con scope reducido. La UI no muestra opciones para las que no tiene permiso (no las muestra deshabilitadas; las oculta).
- Puede ver métricas comparativas entre sus sucursales si gestiona más de una.

### 9.3 Mesero

- Interfaz ultra-simplificada. Una pantalla, una tarea.
- Operación con una mano, de pie, con interrupciones constantes.
- Área de tap grande (mínimo 44×44px).
- Notificaciones push claras y distinguibles por tipo (nuevo pedido vs plato listo).
- Modo offline robusto: el mesero no puede darse cuenta de que perdió conexión solo porque algo dejó de funcionar.

### 9.4 Cocina

- Tipografía mínima de 24px. Todo debe leerse a 2 metros.
- Fondo oscuro permanente para reducir fatiga visual en jornadas largas.
- Interacción mínima: marcar como listo con un tap. Nada más.
- Sonido de alerta distinguible del ruido de cocina.
- La información crítica es: qué platillo, qué mesa, qué notas de personalización.

### 9.5 Comensal

- No sabe que existe MenuOS. Ve la marca del restaurante.
- No quiere crear cuentas ni descargar apps. Todo funciona en el navegador.
- La captura de datos debe sentirse como un beneficio (sello, descuento), no como un requisito.
- El menú debe cargar en <2 segundos. Cada segundo extra es un comensal que pide la carta física.
- Modo offline: si no hay WiFi, el menú cacheado se muestra con disclaimer.
