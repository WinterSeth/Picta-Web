# Arquitectura — Picta Web Frontend

## Visión General

Picta Web Frontend es una aplicación Angular 20 SPA (Single Page Application) con SSR (Server-Side Rendering) que sirve como la interfaz web principal de la plataforma de streaming Picta. Está diseñada para consumo de contenido audiovisual cubano con soporte para múltiples tipos de contenido: películas, series, documentales, anime, doramas, novelas, radio en vivo, deportes, contenido infantil y shorts.

---

## Arquitectura de Módulos

```
src/app/
├── app.component.ts                    # Componente raíz
├── app.config.ts                       # Configuración de la app (provideRouter, provideHttpClient, etc.)
├── app.config.server.ts                # Configuración SSR
├── app.routes.ts                       # Rutas raíz
│
├── modules/
│   ├── picta/                          # ★ MÓDULO PRINCIPAL
│   │   ├── picta-routing.module.ts     # Rutas del módulo principal
│   │   ├── animations/                 # Animaciones custom
│   │   ├── components/                 # Componentes de UI compartidos
│   │   │   ├── layout/                 # Layout principal (header + sidebar + content)
│   │   │   ├── material-header/        # Header de Material Design
│   │   │   ├── sidebar/                # Sidebar de navegación
│   │   │   ├── common/                 # Componentes comunes (cards, botones, etc.)
│   │   │   ├── dialogs/                # Diálogos modales
│   │   │   ├── login-dropdown/         # Dropdown de login
│   │   │   ├── mobile-dialog/          # Diálogo móvil
│   │   │   ├── notification-center/    # Centro de notificaciones
│   │   │   ├── shorts-carousel/        # Carrusel de shorts
│   │   │   ├── download-link/          # Link de descarga
│   │   │   ├── download-popup/         # Popup de descarga
│   │   │   ├── enzona-payment-confirm/ # Confirmación de pago EnZona
│   │   │   ├── enzona-payment-cancel/  # Cancelación de pago EnZona
│   │   │   ├── payment-confirmation/   # Confirmación de pago general
│   │   │   ├── help-support/           # Ayuda y soporte
│   │   │   └── canal-list-item/        # Item de lista de canales
│   │   ├── models/                     # Modelos del dominio picta
│   │   │   ├── response.picta.model.ts # Interfaz genérica de respuesta API
│   │   │   └── user.model.ts           # Modelo de usuario
│   │   ├── pages/                      # 37 módulos de página
│   │   ├── pipes/                      # Pipes personalizados
│   │   │   ├── short-number.pipe.ts    # Formatea números grandes (1.2K, 3.4M)
│   │   │   └── unseen.pipe.ts          # Cuenta notificaciones no vistas
│   │   └── services/                   # Servicios del dominio picta
│   │
│   ├── chat/                           # MÓDULO DE CHAT
│   │   ├── chat-routing.module.ts
│   │   ├── components/                 # Componentes del chat
│   │   ├── models/                     # Modelos del chat
│   │   └── services/                   # Servicios del chat
│   │
│   ├── embed/                          # MÓDULO EMBED
│   │   ├── embed-routing.module.ts
│   │   └── components/                 # Componentes de embebido
│   │
│   └── offline/                        # MÓDULO OFFLINE
│       └── network-status-button/      # Botón de estado de red
│
├── components/                         # Componentes compartidos a nivel app
│   └── notification-toast/             # Toast de notificaciones
│
├── pages/                              # Páginas standalone
│   ├── radio-demo/                     # Demo de radio
│   └── radio-favorites/               # Favoritos de radio
│
├── services/                           # Servicios globales (19 archivos)
├── validators/                         # Validadores de formularios
├── utils/                              # Utilidades compartidas
└── shorter.pipe.ts                     # Pipe acortador
```

---

## Patrones de Diseño

### 1. Standalone Components (sin NgModules)

Todos los componentes usan `standalone: true`. No existen NgModules para componentes. Esto reduce el tamaño del bundle y mejora el tree-shaking.

