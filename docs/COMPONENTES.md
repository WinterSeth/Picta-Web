# Componentes — Picta Web Frontend

Catálogo completo de componentes UI organizados por categoría.

---

## Layout Principal

### LayoutComponent

**Ruta:** Componente raíz del layout principal (`src/app/modules/picta/components/layout/`)  
**Uso:** Envuelve todas las páginas autenticadas con header, sidebar y content area.

```
┌─────────────────────────────────────────────┐
│              MaterialHeaderComponent         │
├──────────┬──────────────────────────────────┤
│ Sidebar  │         Router Outlet            │
│ Component│         (Content Area)           │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

---

### MaterialHeaderComponent

**Ruta:** `src/app/modules/picta/components/material-header/`  
**Uso:** Barra de navegación superior con logo, búsqueda, notificaciones y avatar de usuario.

**Elementos:**
- Logo de Picta
- Campo de búsqueda
- Icono de notificaciones con badge
- Avatar de usuario con dropdown

---

### SidebarComponent

**Ruta:** `src/app/modules/picta/components/sidebar/`  
**Uso:** Panel de navegación lateral con categorías de contenido.

**Categorías:**
- Inicio
- Películas
- Series
- Documentales
- Anime
- Doramas
- Novelas
- Shows
- Deportes
- Infantiles
- Radio
- Shorts
- Premium
- Suscripciones

---

## Componentes de UI

### common/

Componentes compartidos utilizados en múltiples páginas.

| Componente | Uso |
|------------|-----|
| Cards de contenido | Muestra thumbnails de videos/series/películas |
| Botones de acción | Play, favorito, suscribir, etc. |
| Skeletons | Placeholders durante carga |
| Spinners | Indicadores de carga |
| Ratings | Estrellas de calificación |

---

### dialogs/

Diálogos modales para interacciones importantes.

| Componente | Uso |
|------------|-----|
| Diálogo de confirmación | Confirmar acciones destructivas |
| Diálogo de suscripción | Proceso de suscripción a canal |
| Diálogo de precio | Selección de plan de pago |

---

### login-dropdown/

Dropdown que aparece en el header cuando el usuario no está autenticado.

**Funcionalidad:**
- Formulario de login rápido
- Link a página de registro
- Olvidé mi contraseña

---

### mobile-dialog/

Diálogo optimizado para dispositivos móviles.

---

### notification-center/

Centro de notificaciones donde el usuario puede ver todas sus notificaciones.

**Funcionalidad:**
- Lista de notificaciones con paginación
- Marcar como leídas
- Filtro por tipo
- Link a la acción correspondiente

---

### notification-toast/

Toast visual para notificaciones en tiempo real.

**Archivo:** `src/app/components/notification-toast/notification-toast.component.ts`

**Props:**
- `type`: 'ok' | 'notification' | 'error'
- `message`: string
- `action`: { label: string; onClick: () => void }
- `duration`: number (default 5000ms)

---

### shorts-carousel/

Carrusel horizontal para contenido de shorts (videos verticales).

---

### download-link/

Componente para iniciar descarga de contenido.

---

### download-popup/

Popup que muestra progreso de descarga o opciones de formato.

---

### canal-list-item/

Item individual en el listado de canales.

**Props:**
- `canal`: Canal object

---

### canal-list/

Listado completo de canales disponibles.

---

### help-support/

Página de ayuda y soporte técnico.

**Funcionalidad:**
- Formulario de reporte de bugs
- Lista de reportes del usuario
- Interacciones con soporte
- FAQ

---

### payment-confirmation/

Confirmación de pago procesado.

---

### enzona-payment-confirm/

Callback de éxito de pago EnZona.

---

### enzona-payment-cancel/

Callback de cancelación de pago EnZona.

---

### landing/

Componentes de la landing page pública.

**Sub-componentes:**
- Hero section
- Featured content
- Pricing plans
- Testimonials
- Footer

---

## Páginas Principales

### HomeComponent

**Ruta:** `/` (dentro del layout)  
**Archivo:** `src/app/modules/picta/pages/home/components/home/`  
**Uso:** Dashboard principal con contenido recomendado.

**Secciones:**
- Banner carousel (hero)
- Continue watching (segundo plano)
- Popular content
- New releases
- Categories
- Recommended for you

---

### PublicacionComponent (Reproductor de Video)

**Ruta:** `/medias/:slug_url`  
**Archivo:** `src/app/modules/picta/pages/medias/components/publicacion/`  
**Uso:** Página principal de reproducción de video.

**Sub-componentes:**
- Player (Shaka Player / HLS.js)
- Video info panel
- Comments section
- Related videos
- Playlist sidebar
- Context menu
- Programación TV (si aplica)

**Servicios utilizados:**
- `PublicationService`
- `ComentarioService`
- `VotoService`
- `PlaylistResolveService`
- `CineModeService`

---

### CanalComponent

**Ruta:** `/canal/:alias`  
**Archivo:** `src/app/modules/picta/pages/canal/components/canal/`  
**Uso:** Página de un canal específico.

**Secciones:**
- Header del canal (avatar, nombre, descripción)
- Botón de suscripción
- Lista de videos del canal
- Playlist del canal
- Información del canal

---

### SerieComponent

**Ruta:** `/serie/:serieNombre`  
**Archivo:** `src/app/modules/picta/pages/serie/components/serie/`  
**Uso:** Detalle de serie con temporadas y capítulos.

**Secciones:**
- Info de la serie (sinopsis, year, país, género)
- Selector de temporada
- Lista de capítulos
- Reproductor de capítulo seleccionado

---

### MovieComponent

**Ruta:** `/movie/:slug_url`  
**Archivo:** `src/app/modules/picta/pages/movie/components/movie/`  
**Uso:** Detalle de película.

**Secciones:**
- Info de la película (sinopsis, director, reparto, año)
- Botón de reproducción
- Botón de descarga (si disponible)
- Contenido relacionado

---

### SearchComponent

**Ruta:** `/search`  
**Archivo:** `src/app/modules/picta/pages/search/components/`  
**Uso:** Búsqueda global de contenido.

**Funcionalidad:**
- Campo de búsqueda con debounce
- Filtros por tipo (película, serie, documental, etc.)
- Filtros por género
- Resultados con paginación infinita

---

### LoginComponent

**Ruta:** `/usuario/acceder`  
**Archivo:** `src/app/modules/picta/pages/login/components/login/`  
**Uso:** Formulario de autenticación.

**Campos:**
- Username / email / teléfono
- Contraseña
- Botón de login
- Link a registro
- Olvidé mi contraseña

---

### RegisterComponent

**Ruta:** `/usuario/registro`  
**Archivo:** `src/app/modules/picta/pages/register/components/register/`  
**Uso:** Formulario de registro de nuevo usuario.

**Campos:**
- Username
- Teléfono / Email
- Fecha de nacimiento
- Contraseña
- Confirmar contraseña
- Código de referido (opcional)

---

### ProfileSidenavComponent

**Ruta:** `/profile` (layout con sidenav)  
**Archivo:** `src/app/modules/picta/pages/profile/components/profile-sidenav/`  
**Uso:** Layout de perfil con navegación lateral.

**Sub-rutas hijas:**
- `/profile/configuracion` — Configuración de cuenta
- `/profile/playlists` — Mis playlists
- `/profile/following` — Mis suscripciones
- `/profile/mis-pagos` — Historial de pagos
- `/profile/devices` — Mis dispositivos
- `/profile/request-channel` — Solicitar canal
- `/profile/seller-form` — Formulario de publicador
- `/profile/solicitudes` — Listado de solicitudes

---

### SeleccionarPerfilComponent

**Ruta:** `/perfil`  
**Archivo:** `src/app/modules/picta/pages/profile/components/seleccionar-perfil/`  
**Uso:** Selección de perfil (similar a Netflix).

**Funcionalidad:**
- Lista de perfiles del usuario
- Crear nuevo perfil
- Editar perfil existente
- Eliminar perfil (si `puede_eliminar`)

---

### RadioComponent

**Ruta:** `/radioenvivo`  
**Archivo:** `src/app/modules/picta/pages/radio/`  
**Uso:** Radio cubana en vivo.

**Funcionalidad:**
- Lista de estaciones de radio
- Reproductor de audio
- Control de volumen y silencio
- Favoritos
- Conteo de oyentes en tiempo real

---

### ShortsComponent

**Ruta:** `/shorts`  
**Archivo:** `src/app/modules/picta/pages/shorts/`  
**Uso:** Videos cortos en formato vertical (estilo TikTok/Reels).

**Funcionalidad:**
- Scroll vertical infinito
- Like / unlike
- Comentarios
- Compartir
- Navegación por swipe

---

### EstrenosComponent

**Ruta:** `/estrenos`  
**Archivo:** `src/app/modules/picta/pages/estrenos/`  
**Uso:** Contenido estrenado recientemente.

---

### PopularesComponent (Tendencias)

**Ruta:** `/tendencias`  
**Archivo:** `src/app/modules/picta/pages/populares/`  
**Uso:** Contenido más popular en tendencia.

---

### AnimesComponent

**Ruta:** `/animes`  
**Archivo:** `src/app/modules/picta/pages/animes/`  
**Uso:** Catálogo de anime.

---

### ShowsComponent

**Ruta:** `/shows`  
**Archivo:** `src/app/modules/picta/pages/shows/`  
**Uso:** Shows de televisión.

---

### DocumentalComponent

**Ruta:** `/documental`  
**Archivo:** `src/app/modules/picta/pages/documental/`  
**Uso:** Catálogo de documentales.

---

### MusicalComponent

**Ruta:** `/musical`  
**Archivo:** `src/app/modules/picta/pages/musical/`  
**Uso:** Contenido musical (videoclips, conciertos).

---

### DeportesComponent

**Ruta:** `/deportes`  
**Archivo:** `src/app/modules/picta/pages/deportes/`  
**Uso:** Contenido deportivo.

---

### NovelasComponent

**Ruta:** `/novelas`  
**Archivo:** `src/app/modules/picta/pages/novelas/`  
**Uso:** Novelas y telenovelas.

---

### DoramasComponent

**Ruta:** `/doramas`  
**Archivo:** `src/app/modules/picta/pages/doramas/`  
**Uso:** Doramas (series asiáticas).

---

### InfantilesComponent

**Ruta:** `/infantiles`  
**Archivo:** `src/app/modules/picta/pages/infantiles/`  
**Uso:** Contenido para niños.

---

### VideojuegosComponent

**Ruta:** `/videojuegos`  
**Archivo:** `src/app/modules/picta/pages/videojuegos/`  
**Uso:** Contenido sobre videojuegos.

---

### ContenidoPremiumComponent

**Ruta:** `/contenido-premium`  
**Archivo:** `src/app/modules/picta/pages/contenido-premium/`  
**Uso:** Contenido exclusivo de pago.

---

### SuscripcionesComponent

**Ruta:** `/suscripciones`  
**Archivo:** `src/app/modules/picta/pages/suscripciones/`  
**Uso:** Planes de suscripción disponibles.

**Funcionalidad:**
- Lista de planes con precios
- Selección de plan
- Proceso de pago con EnZona
- Gestión de suscripción actual

---

### NotFoundComponent

**Ruta:** `/**` (catch-all)  
**Archivo:** `src/app/modules/picta/pages/notfound/components/not-found/`  
**Uso:** Página 404.

---

## Pipes Personalizados

### ShortNumberPipe

**Archivo:** `src/app/modules/picta/pipes/short-number.pipe.ts`  
**Nombre:** `shortNumber`  
**Uso:** Formatea números grandes para mostrar.

```html
{{ 1234 | shortNumber }}  <!-- "1.2K" -->
{{ 1234567 | shortNumber }}  <!-- "1.2M" -->
```

---

### UnseenPipe

**Archivo:** `src/app/modules/picta/pipes/unseen.pipe.ts`  
**Nombre:** `unseen`  
**Uso:** Cuenta notificaciones no vistas.

```html
{{ notificaciones | unseen }}  <!-- Retorna cantidad de no vistas -->
```

---

## Utilidades

### radio-image.util.ts

**Archivo:** `src/app/utils/radio-image.util.ts`  
**Funciones:**

| Función | Parámetros | Retorna | Descripción |
|---------|-----------|---------|-------------|
| `stripDiacritics(input)` | string | string | Elimina tildes y acentos |
| `getImageSrcForStation(st)` | RadioStation | string | Retorna URL de imagen para estación |

**Mapeo de estaciones:**
- `cubandjpro` → `/img/cubandjpro.webp`
- `radio_reloj` → `/img/radioreloj.webp`
- `radio_rebelde` → `/img/radiorebelde.webp`
- `radio_taino` → `/img/radiotaino.webp`
- `radio_progreso` → `/img/radioprogreso.webp`
- `habana_radio` → `/img/radiohabana.webp`
- `radio_enciclopedia` → `/img/radio-enciclopedia.webp`
- Default → `/img/default.webp`

---

### custom-validators.ts

**Archivo:** `src/app/validators/custom-validators.ts`  
**Validadores:**

| Validador | Parámetros | Retorna | Descripción |
|-----------|-----------|---------|-------------|
| `passwordMatchValidator(control)` | AbstractControl | ValidationErrors \| null | Valida que password y repeat_password coincidan |
