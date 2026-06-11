# PRD: Sistema de Notificaciones Push via NATS WebSocket

## 1. Overview

Implementar un sistema de notificaciones en tiempo real utilizando NATS sobre WebSocket para recibir notificaciones del backend sin polling HTTP. El cliente se suscribe a un canal único por usuario y recibe notificaciones push cuando ocurren eventos: nuevo video, video convertido, respuesta a comentario, reporte respondido, y notificaciones generales de la API.

## 2. Architecture

```
┌──────────────┐     WSS      ┌──────────────────┐     NATS      ┌──────────────┐
│   Frontend   │◄────────────►│  natio.picta.cu  │◄─────────────►│   Backend    │
│  (Angular)   │              │  /notification   │               │   (API)      │
└──────┬───────┘              └──────────────────┘               └──────────────┘
       │
       ├── NotificationService (toast in-app)
       ├── BrowserNotificationService (notificación nativa del navegador)
       ├── NotificationStoreService (badge count + lista)
       └── MaterialHeaderComponent (suscriptor UI)
```

## 3. Components

### 3.1 WebSocket Connection Manager (`AuthService`)

Ubicación: `src/app/services/auth.service.ts`

**Responsabilidad:** Gestionar la conexión WebSocket, suscripción NATS, heartbeat, reconexión, y parseo de mensajes.

**Configuración:**
```
URL: wss://natio.picta.cu/notification
Binary type: arraybuffer
Heartbeat: PING/PONG cada 30 segundos
Max reconnect attempts: 5
Reconnect delay: lineal (3s × attempt number)
```

**Protocolo NATS sobre WebSocket:**

El WebSocket transporta mensajes NATS raw. El formato es:

```
# Suscripción (cliente → servidor)
SUB <userCode> 1\r\n

# Mensaje recibido (servidor → cliente)
MSG <subject> <id>\r\n<payload JSON>\r\n

# Heartbeat
Cliente envía: PING\r\n
Servidor responde: PONG\r\n (detectado si la línea contiene "PING")
```

**Flujo de conexión:**

1. `subscribeToNats(userCode)` se llama al hacer login
2. Se almacena `userCode` y se ejecuta `connectWebSocket()`
3. Al abrir conexión (`onopen`):
   - Reset `reconnectAttempts` a 0
   - Iniciar intervalo de heartbeat (30s)
   - Enviar `SUB <userCode> 1\r\n`
4. Al recibir mensaje (`onmessage`):
   - Decodificar ArrayBuffer a string
   - Parsear protocolo NATS (extraer payload de líneas MSG)
   - Si es PONG, ignorar
   - Si es JSON, procesar según tipo
5. Al cerrar (`onclose`):
   - Limpiar heartbeat
   - Si hay intentos restantes, reconectar con delay lineal
6. Al error (`onerror`): silencioso (la reconexión se maneja en `onclose`)

**Métodos auxiliares:**

```typescript
decodeMessage(data: any): string
  // ArrayBuffer → string via TextDecoder
  // string → string (pass-through)

extractNatsPayload(rawMsg: string): string | null
  // Split por \r\n
  // Si lines[0] empieza con "MSG ", retorna lines[1]
  // Sino, retorna null
```

**Variables de estado:**

```typescript
ws: WebSocket                    // Instancia activa
userCode: string                 // Código único del usuario (user.code)
sseSubscribed: boolean           // true cuando conectado y suscripto
reconnectAttempts: number        // Contador de intentos (0-5)
maxReconnectAttempts: number     // 5
reconnectDelay: number           // 3000ms (base)
heartbeatInterval: any           // ID del setInterval
heartbeatTimer: any              // (reservado)
```

### 3.2 Message Router (`AuthService` — `onmessage`)

Cada mensaje JSON recibido se clasifica por tipo y se despacha:

| `identificador` / `tipo` | Acción | Toast | Browser Notification | Badge |
|---|---|---|---|---|
| `publicacion_nueva` | Toast con link al video | ✅ `openNotification()` | ✅ | ❌ |
| `publicacion_convertida` | Toast con link al video | ✅ `openNotification()` | ✅ | ❌ |
| `notificacion_api` | Recargar userData + toast genérico | ✅ `open()` | ✅ | ❌ |
| `notificacion_issue_report` | Toast "reporte respondido" + link a /ayuda-soporte | ✅ `open()` | ✅ | ✅ `incrementBadge()` |
| `respuesta_comentario` | (manejado por BrowserNotificationService) | ❌ | ✅ | ❌ |
| Cualquier tipo | Emitir a `notificationSource` | — | — | — |