```typescript
@Component({
  selector: 'app-mi-componente',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MaterialModule],
  templateUrl: './mi-componente.component.html',
  styleUrl: './mi-componente.component.scss'
})
export class MiComponenteComponent { }
```

### 2. Signals para Estado Reactivo

Se usa `signal()`, `computed()`, `effect()` de Angular en lugar de `BehaviorSubject` de RxJS para estado local:

```typescript
// Estado reactivo con signals
private _loading = signal(false);
readonly loading = this._loading.asReadonly();

// Valores derivados
readonly unseenCount = computed(() =>
  this._notificaciones().filter(n => !n.vista).length
);

// Side effects
effect(() => {
  const v = this._volume();
  if (this.audio) this.audio.volume = v;
});
```

### 3. Control Flow Nativo

Se usa el control flow nativo de Angular (no directivas de estructura):

```html
<!-- En lugar de *ngIf -->
@if (isLoading) {
  <app-spinner />
}

<!-- En lugar de *ngFor -->
@for (item of items; track item.id) {
  <app-card [item]="item" />
}

<!-- En lugar de *ngSwitch -->
@switch (tipo) {
  @case ('pelicula') { <app-movie /> }
  @case ('serie') { <app-serie /> }
}
```

### 4. Lazy Loading Universal

Todas las rutas usan lazy loading via imports dinámicos:

```typescript
{
  path: 'medias/:slug_url',
  loadComponent: () =>
    import('./components/publicacion/publicacion.component')
      .then(v => v.PublicacionComponent),
  resolve: {
    playlist: PlaylistResolveService
  }
}
```

### 5. Inyección de Dependencias con inject()

Se usa `inject()` en lugar de inyección por constructor:

```typescript
@Injectable({ providedIn: 'root' })
export class MiServicio {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
}
```

### 6. Auth Guard Pattern

Las rutas protegidas usan `AuthGuard` que verifica autenticación:

```typescript
{
  path: 'home',
  loadComponent: () => import('./pages/home/home.component'),
  canActivate: [AuthGuard]  // ← Protegido
}
```

### 7. Route Resolvers

Se usan resolvers para pre-cargar datos antes de activar la ruta:

```typescript
{
  path: 'canal-list',
  loadComponent: () => import('./canal-list.component'),
  resolve: { canales: CanalesResolverService },
  canActivate: [AuthGuard]
}
```

### 8. WebSocket para Tiempo Real

Conexión WebSocket a `wss://natio.picta.cu/notification` con protocolo NATS:

```
┌─────────────┐     WebSocket (NATS)     ┌──────────────────┐
│   Frontend   │ ◄──────────────────────► │  natio.picta.cu  │
│  (Browser)   │                          │  (Notification)  │
└─────────────┘                          └──────────────────┘
       │
       │  Tipos de mensaje:
       │  - publicacion_nueva
       │  - publicacion_convertida
       │  - respuesta_comentario
       │  - notificacion_api
       │  - notificacion_issue_report
       │  - notificacion_pago
       │  - solicitud_nueva
       └──► UI: Toast, Snackbar, Badge update
```

### 9. Multi-Perfil

Soporte para múltiples perfiles por usuario (similar a Netflix):

```
Usuario → Perfil 1 (Adulto)
        → Perfil 2 (Infantil)
        → Perfil 3 (Adulto)
```

El perfil activo se guarda en localStorage y se gestiona con `ActivePerfilService`.

---

## Flujo de Autenticación

```
┌──────────┐    POST /o/token/    ┌──────────┐
│  Login    │ ──────────────────► │   API    │
│  Form     │ ◄────────────────── │  Picta   │
└──────────┘   access_token      └──────────┘
     │         refresh_token
     │              │
     ▼              ▼
┌──────────────────────────┐
│  CredentialsService      │
│  (localStorage)          │
│  - access_token          │
│  - refresh_token         │
│  - user data             │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  AuthInterceptor         │
│  Añade Bearer token      │
│  a cada HTTP request     │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  WebSocket Connection    │
│  Suscribe a notif.       │
│  del usuario             │
└──────────────────────────┘
```

### Token Refresh

