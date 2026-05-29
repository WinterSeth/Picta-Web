# Servicios — Picta Web Frontend

Catálogo completo de todos los servicios de la aplicación, organizados por categoría.

---

## Servicios Globales (`src/app/services/`)

### AuthService

**Archivo:** `src/app/services/auth.service.ts`  
**Responsabilidad:** Autenticación OAuth2, gestión de tokens, login/logout, WebSocket de notificaciones.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `login(loginData)` | Form data (username, password) | `Observable<HttpResponse>` | Login vía OAuth2 password grant |
| `register(registerForm)` | Form data (username, password, etc.) | `Observable` | Registro de nuevo usuario |
| `logout()` | — | `void` | Limpia credenciales y redirige a `/inicio` |
| `forceLogoutWithReason(reason)` | string | `void` | Logout forzado con razón (ej: `device_required`) |
| `isLoggedIn()` | — | `boolean` | Verifica si hay credenciales válidas |
| `getToken()` | — | `string \| null` | Retorna access_token actual |
| `getUserData()` | — | `Observable<UserModel>` | Obtiene datos del usuario desde API |
| `refreshToken()` | — | `Observable` | Renueva access_token usando refresh_token |
| `verifySmsCode(code)` | string | `Observable` | Verifica código SMS de verificación |
| `subscribeToNats(userCode)` | string | `void` | Conecta WebSocket para notificaciones |
| `setUserData(user)` | UserModel | `void` | Actualiza observable del usuario |
| `setNotifications(value)` | any | `void` | Emite notificación a subscribers |
| `loginIslaplay(username, password)` | string, string | `Observable<IslaplayAuthResponse>` | Login para plataforma Islaplay |
| `refreshIslaplayToken()` | — | `Observable<IslaplayAuthResponse>` | Renueva token de Islaplay |
| `logoutIslaplay()` | — | `void` | Logout de Islaplay |
| `isIslaplayAuthenticated()` | — | `boolean` | Verifica autenticación Islaplay |

**Propiedades observables:**
- `user$: BehaviorSubject<UserModel>` — Datos del usuario actual
- `notifications$: BehaviorSubject<any>` — Notificaciones recibidas
- `payment$: BehaviorSubject<any>` — Eventos de pago
- `islaplayToken$: Observable<string>` — Token de Islaplay
- `islaplayUser$: Observable<IslaplayUser>` — Usuario de Islaplay

**Eventos WebSocket (NATS):**
- `publicacion_nueva` — Nuevo video publicado
- `publicacion_convertida` — Video convertido y listo
- `respuesta_comentario` — Respuesta a comentario
- `notificacion_api` — Notificación general de API
- `notificacion_issue_report` — Respuesta a reporte de soporte
- `notificacion_pago` — Evento de pago
- `solicitud_nueva` — Nueva solicitud (canal/seller)

---

### AuthGuard

**Archivo:** `src/app/services/auth.guard.ts`  
**Responsabilidad:** Protege rutas que requieren autenticación.

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `canActivate()` | `boolean` | Retorna `true` si está logueado, `false` y redirige a `/inicio` |

---

### authInterceptor (Token Interceptor)

**Archivo:** `src/app/services/token.interceptor.ts`  
**Responsabilidad:** Intercepta todas las peticiones HTTP y añade el header `Authorization: Bearer {token}`.

```typescript
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authToken = inject(AuthService);
  const newReq = req.clone({ setHeaders: { Authorization: `Bearer ${authToken.getToken()}` }});
  return next(newReq);
}
```

---

### UserService

**Archivo:** `src/app/services/user.service.ts`  
**Responsabilidad:** CRUD de usuarios, recuperación de contraseña, verificación SMS.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `updateUser(id, user)` | number, object | `Observable` | Actualiza datos de usuario |
| `getUserInfo()` | — | `Observable` | Obtiene info del usuario autenticado |
| `verifySms(data)` | {email, phone} | `Observable` | Envía código SMS de verificación |
| `resendSmsCode(data)` | {phone, email} | `Observable` | Reenvía código SMS |
| `changePassword(data)` | {long_token, short_token, new_password} | `Observable` | Cambia contraseña |
| `disableUser(id)` | number | `Observable` | Desactiva cuenta de usuario |
| `getAllUsers(params?)` | object (query params) | `Observable` | Lista todos los usuarios |

