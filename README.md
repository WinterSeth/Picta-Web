# Picta Web Frontend

Plataforma web de streaming para contenido audiovisual cubano. Películas, series, documentales, anime, doramas, novelas, radio en vivo, deportes, contenido infantil y cortos (shorts).

**URL Producción:** [https://www.picta.cu](https://www.picta.cu)

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular | 20.x |
| UI Library | Angular Material | 20.x |
| Estilos | SCSS + Tailwind CSS v4 | — |
| Video Player | Shaka Player (DASH/HLS) + HLS.js | 5.x / 1.x |
| Real-time | Socket.IO (`ngx-socket-io`) | 4.x |
| Pagos | EnZona (pasarela de pago cubana) | — |
| Analytics | Matomo (`ngx-matomo-client`) | 8.x |
| PWA | Angular Service Worker (`@angular/service-worker`) | — |
| SSR | Angular SSR (`@angular/ssr` + Express) | 20.x |
| TypeScript | — | 5.8 |

---

## Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- Angular CLI global: `npm install -g @angular/cli`

---

## Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (puerto 4211)
npm start

# Abrir en navegador
open http://localhost:4211
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Dev server en `localhost:4211` (configuración `development`) |
| `npm run start-prod` | Dev server con configuración `production` |
| `npm run build` | Build de producción → `dist/picta/` |
| `npm run build-prod` | Build con `--configuration production` |
| `npm run build-dev` | Build con `--configuration development` |
| `npm test` | Unit tests (Karma/Jasmine) |
| `npm run lint` | Linting |
| `npm run e2e` | End-to-end tests (Protractor) |

> **Puerto 4211** (no el default 4200) para evitar conflictos con otros proyectos.

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/              # Componentes compartidos a nivel app
│   ├── modules/
│   │   ├── picta/               # Módulo principal
│   │   │   ├── animations/      # Animaciones custom
│   │   │   ├── components/      # Componentes de UI (layout, sidebar, dialogs, etc.)
│   │   │   ├── models/          # Interfaces y tipos TypeScript
│   │   │   ├── pages/           # 37 módulos de página (ver abajo)
│   │   │   ├── pipes/           # Pipes personalizados
│   │   │   └── services/        # Servicios del dominio picta
│   │   ├── chat/                # Módulo de chat en tiempo real
│   │   ├── embed/               # Embebido de contenido externo
│   │   └── offline/             # Modo offline / PWA
│   ├── pages/                   # Páginas standalone (radio-demo, radio-favorites)
│   ├── services/                # Servicios globales (auth, user, notifications, etc.)
│   ├── validators/              # Validadores de formularios
│   └── utils/                   # Utilidades compartidas
├── environments/                # Configuración por ambiente
├── styles.scss                  # Estilos globales, tokens CSS, overrides Material
├── css2.css                     # Estilos CSS auxiliares
├── controls.min.css             # Estilos de controles de video
└── index.html                   # Entry point HTML
```

### Módulos de Página (37)

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Home | `/` | Dashboard principal con contenido recomendado |
| Movie | `/movie` | Películas |
| Serie | `/serie/:nombre` | Series por nombre |
| Documental | `/documental` | Documentales |
| Musical | `/musical` | Contenido musical |
| Anime | `/animes` | Anime |
| Doramas | `/doramas` | Doramas (series asiáticas) |
| Novelas | `/novelas` | Novelas / telenovelas |
| Shows | `/shows` | Shows de televisión |
| Deportes | `/deportes` | Contenido deportivo |
| Infantiles | `/infantiles` | Contenido para niños |
| Videojuegos | `/videojuegos` | Contenido sobre videojuegos |
| Canal | `/canal/:alias` | Canales de contenido |
| Canal List | `/canal-list` | Listado de todos los canales |
| Radio en Vivo | `/radioenvivo` | Radio cubana en vivo |
| Shorts | `/shorts` | Videos cortos (formato vertical) |
| Cortos | `/cortos` | Cortometrajes |
| Estrenos | `/estrenos` | Estrenos recientes |
| Tendencias | `/tendencias` | Contenido popular |
| Contenido Premium | `/contenido-premium` | Contenido exclusivo premium |
| Search | `/search` | Búsqueda global |
| Categoría | `/categoria/:cat` | Filtrado por categoría |
| Favoritos | `/favoritos/:media` | Lista de favoritos |
| Recientes | `/recientes/:media` | Historial reciente |
| Perfil | `/perfil` | Selección de perfil (multi-perfil) |
| Profile | `/profile` | Configuración de cuenta |
| Login | `/usuario` | Autenticación |
| Registro | `/usuario/register` | Creación de cuenta |
| Suscripciones | `/suscripciones` | Planes y pagos |
| FAQ | `/faq` | Preguntas frecuentes |
| About | `/about` | Acerca de Picta |
| Terms | `/terms` | Términos y condiciones |
| Ayuda y Soporte | `/ayuda-soporte` | Centro de ayuda |
| Notificaciones | `/notifications` | Centro de notificaciones |
| Offline | `/offline` | Contenido descargado |
| Historial | `/historial` | Historial de reproducción |
| Actor | `/actor` | Perfil de actor |
| Director | `/director` | Perfil de director |

### Rutas Externas (fuera del layout principal)

| Ruta | Descripción |
|------|-------------|
| `/inicio` | Landing page (sin autenticación) |
| `/embebido` | Contenido embebido (iframe externo) |
| `/chat` | Chat en tiempo real |
| `/cortos` | Cortometrajes (layout fullscreen) |
| `/payment/enzona/confirm` | Callback de pago EnZona |
| `/payment/enzona/cancel` | Cancelación de pago |

---

## Servicios Principales

| Servicio | Archivo | Responsabilidad |
|----------|---------|-----------------|
| `AuthService` | `auth.service.ts` | Autenticación OAuth2, tokens, login/logout |
| `AuthGuard` | `auth.guard.ts` | Protección de rutas autenticadas |
| `TokenInterceptor` | `token.interceptor.ts` | Inyección de token Bearer en requests HTTP |
| `UserService` | `user.service.ts` | Datos del usuario autenticado |
| `PerfilesService` | `perfiles.service.ts` | Gestión de perfiles múltiples |
| `ActivePerfilService` | `active-perfil.service.ts` | Perfil activo actual |
| `SubscriptionService` | `subscription.service.ts` | Planes de suscripción y pagos |
| `RadioService` | `radio.service.ts` | Emisoras de radio cubana |
| `NotificationService` | `notification.service.ts` | Notificaciones push y中心 |
| `BrowserNotificationService` | `browser-notification.service.ts` | Notificaciones del navegador |
| `AdsService` | `ads.service.ts` | Publicidad integrada |
| `SseService` | `sse.service.ts` | Server-Sent Events para eventos en tiempo real |
| `CineModeService` | `cine-mode.service.ts` | Modo cine (fullscreen player) |
| `LocalstorageService` | `localstorage.service.ts` | Abstracción de localStorage |
| `UserDeviceService` | `user-device.service.ts` | Detección de dispositivo |
| `UtilsService` | `utils.service.ts` | Utilidades generales |
| `PanelCloseService` | `panel-close.service.ts` | Control de paneles laterales |

---

## Arquitectura y Convenciones

### Componentes Standalone

Todos los componentes usan `standalone: true` y `changeDetection: OnPush` por defecto (configurado en `angular.json` schematics).

### Signals sobre RxJS

Se prefiere el uso de **Signals** de Angular para estado local:
- `signal()` para estado reactivo
- `computed()` para valores derivados
- `input()` / `output()` para inputs/outputs de componentes
- `effect()` para side effects reactivos

### Control Flow Nativo

Se usa el control flow nativo de Angular (no directivas de estructura):
- `@if` / `@else` en lugar de `*ngIf`
- `@for` en lugar de `*ngFor`
- `@switch` en lugar de `*ngSwitch`

### Lazy Loading

Todas las rutas usan lazy loading via `loadComponent` o `loadChildren` con imports dinámicos.

### Inyección de Dependencias

Se usa `inject()`函数 en lugar de inyección por constructor.

### Formularios

Se usan **Reactive Forms** (no template-driven).

### Estilos

- **Tailwind CSS v4** importado en `styles.scss`
- **SCSS** para estilos de componentes y design tokens
- Tokens CSS como variables en `:root` en `styles.scss`
- Tema oscuro únicamente (no hay tema claro)
- Brand accent: amarillo `#f3e628`; secundario: rojo coral `#e8462e`

### Fuentes

| Fuente | Uso |
|--------|-----|
| Bebas Neue | Headlines / títulos |
| Abel | UI / controles |
| Roboto | Body / texto general |

---

## Entornos

| Variable | Producción | Desarrollo |
|----------|-----------|------------|
| `baseUrl` | `https://api.picta.cu` | `https://api.picta.cu` |
| `baseUrlV1` | `https://api.picta.cu/v1` | `https://api.picta.cu/v1` |
| `baseUrlV2` | `https://api.picta.cu/v2` | `https://api.picta.cu/v2` |
| `baseUrlv3` | `https://api.picta.cu/v3` | `https://api.picta.cu/v3` |
| `authUrl` | `https://api.picta.cu/o/token/` | `https://api.picta.cu/o/token/` |
| `natioUrl` | `https://natio.picta.cu` | `https://natio.picta.cu` |

---

## Integraciones Externas

- **EnZona** — Pasarela de pago para usuarios cubanos
- **Matomo** — Análisis de tráfico y comportamiento de usuarios
- **Socket.IO** — Chat en tiempo real, notificaciones, presencia de TV en vivo
- **Shaka Player** — Reproducción de video DASH y HLS
- **HLS.js** — Reproducción HLS como fallback
- **Angular QR Code** (`angularx-qrcode`) — Generación de códigos QR
- **ngx-markdown** — Renderizado de contenido Markdown
- **ngx-mask** — Máscaras de entrada en formularios
- **ngx-owl-carousel-o** — Carruseles de contenido
- **placeholder-loading** — Skeleton screens durante carga

---

## PWA y SSR

- **Service Worker** habilitado solo en producción (`ngsw-config.json`)
- **Server-Side Rendering** via `@angular/ssr` con servidor Express en `server.ts`
- **Modo Offline** — Descarga de contenido para visualización sin conexión

---

## Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar e2e
npm run e2e
```

- Framework de tests: **Karma** + **Jasmine**
- E2E: **Protractor** (configuración presente, infraestructura no activa)

---

## Formateo de Código

```bash
# Formatear todo el proyecto
npx prettier --write .
```

Configuración en `package.json`:
- `singleQuote: true`
- `semi: true`
- `bracketSameLine: true`
- `bracketSpacing: true`

---

## Locale

La aplicación está configurada para `es-US` / `es-CU` para formateo de fechas y números.

---

## Documentación Detallada

La documentación exhaustiva del proyecto se encuentra en la carpeta `/docs/`:

| Archivo | Contenido |
|---------|-----------|
| [docs/README.md](./docs/README.md) | Índice de documentación y resumen rápido |
| [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md) | Arquitectura de módulos, patrones de diseño, flujos |
| [docs/RUTAS.md](./docs/RUTAS.md) | Mapa completo de rutas y navegación |
| [docs/SERVICIOS.md](./docs/SERVICIOS.md) | Catálogo detallado de todos los servicios |
| [docs/MODELOS.md](./docs/MODELOS.md) | Interfaces y modelos de datos TypeScript |
| [docs/COMPONENTES.md](./docs/COMPONENTES.md) | Componentes UI, layout y elementos visuales |
| [docs/DESARROLLO.md](./docs/DESARROLLO.md) | Guía de desarrollo, convenciones y comandos |

---

## Licencia

Proyecto privado — Picta / ETECSA.
