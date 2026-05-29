# Rutas — Picta Web Frontend

Mapa completo de rutas de la aplicación. Todas las rutas usan lazy loading.

---

## Árbol de Rutas

```
/ (layout principal)
├── / (picta-routing) ───────────────────────────── RUTAS PRINCIPALES (AuthGuard)
│   ├── /                          → HomeComponent (Dashboard)
│   ├── /canal/:alias              → CanalComponent (Canal específico)
│   ├── /serie/:serieNombre        → SerieComponent (Serie)
│   ├── /movie/:slug_url           → MovieComponent (Película)
│   ├── /medias/:slug_url          → PublicacionComponent (Reproductor de video)
│   ├── /search                    → SearchComponent (Búsqueda)
│   ├── /categoria/:cat            → CategoriaComponent (Categoría)
│   ├── /favoritos/:media          → FavoritesExpandedComponent
│   ├── /recientes/:media          → RecentExpandedComponent
│   ├── /recientes-cuba/:media     → RecentCubaExpandedComponent
│   ├── /populares-mes/peliculas   → PopularMonthExpandedComponent
│   ├── /series-actualizadas       → SeriesUpdatedExpandedComponent
│   ├── /shows/recientes           → ShowsUpdatedExpandedComponent
│   ├── /historial                 → HistoryComponent (Historial)
│   ├── /estrenos                  → EstrenosComponent (Estrenos)
│   ├── /tendencias                → PopularesComponent (Tendencias)
│   ├── /animes                    → AnimesComponent (Anime)
│   ├── /shows                     → ShowsComponent (Shows)
│   ├── /shorts                    → ShortsComponent (Cortos verticales)
│   ├── /short/:slug               → ShortComponent (Short individual)
│   ├── /cortos                    → CortosComponent (Cortometrajes)
│   ├── /documental                → DocumentalComponent (Documentales)
│   ├── /musical                   → MusicalComponent (Musical)
│   ├── /deportes                  → DeportesComponent (Deportes)
│   ├── /contenido-premium         → ContenidoPremiumComponent
│   ├── /novelas                   → NovelasComponent (Novelas)
│   ├── /doramas                   → DoramasComponent (Doramas)
│   ├── /infantiles                → InfantilesComponent (Infantil)
│   ├── /videojuegos               → VideojuegosComponent (Videojuegos)
│   ├── /radioenvivo               → RadioComponent (Radio en vivo)
│   ├── /actor                     → ActorComponent (Perfil actor)
│   ├── /director                  → DirectorComponent (Perfil director)
│   ├── /suscripciones             → SuscripcionesComponent (Planes)
│   ├── /notifications             → NotificationCenterComponent
│   ├── /canal-list                → CanalListComponent (Listado canales)
│   ├── /payment/confirm           → PaymentConfirmationComponent
│   ├── /ayuda-soporte             → HelpSupportComponent
│   ├── /faq                       → FAQComponent
│   ├── /about                     → AboutComponent
│   ├── /terms                     → TermsComponent
│   ├── /offline                   → OfflineComponent
│   └── /**                        → NotFoundComponent (404)
│
├── /inicio (landing) ───────────────────────────── SIN AUTH
│   └── Landing pages (múltiples rutas hijas)
│
├── /perfil ──────────────────────────────────────── AuthGuard
│   └── SeleccionarPerfilComponent (Selección de perfil)
│
├── /usuario ─────────────────────────────────────── SIN AUTH
│   ├── /acceder                  → LoginComponent
│   └── /registro                 → RegisterComponent
│
├── /embebido ────────────────────────────────────── EMBED
│   └── Rutas de contenido embebido
│
├── /chat ────────────────────────────────────────── CHAT
│   └── Rutas del chat en tiempo real
│
├── /cortos ──────────────────────────────────────── SHORTS (fullscreen)
│   └── Rutas de cortometrajes
│
├── /payment/enzona/confirm ──────────────────────── CALLBACK PAGO
│   └── EnzonaPaymentConfirmComponent
│
└── /payment/enzona/cancel ───────────────────────── CANCELACIÓN PAGO
    └── EnzonaPaymentCancelComponent
```

---

## Tabla de Rutas Detallada