**Flujo del header (`MaterialHeaderComponent`):**

```
notifications$.subscribe(data => {
  if (data) {
    notificationStore.load(true);        // Recargar lista desde API
    setTimeout(() => {
      unseenNotifications = badgeCount;  // Actualizar badge local
      cdr.markForCheck();               // Trigger change detection
    }, 300);
    browserNotificationService.showNotification(data);  // Notificación nativa
  }
});
```

### 3.3 In-App Toast Notifications (`NotificationService`)

Ubicación: `src/app/services/notification.service.ts`

**Responsabilidad:** Mostrar notificaciones toast flotantes dentro de la app.

**API pública:**

```typescript
open(type: 'ok' | 'notification' | 'error', msg: string, action?: { label: string; url: string })
openNotification(msg: string, slug: string)  // Abreviado para videos
```

**Implementación:**
- Crea `NotificationToastComponent` dinámicamente via `createComponent()`
- Adjunta al DOM en un container `#islaplay-toast-root` (fixed, top-right, z-9999)
- Duración: 5000ms
- Al cerrar: `detachView()` + `destroy()`

### 3.4 Browser Native Notifications (`BrowserNotificationService`)

Ubicación: `src/app/services/browser-notification.service.ts`

**Responsabilidad:** Mostrar notificaciones nativas del navegador (fuera de la app).

**Flujo:**
1. Al construir, solicitar permiso de notificaciones (`Notification.requestPermission()`)
2. `showNotification({ data, identificador })`:
   - Verificar permiso concedido
   - Verificar si el canal está silenciado (`silenced_channels` en localStorage)
   - Crear `new Notification(title, { body, icon, requireInteraction: true })`
   - Fallback: Service Worker `reg.showNotification()` con vibrate
   - `onclick`: focus window + navegar al URL correspondiente

**Tipos de notificación nativa:**

| `identificador` | Título | Texto | URL destino |
|---|---|---|---|
| `publicacion_nueva` | "Picta - Publicación nueva" | "{canal} publicó: {video}" | `/medias/{slug}` |
| `publicacion_convertida` | "Picta - Publicación convertida" | "{canal} publicó: {video}" | `/medias/{slug}` |
| `respuesta_comentario` | "Picta - Respuesta de comentario" | "{user} respondió tu comentario" | `/medias/{slug}` |
| `solicitud_nueva` | "Picta - Nueva solicitud" | "{user} solicitó..." | `admin.picta.cu/solicitud` |
| `alerta` | "Picta - Nuevo Mensaje" | `{msg}` | `/` |
| `issue_report` / `issue_report_notification` | "Picta - Reporte respondido" | "Su reporte ha sido respondido" | `/ayuda-soporte` |

### 3.5 Notification Store (`NotificationStoreService`)

Ubicación: `src/app/modules/picta/services/notification-store.service.ts`

**Responsabilidad:** Gestión de estado de notificaciones, badge count, y persistencia en localStorage.

**Estado:**
```typescript
notificaciones: signal<Notificacion[]>    // Lista de notificaciones
loading: signal<boolean>                   // Estado de carga
badgeCount: signal<number>                 // Contador del badge
badgeDisplay: computed<string>             // "10+" si > 10, número si <= 10, vacío si 0
```

**Persistencia:**
- Badge count se guarda en `localStorage['notification_badge_count']`
- Se recarga al iniciar el servicio
- Se limpia en `clear()` (logout)

**API pública:**
```typescript
load(forceReload?: boolean)     // GET notificaciones desde API
loadMore()                       // Paginación
incrementBadge()                 // +1 optimista
markAsRead(ids: string)          // Marcar como leídas (optimistic update)
clear()                          // Limpiar todo (logout)
```

## 4. Data Flow Completo

```
1. Login exitoso
   → authService.getUserData() → user.code
   → authService.setUserData(user)
   → authService.subscribeToNats(user.code)

2. Conexión WebSocket
   → new WebSocket('wss://natio.picta.cu/notification')
   → ws.send('SUB <userCode> 1\r\n')
   → Heartbeat cada 30s

3. Evento del backend (ej: nuevo video)
   → NATS: "MSG <subject> 1\r\n{JSON}\r\n"
   → decodeMessage() → string
   → extractNatsPayload() → JSON string
   → JSON.parse() → { identificador, data }

4. Despacho según tipo
   → notificationService.openNotification(msg, slug)  // Toast in-app
   → notificationSource.next(data)                     // Observable para header
   → browserNotificationService.showNotification()     // Notificación nativa

5. Header recibe notificación
   → notificationStore.load(true)                      // Recargar lista desde API
   → unseenNotifications = badgeCount                  // Actualizar badge
   → cdr.markForCheck()                               // Change detection
```