**Endpoint:** `https://api.picta.cu/v1/usuario`

---

### PerfilesService

**Archivo:** `src/app/services/perfiles.service.ts`  
**Responsabilidad:** Gestión de perfiles múltiples por usuario (similar a Netflix).

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getAll()` | — | `Observable` | Lista todos los perfiles |
| `create(payload)` | Partial<Perfil> | `Observable` | Crea nuevo perfil |
| `put(id, payload)` | number, Partial<Perfil> | `Observable` | Actualiza perfil completo |
| `patch(id, payload)` | number, Partial<Perfil> | `Observable` | Actualiza perfil parcialmente |
| `delete(id)` | number | `Observable` | Elimina perfil |
| `setActive(id)` | number | `Observable` | Marca perfil como activo |

**Interfaz `Perfil`:**
```typescript
interface Perfil {
  id?: number;
  nombre: string;
  tipo: 'ADULTO' | 'INFANTIL' | string;
  clasificacion?: string;
  preferencias?: any;
  avatar?: string;
  puede_eliminar?: boolean;
  activo?: boolean;
}
```

**Endpoint:** `https://api.picta.cu/v1/perfiles/`

---

### ActivePerfilService

**Archivo:** `src/app/services/active-perfil.service.ts`  
**Responsabilidad:** Gestión del perfil activo actual con signals y localStorage.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getActiveProfileId()` | — | `Signal<number \| null>` | ID del perfil activo como signal |
| `getActiveProfileIdValue()` | — | `number \| null` | ID del perfil activo como valor |
| `setActiveProfileId(id)` | number \| null | `void` | Establece perfil activo |
| `hasActiveProfile()` | — | `boolean` | Verifica si hay perfil seleccionado |
| `clearActiveProfile()` | — | `void` | Limpia perfil activo |

**Almacenamiento:** `localStorage['active-profile-id']`

---

### SubscriptionService

**Archivo:** `src/app/services/subscription.service.ts`  
**Responsabilidad:** Gestión de suscripciones a canales.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `subscribe(canal)` | number | `Observable` | Suscribe a un canal |
| `unsubscribe(id)` | number | `Observable` | Cancela suscripción |
| `update(id, notificaciones)` | number, boolean | `Observable` | Actualiza preferencias de notificación |
| `getSubscriptionsByUser(filter)` | {canalId, usuarioNombre} | `Observable` | Obtiene suscripciones por canal |
| `getSubscriptionsByUserOnly(filter)` | {usuarioNombre} | `Observable` | Obtiene todas las suscripciones |
| `getAllSubscriptionsByUser(filters)` | object | `Observable` | Lista completa de suscripciones |

**Endpoint:** `https://api.picta.cu/v1/suscripcion/` y `/v2/suscripcion/`

---

### NotificationService

**Archivo:** `src/app/services/notification.service.ts`  
**Responsabilidad:** Sistema de notificaciones toast visuales (no nativas del navegador).

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `open(type, msg, action?)` | 'ok'\|'notification'\|'error', string, action? | `void` | Muestra toast con tipo especificado |
| `openNotification(msg, slug)` | string, string | `void` | Muestra toast de notificación con link al video |

**Tipos de toast:**
- `'ok'` — Éxito (verde)
- `'notification'` — Informativo (azul)
- `'error'` — Error (rojo)

---

### BrowserNotificationService

**Archivo:** `src/app/services/browser-notification.service.ts`  
**Responsabilidad:** Notificaciones nativas del navegador y gestión de estado online/offline.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `requestPermission()` | — | `Promise` | Solicita permiso de notificaciones |
| `showNotification({data, identificador})` | object | `void` | Muestra notificación nativa del navegador |

**Eventos manejados:**
- `publicacion_nueva` — Nuevo video
- `publicacion_convertida` — Video convertido
- `respuesta_comentario` — Respuesta a comentario
- `solicitud_nueva` — Nueva solicitud
- `alerta` — Mensaje de alerta
- `issue_report` / `issue_report_notification` — Reporte respondido

**Propiedad observable:**
- `isOnline$: Observable<boolean>` — Estado de conexión