### Rutas Principales (dentro del layout, AuthGuard)

| Ruta | Componente | Descripción | Auth |
|------|-----------|-------------|------|
| `/` | `HomeComponent` | Dashboard principal con contenido recomendado | ✅ |
| `/canal/:alias` | `CanalComponent` | Página de un canal específico | ✅ |
| `/serie/:serieNombre` | `SerieComponent` | Detalle de serie | ✅ |
| `/movie/:slug_url` | `MovieComponent` | Detalle de película | ✅ |
| `/medias/:slug_url` | `PublicacionComponent` | Reproductor de video principal | ✅ |
| `/search` | `SearchComponent` | Búsqueda global de contenido | ✅ |
| `/categoria/:cat` | `CategoriaComponent` | Contenido filtrado por categoría | ✅ |
| `/favoritos/:media` | `FavoritesExpandedComponent` | Lista expandida de favoritos | ✅ |
| `/recientes/:media` | `RecentExpandedComponent` | Lista expandida de recientes | ✅ |
| `/recientes-cuba/:media` | `RecentCubaExpandedComponent` | Recientes contenido cubano | ✅ |
| `/populares-mes/peliculas` | `PopularMonthExpandedComponent` | Populares del mes | ✅ |
| `/series-actualizadas` | `SeriesUpdatedExpandedComponent` | Series actualizadas | ✅ |
| `/shows/recientes` | `ShowsUpdatedExpandedComponent` | Shows recientes | ✅ |
| `/historial` | `HistoryComponent` | Historial de reproducción | ✅ |
| `/estrenos` | `EstrenosComponent` | Estrenos recientes | ✅ |
| `/tendencias` | `PopularesComponent` | Contenido en tendencia | ✅ |
| `/animes` | `AnimesComponent` | Anime | ✅ |
| `/shows` | `ShowsComponent` | Shows de televisión | ✅ |
| `/shorts` | `ShortsComponent` | Videos cortos (formato vertical) | ✅ |
| `/short/:slug` | `ShortComponent` | Short individual | ✅ |
| `/cortos` | `CortosComponent` | Cortometrajes | ✅ |
| `/documental` | `DocumentalComponent` | Documentales | ✅ |
| `/musical` | `MusicalComponent` | Contenido musical | ✅ |
| `/deportes` | `DeportesComponent` | Deportes | ✅ |
| `/contenido-premium` | `ContenidoPremiumComponent` | Contenido premium | ✅ |
| `/novelas` | `NovelasComponent` | Novelas / telenovelas | ✅ |
| `/doramas` | `DoramasComponent` | Doramas (series asiáticas) | ✅ |
| `/infantiles` | `InfantilesComponent` | Contenido infantil | ✅ |
| `/videojuegos` | `VideojuegosComponent` | Videojuegos | ✅ |
| `/radioenvivo` | `RadioComponent` | Radio cubana en vivo | ✅ |
| `/actor` | `ActorComponent` | Perfil de actor | ✅ |
| `/director` | `DirectorComponent` | Perfil de director | ✅ |
| `/suscripciones` | `SuscripcionesComponent` | Planes de suscripción | ✅ |
| `/notifications` | `NotificationCenterComponent` | Centro de notificaciones | ✅ |
| `/canal-list` | `CanalListComponent` | Listado de todos los canales | ✅ |
| `/payment/confirm` | `PaymentConfirmationComponent` | Confirmación de pago | ✅ |
| `/ayuda-soporte` | `HelpSupportComponent` | Centro de ayuda | ❌ |
| `/faq` | `FAQComponent` | Preguntas frecuentes | ❌ |
| `/about` | `AboutComponent` | Acerca de Picta | ❌ |
| `/terms` | `TermsComponent` | Términos y condiciones | ❌ |
| `/offline` | `OfflineComponent` | Contenido descargado | ❌ |
| `/**` | `NotFoundComponent` | Página 404 | ❌ |

### Rutas Fuera del Layout