## 5. Edge Cases y Consideraciones

### 5.1 Reconexión
- Delay lineal: 3s, 6s, 9s, 12s, 15s
- Después de 5 intentos, no reconecta (el usuario debe recargar manualmente)
- Al reconectar, se re-suscribe automáticamente al canal del usuario

### 5.2 Heartbeat
- Si el servidor envía PING, el cliente responde PONG
- El heartbeat se limpia al cerrar conexión
- Intervalo: 30 segundos

### 5.3 Multiple Tabs
- Cada tab crea su propia conexión WebSocket
- Todas reciben las mismas notificaciones (el subject es el mismo userCode)
- El badge se persiste en localStorage (compartido entre tabs)

### 5.4 Logout
- `AuthService.logout()` cierra la conexión WebSocket implícitamente
- `NotificationStoreService.clear()` limpia badge y lista
- No hay cleanup explícito del WebSocket en el método logout actual

### 5.5 Errores de Parseo
- Si `extractNatsPayload()` retorna null (mensaje no es MSG), se ignora silenciosamente
- Si `JSON.parse()` falla, se captura en el catch y se ignora
- No se muestra error al usuario por mensajes malformados

## 6. Mensajes Esperados del Backend

### Estructura base
```json
{
  "identificador": "string",   // Tipo de evento
  "tipo": "string",            // Categoría alternativa (algunos mensajes usan esto)
  "data": { ... }              // Payload específico del tipo
}
```

### Tipos de mensaje

**publicacion_nueva / publicacion_convertida:**
```json
{
  "identificador": "publicacion_nueva",
  "data": {
    "nombre_canal": "Canal Name",
    "nombre_publicacion": "Video Title",
    "slug_url": "video-slug",
    "url_imagen": "https://..."
  }
}
```

**notificacion_api:**
```json
{
  "tipo": "notificacion_api",
  "data": {
    "msg": "Mensaje de notificación"
  }
}
```

**notificacion_issue_report:**
```json
{
  "tipo": "notificacion_issue_report",
  "data": {
    "interaction_id": "123"
  }
}
```

**respuesta_comentario:**
```json
{
  "identificador": "respuesta_comentario",
  "data": {
    "usuario_username": "user123",
    "usuario_avatar": "https://...",
    "publicacion_nombre": "Video Title",
    "publicacion_slug_url": "video-slug"
  }
}
```

## 7. Servicios Relacionados

| Servicio | Ubicación | Rol |
|---|---|---|
| `AuthService` | `src/app/services/auth.service.ts` | Conexión WebSocket, suscripción NATS, parseo, despacho |
| `NotificationService` | `src/app/services/notification.service.ts` | Toast in-app (createComponent dinámico) |
| `BrowserNotificationService` | `src/app/services/browser-notification.service.ts` | Notificaciones nativas del navegador |
| `NotificationStoreService` | `src/app/modules/picta/services/notification-store.service.ts` | Estado reactivo, badge, persistencia |
| `MaterialHeaderComponent` | `src/app/modules/picta/components/material-header/` | Suscriptor UI, recarga lista + badge |
| `LocalstorageService` | `src/app/services/localstorage.service.ts` | Acceso a localStorage (silenced_channels, etc.) |

## 8. Variables de Entorno

```typescript
// src/environments/environment.ts
natioUrl: 'https://natio.picta.cu'   // Base URL (no se usa directamente, la URL hardcodeada es wss://natio.picta.cu/notification)
```

## 9. Configuración Angular

No se requiere configuración adicional. El WebSocket se usa nativo del browser (`new WebSocket()`). No hay dependencias externas para NATS — el protocolo se parsea manualmente.

## 10. Testing

### Unit Tests
- `extractNatsPayload()`: parseo de mensajes NATS
- `decodeMessage()`: conversión ArrayBuffer → string
- Clasificación de mensajes por tipo

### Integration Tests
- Conexión → suscripción → recepción de mensaje → toast visible
- Heartbeat PING/PONG
- Reconexión tras cierre de conexión

### Manual Testing
1. Login → verificar consola: "SUB <code> 1\r\n" enviado
2. Abrir另一 pestaña → verificar que ambas reciben notificaciones
3. Desconectar WiFi → verificar reconexión automática
4. Verificar toast aparece al recibir `publicacion_nueva`
5. Verificar notificación nativa del navegador aparece
6. Verificar badge se incrementa en el header