**Características:**
- Soporta Service Worker como fallback
- Canales silenciados se saltan (via `localStorage['silenced_channels']`)
- Auto-solicita permiso en construcción

---

### LocalstorageService

**Archivo:** `src/app/services/localstorage.service.ts`  
**Responsabilidad:** Abstracción de localStorage compatible con SSR (usa DummyStorage en servidor).

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getItem(key)` | string | `any \| null` | Obtiene valor de localStorage |
| `setItem(key, value)` | string, string | `void` | Guarda valor en localStorage |
| `removeItem(key)` | string | `void` | Elimina valor de localStorage |
| `clear()` | — | `void` | Limpia todo el localStorage |
| `getDeviceId()` | — | `string \| null` | Obtiene Device ID guardado |
| `setDeviceId(deviceId)` | string | `void` | Guarda Device ID |
| `clearDeviceId()` | — | `void` | Elimina Device ID |

**Clave especial:** `X_Device_Id` — ID único del dispositivo (recibido del backend)

---

### UtilsService

**Archivo:** `src/app/services/utils.service.ts`  
**Responsabilidad:** Utilidades generales y consulta de FAQ.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getFaqs()` | — | `Observable` | Obtiene preguntas frecuentes |
| `getQueryParams(params)` | object | `HttpParams` | Convierte objeto a HttpParams |
| `getBody(params)` | object | `FormData` | Convierte objeto a FormData |

---

### UserDeviceService

**Archivo:** `src/app/services/user-device.service.ts`  
**Responsabilidad:** Gestión de dispositivos registrados del usuario.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getUserDevices()` | — | `Observable` | Lista dispositivos del usuario |
| `deleteUserDevice(id)` | number | `Observable` | Elimina dispositivo registrado |

**Endpoint:** `https://api.picta.cu/v3/userdevice/`

---

### AdsService

**Archivo:** `src/app/services/ads.service.ts`  
**Responsabilidad:** Gestión de publicidad (lee archivo estático `/ads.json`).

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getAds()` | — | `Observable<any[]>` | Retorna lista de anuncios (cacheado) |
| `refreshAds()` | — | `Observable<any[]>` | Fuerza recarga desde servidor |

**Características:**
- Cacheado con `shareReplay({ bufferSize: 1, refCount: true })`
- Lee de `/ads.json` (archivo estático en `public/`)

---

### SseService

**Archivo:** `src/app/services/sse.service.ts`  
**Responsabilidad:** Cliente Server-Sent Events (SSE) para eventos en tiempo real.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getServerSentEvent(url)` | string | `Observable` | Crea conexión SSE y retorna observable |

**Nota:** Actualmente en desuso — se usa WebSocket/NATS en su lugar.

---

### PanelCloseService

**Archivo:** `src/app/services/panel-close.service.ts`  
**Responsabilidad:** Servicio para cerrar paneles laterales desde cualquier componente.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `closeAllPanel()` | — | `void` | Emite evento para cerrar todos los paneles |

**Evento:** `closeAll` (Output)

---

## Servicios del Módulo Picta (`src/app/modules/picta/services/`)

### NotificationStoreService

**Archivo:** `src/app/modules/picta/services/notification-store.service.ts`  
**Responsabilidad:** Store centralizado de notificaciones con signals, badge count y persistencia.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `load(forceReload?)` | boolean | `void` | Carga notificaciones desde API |
| `loadMore()` | — | `void` | Carga más notificaciones (paginación) |
| `markAsRead(ids)` | string | `Promise` | Marca notificaciones como leídas |
| `incrementBadge()` | — | `void` | Incrementa badge count inmediatamente |
| `clear()` | — | `void` | Limpia cache y badge |
| `badgeCount()` | — | `number` | Retorna conteo actual del badge |
| `getBadgeDisplay()` | — | `string` | Retorna display del badge ("10+" si > 10) |
| `isLoading()` | — | `boolean` | Verifica si está cargando |

**Signals:**
- `notificaciones` — Lista de notificaciones
- `loading` — Estado de carga
- `unseenCount` — Cantidad de no vistas (computed)
- `hasUnseen` — Tiene no vistas (computed)
- `badgeDisplay` — Texto del badge (computed)

**Persistencia:** `localStorage['notification_badge_count']`

---

### CredentialsService

