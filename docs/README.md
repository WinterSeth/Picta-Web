# Picta Web Frontend — Documentación

Plataforma web de streaming para contenido audiovisual cubano. Películas, series, documentales, anime, doramas, novelas, radio en vivo, deportes, contenido infantil y cortos (shorts).

**URL Producción:** [https://www.picta.cu](https://www.picta.cu)  
**API:** `https://api.picta.cu`  
**Documentación de referencia:** Ver archivos en esta carpeta `/docs/`

---

## Índice de Documentación

| Archivo | Contenido |
|---------|-----------|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Arquitectura general, patrones de diseño, estructura de módulos |
| [RUTAS.md](./RUTAS.md) | Mapa completo de rutas, navegación y guards |
| [SERVICIOS.md](./SERVICIOS.md) | Catálogo detallado de todos los servicios con sus métodos |
| [MODELOS.md](./MODELOS.md) | Interfaces y modelos de datos TypeScript |
| [COMPONENTES.md](./COMPONENTES.md) | Componentes UI, layout y elementos visuales |
| [DESARROLLO.md](./DESARROLLO.md) | Guía de desarrollo, convenciones y comandos |

---

## Resumen Rápido

### Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular | 20.x |
| UI Library | Angular Material | 20.x |
| Estilos | SCSS + Tailwind CSS v4 | — |
| Video Player | Shaka Player (DASH/HLS) + HLS.js | 5.x / 1.x |
| Real-time | WebSocket (NATS protocol) | — |
| Pagos | EnZona (pasarela cubana) | — |
| Analytics | Matomo (`ngx-matomo-client`) | 8.x |
| PWA | Angular Service Worker | — |
| SSR | Angular SSR + Express | 20.x |
| TypeScript | — | 5.8 |

### Comandos Esenciales

```bash
npm install          # Instalar dependencias
npm start            # Dev server → localhost:4211
npm run build        # Build producción → dist/picta/
npm test             # Unit tests (Karma/Jasmine)
npx prettier --write .  # Formatear código
```

### Estructura Rápida

```
src/app/
├── modules/
│   ├── picta/       # Módulo principal (37 páginas, 18 componentes, 10 servicios)
│   ├── chat/        # Chat en tiempo real
│   ├── embed/       # Contenido embebido
│   └── offline/     # Modo offline
├── services/        # Servicios globales (19 archivos)
├── validators/      # Validadores de formularios
└── utils/           # Utilidades compartidas
```

### Convenciones Clave

- **Standalone components** con `changeDetection: OnPush`
- **Signals** sobre RxJS para estado reactivo
- **Control flow nativo**: `@if`, `@for`, `@switch`
- **Lazy loading** en todas las rutas
- **inject()** en lugar de constructor injection
- **Reactive Forms** (no template-driven)
- **Tema oscuro** exclusivo
- **Puerto 4211** (no el default 4200)