| Ruta | Componente | Descripción | Auth |
|------|-----------|-------------|------|
| `/inicio` | Landing pages | Landing page pública (múltiples hijas) | ❌ |
| `/perfil` | `SeleccionarPerfilComponent` | Selección de perfil | ✅ |
| `/usuario/acceder` | `LoginComponent` | Formulario de login | ❌ |
| `/usuario/registro` | `RegisterComponent` | Formulario de registro | ❌ |
| `/embebido/*` | Embed components | Contenido embebido externo | ❌ |
| `/chat/*` | Chat components | Chat en tiempo real | ❌ |
| `/cortos/*` | Shorts components | Cortometrajes fullscreen | ❌ |
| `/payment/enzona/confirm` | `EnzonaPaymentConfirmComponent` | Callback pago EnZona | ❌ |
| `/payment/enzona/cancel` | `EnzonaPaymentCancelComponent` | Cancelación pago EnZona | ❌ |

### Rutas del Profile (hijas de `/profile`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/profile/configuracion` | `ProfileComponent` | Configuración de cuenta |
| `/profile/playlists` | `MyPlaylistComponent` | Mis playlists |
| `/profile/following` | `MySubscriptionsComponent` | Mis suscripciones |
| `/profile/mis-pagos` | `SuscripcionesComponent` | Historial de pagos |
| `/profile/devices` | `MyDevicesComponent` | Mis dispositivos |
| `/profile/request-channel` | `RequestChannelDialogComponent` | Solicitar canal |
| `/profile/seller-form` | `SolicitudFormComponent` | Formulario de publicador |
| `/profile/solicitudes` | `SolicitudListComponent` | Listado de solicitudes |

---

## Guards

### AuthGuard

```typescript
// src/app/services/auth.guard.ts
canActivate(): boolean {
  if (this.loginService.isLoggedIn()) {
    return true;
  } else {
    this.router.navigate(['/inicio']);
    return false;
  }
}
```

**Uso:** Protege rutas que requieren autenticación. Si el usuario no está logueado, redirige a `/inicio`.

---

## Resolvers

### CanalesResolverService

```typescript
// Precarga lista de canales antes de activar la ruta
resolve() {
  return this.canalService.getChanels({
    page: 1,
    page_size: 20,
    ordering: '-cantidad_suscripciones',
    nombre: ''
  });
}
```

### SeriesResolverService

```typescript
// Precarga series antes de activar la ruta
resolve() {
  return this.serieService.getSeries();
}
```

### PlaylistResolveService

```typescript
// Precarga playlist para el reproductor de video
resolve(route: ActivatedRouteSnapshot) {
  const slug = route.params['slug_url'];
  return this.publicationService.getPlaylist(slug);
}
```

---

## Navegación

### Desde el Layout

El layout principal (`LayoutComponent`) contiene:
- **Header** (`MaterialHeaderComponent`): Logo, búsqueda, notificaciones, perfil
- **Sidebar** (`SidebarComponent`): Navegación lateral con categorías
- **Content area**: Router outlet donde se renderizan las páginas

### Navegación Programática

```typescript
// Navegar a una ruta
this.router.navigate(['/medias', slug]);

// Navegar con query params
this.router.navigate(['/search'], { queryParams: { q: 'término' } });

// Navegar con extras
this.router.navigate(['/usuario/acceder'], {
  queryParams: { reason: 'device_required' }
});
```

---

## Parámetros de Ruta

| Ruta | Parámetro | Tipo | Descripción |
|------|-----------|------|-------------|
| `/canal/:alias` | `alias` | string | Alias del canal |
| `/serie/:serieNombre` | `serieNombre` | string | Nombre de la serie |
| `/movie/:slug_url` | `slug_url` | string | Slug de la película |
| `/medias/:slug_url` | `slug_url` | string | Slug del contenido |
| `/categoria/:cat` | `cat` | string | Nombre de categoría |
| `/favoritos/:media` | `media` | string | Tipo de media |
| `/recientes/:media` | `media` | string | Tipo de media |
| `/short/:slug` | `slug` | string | Slug del short |

---

## URLs Externas Importantes

| URL | Uso |
|-----|-----|
| `https://www.picta.cu` | Sitio web principal |
| `https://api.picta.cu` | API REST principal |
| `https://admin.picta.cu` | Panel de administración |
| `https://radio.picta.cu` | Servidor Icecast (radio) |
| `wss://natio.picta.cu/notification` | WebSocket NATS (notificaciones) |