**Archivo:** `src/app/modules/picta/services/credentials.service.ts`  
**Responsabilidad:** Almacenamiento seguro de credenciales de autenticación.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `credentials` (getter) | — | `Credentials \| null` | Credenciales actuales |
| `isAuthenticated()` | — | `boolean` | Verifica si hay credenciales |
| `setCredentials(credentials?, remember?)` | Credentials?, boolean | `void` | Guarda/elimina credenciales |

**Interfaz `Credentials`:**
```typescript
interface Credentials {
  user?: any;
  access_token: string;
  refresh_token: string;
}
```

**Almacenamiento:** `localStorage['credentials']`

---

### LoaderService

**Archivo:** `src/app/modules/picta/services/loader.service.ts`  
**Responsabilidad:** Control global del indicador de carga.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `show()` | — | `void` | Muestra indicador de carga |
| `hide()` | — | `void` | Oculta indicador de carga |

**Observable:** `isLoading` (BehaviorSubject<boolean>)

---

### CineModeService

**Archivo:** `src/app/modules/picta/services/cine-mode.service.ts`  
**Responsabilidad:** Control del modo cine (oculta toolbar y footer durante reproducción).

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `enterCineMode()` | — | `void` | Activa modo cine |
| `exitCineMode()` | — | `void` | Desactiva modo cine |
| `deactivateForNavigation()` | — | `void` | Desactiva temporalmente (mantiene preferencia) |
| `hasStoredPreference()` | — | `boolean` | Verifica si hay preferencia guardada Y suscripción activa |
| `hasActiveSubscription()` | — | `boolean` | Verifica si tiene suscripción activa |
| `getStoredPreference()` | — | `boolean` | Obtiene preferencia de localStorage |
| `storePreference(value)` | boolean | `void` | Guarda preferencia en localStorage |

**Signal:** `isCineMode` (boolean)

**Restricción:** Solo disponible para usuarios con suscripción activa.

---

### NotificacionPublicacionService

**Archivo:** `src/app/modules/picta/services/notificacion-publicacion.service.ts`  
**Responsabilidad:** Comunicación con la API de notificaciones de publicaciones.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getAll(params)` | object | `Observable` | Obtiene todas las notificaciones |
| `markAsRead(id, ids)` | number, string | `Observable` | Marca notificaciones como leídas |

**Endpoints:**
- GET: `https://api.picta.cu/v2/notificacion/`
- PATCH: `https://api.picta.cu/v1/notificacion/{id}/`

---

### ListenerService

**Archivo:** `src/app/modules/picta/services/listener.service.ts`  
**Responsabilidad:** Polling de oyentes activos para estaciones de radio.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `pollListeners(streamKey, periodMs?)` | string, number | `Observable<number>` | Retorna cantidad de oyentes |

**Endpoint:** `https://radio.picta.cu/status-json.xsl`

**Por defecto:** Polling cada 20 segundos.

---

### SupportService

**Archivo:** `src/app/modules/picta/services/support.service.ts`  
**Responsabilidad:** Sistema de reportes de soporte técnico (bugs, problemas de pago, etc.).

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `getReports()` | — | `Observable<IssueReportResponse>` | Lista reportes del usuario |
| `createReport(data)` | FormData | `Observable<IssueReport>` | Crea nuevo reporte |
| `createInteraction(reportId, data)` | number, FormData | `Observable<IssueInteraction>` | Agrega interacción a reporte |

**Signals:**
- `reports` — Lista de reportes
- `isLoading` — Estado de carga

**Interfaz `IssueReport`:**
```typescript
interface IssueReport {
  id: number;
  issue_type: 'bug' | 'performance' | 'payment' | 'ui' | 'other';
  title: string;
  description: string;
  image?: string;
  issue_state: 'pending' | 'reviewing' | 'resolved';
  created_at: string;
  updated_at: string;
  user: SupportUser | number;
  interactions?: IssueInteraction[];
}
```

**Endpoint:** `https://api.picta.cu/v3/issuereport/`

---

### CanalesResolverService

**Archivo:** `src/app/modules/picta/services/canales-resolver.service.ts`  
**Responsabilidad:** Resolver para pre-cargar lista de canales antes de activar ruta.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `resolve(route, state)` | ActivatedRouteSnapshot, RouterStateSnapshot | `Observable` | RetornaObservable de canales |