El `TokenInterceptor` detecta respuestas 401 y ejecuta `refreshToken()` automáticamente. Si el refresh falla, se ejecuta `logout()`.

---

## Flujo de Notificaciones

```
WebSocket (NATS)
       │
       ▼
┌──────────────────────────┐
│  AuthService             │
│  subscribeToNats()       │
│  Decodifica mensajes     │
└──────────────────────────┘
       │
       ├──► notificationSource.next(data)  → Header (badge)
       ├──► NotificationService.open()     → Toast visual
       ├──► BrowserNotificationService     → Notif. nativa del navegador
       └──► NotificationStoreService       → Store de notificaciones
```

---

## Flujo de Radio

```
┌──────────────────────────┐
│  RadioService            │
│  (Signals-based)         │
│  - play(station)         │
│  - stop()                │
│  - setVolume(v)          │
│  - toggleFavorite()      │
└──────────────────────────┘
       │
       ├──► HTMLAudioElement (reproducción)
       ├──► localStorage (favoritos, volumen)
       └──► Icecast Status API (estaciones)
            GET https://radio.picta.cu/status-json.xsl
```

---

## SSR (Server-Side Rendering)

La app tiene soporte SSR via `@angular/ssr` con un servidor Express en `server.ts`. El SSR está habilitado solo en producción y proporciona:

- SEO mejorado (meta tags, Open Graph)
- Carga inicial más rápida
- Social media previews

---

## PWA (Progressive Web App)

Service Worker configurado via `ngsw-config.json`, habilitado solo en producción:

- Caching de assets estáticos
- Offline support para contenido descargado
- Push notifications via Service Worker

---

## Gestión de Estado

```
┌─────────────────────────────────────────────────┐
│                  STATE MANAGEMENT                │
├─────────────────────────────────────────────────┤
│                                                  │
│  Signals (Angular)     │  BehaviorSubject (RxJS) │
│  ─────────────────     │  ──────────────────────  │
│  - Notificaciones      │  - User data            │
│  - Radio favorites     │  - Payment events       │
│  - Loading states      │  - Notifications        │
│  - Cine mode           │  - Islaplay token       │
│  - Badge count         │  - Online status        │
│                                                  │
│  localStorage          │  API Cache              │
│  ─────────────         │  ──────────             │
│  - Credentials         │  - Ads (shareReplay)    │
│  - Active profile      │  - Station data         │
│  - Radio favorites     │                          │
│  - Radio volume        │                          │
│  - Cine mode pref      │                          │
│  - Silenced channels   │                          │
│  - Device ID           │                          │
│  - Badge count         │                          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Integraciones Externas

| Servicio | Uso | Endpoint |
|----------|-----|----------|
| **API Picta** | CRUD de contenido, usuarios, suscripciones | `https://api.picta.cu/v1/`, `/v2/`, `/v3/` |
| **EnZona** | Pasarela de pago cubana | SDK externo |
| **Icecast** | Radio streaming | `https://radio.picta.cu/status-json.xsl` |
| **NATS WebSocket** | Notificaciones en tiempo real | `wss://natio.picta.cu/notification` |
| **Matomo** | Analytics | SDK `ngx-matomo-client` |
| **Shaka Player** | Reproducción DASH/HLS | Librería local |
| **HLS.js** | Fallback HLS | Librería local |

---

## Convenciones de Archivos

```
nombre-Componente/
├── nombre-componente.component.ts      # Componente principal
├── nombre-componente.component.html    # Template
├── nombre-componente.component.scss    # Estilos
├── nombre-componente.component.spec.ts # Tests (opcional)
├── sub-componente/                     # Sub-componentes
├── services/                           # Servicios específicos
├── models/                             # Modelos/interfaces
└── nombre-routing.module.ts            # Rutas (si es página)
```

- **Componentes**: `kebab-case` con sufijo `.component`
- **Servicios**: `kebab-case` con sufijo `.service`
- **Pipes**: `kebab-case` con sufijo `.pipe`
- **Modelos**: `kebab-case` con sufijo `.model`
- **Guards**: `kebab-case` con sufijo `.guard`
- **Interceptors**: `kebab-case` con sufijo `.interceptor`