**Parámetros por defecto:** page=1, page_size=20, ordering=-cantidad_suscripciones

---

### SeriesResolverService

**Archivo:** `src/app/modules/picta/services/series-resolver.service.ts`  
**Responsabilidad:** Resolver para pre-cargar series antes de activar ruta.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `resolve(route, state)` | ActivatedRouteSnapshot, RouterStateSnapshot | `Observable` | RetornaObservable de series |

---

### RadioService (re-export)

**Archivo:** `src/app/modules/picta/services/radio.service.ts`  
**Nota:** Re-exporta el `RadioService` de `src/app/services/radio.service.ts` para mantener compatibilidad con imports del módulo.

---

### RadioService (implementación principal)

**Archivo:** `src/app/services/radio.service.ts`  
**Responsabilidad:** Servicio completo de radio con reproducción, favoritos y获取 de estaciones.

| Método | Parámetros | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `play(station)` | RadioStation | `void` | Reproduce estación de radio |
| `stop(station?)` | RadioStation? | `void` | Detiene reproducción |
| `select(station)` | RadioStation | `void` | Selecciona estación sin reproducir |
| `isPlaying(station)` | RadioStation | `boolean` | Verifica si la estación está sonando |
| `setVolume(v)` | number (0-1) | `void` | Ajusta volumen |
| `toggleMute()` | — | `void` | Activa/desactiva silencio |
| `toggleFavorite(station)` | RadioStation | `void` | Agrega/quita de favoritos |
| `isFavorite(station)` | RadioStation | `boolean` | Verifica si es favorita |
| `getStatus()` | — | `Observable` | Obtiene estado del servidor Icecast |
| `getStations()` | — | `Observable<RadioStation[]>` | Obtiene lista de estaciones |
| `toJSON()` | — | {favorites: string[]} | Serializa favoritos |
| `rehydrate(payload)` | {favorites: string[]} | `void` | Restaura favoritos desde payload |

**Signals:**
- `currentStationId` — ID de estación actual
- `isPlayingSignal` — Estado de reproducción
- `volume` — Volumen actual
- `muted` — Estado de silencio
- `favorites` — Lista de favoritos (computed)

**Persistencia:**
- `localStorage['picta:radio:favorites']` — Favoritos
- `localStorage['picta:radio:volume']` — Volumen
- `localStorage['picta:radio:muted']` — Estado silencio

**Endpoint Icecast:** `https://radio.picta.cu/status-json.xsl`

---

## Servicios por Página

### Home

| Servicio | Archivo | Uso |
|----------|---------|-----|
| `HomeResolverService` | `pages/home/resolvers/` | Pre-carga datos del home |
| `HomeService` | `pages/home/services/` | API del home |

### Medias (Reproductor de Video)

| Servicio | Archivo | Uso |
|----------|---------|-----|
| `PublicationService` | `pages/medias/services/publication-service.ts` | CRUD de publicaciones |
| `ComentarioService` | `pages/medias/services/comentario.service.ts` | Comentarios |
| `DenunciaService` | `pages/medias/services/denuncia.service.ts` | Denuncias de contenido |
| `VotoService` | `pages/medias/services/voto.service.ts` | Votos (me gusta/no me gusta) |
| `ListaReproduccionCanalService` | `pages/medias/services/lista-reproduccion-canal.service.ts` | Playlists de canal |
| `PlaylistResolveService` | `pages/medias/services/playlist-resolve.service.ts` | Resolver de playlist |
| `TvcubanaScheduleService` | `pages/medias/services/tvcubana-schedule.service.ts` | Programación TV Cubana |

### Canal

| Servicio | Archivo | Uso |
|----------|---------|-----|
| `CanalService` | `pages/canal/services/` | CRUD de canales |

### Categoría

| Servicio | Archivo | Uso |
|----------|---------|-----|
| `SerieService` | `pages/categoria/services/serie.service.ts` | Servicio de series |

### Búsqueda

| Servicio | Archivo | Uso |
|----------|---------|-----|
| `SearchService` | `pages/search/services/` | Búsqueda de contenido |

### Perfil

| Servicio | Archivo | Uso |
|----------|---------|-----|
| `ProfileService` | `pages/profile/services/` | Gestión de perfil de usuario |
