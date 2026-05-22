# Picta Frontend Agent Guidance

## Development Commands
- **Start dev server**: `npm start` (runs on http://localhost:4211)
- **Build**: `npm run build` (outputs to `dist/picta`)
- **Test**: `npm test` (Karma/Jasmine)
- **Lint**: `npm run lint` (TSLint — not ESLint)
- **E2E**: `npm run e2e` (Protractor — no active infrastructure)
- **Format**: `npx prettier --write .` (config in `package.json`)

## Angular Core Conventions (must-follow)
- **Standalone components** — never use NgModules for components
- **Signals over RxJS** for local state: `signal()`, `computed()`, `input()`, `output()`, `effect()`
- **OnPush** change detection on every component
- **Native control flow**: `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`
- **No `ngClass`/`ngStyle`** — use `class`/`style` bindings
- **No `@HostBinding`/`@HostListener`** — use `host` object in decorator
- **`inject()`** over constructor injection
- **Reactive forms** over template-driven
- **Lazy loading** via `loadComponent` / `loadChildren` in routes
- Components generated with `standalone: true` and `changeDetection: OnPush` by default (angular.json schematics)

## Styling
- **Tailwind CSS v4** for layout/spacing (imported in `styles.scss`)
- **SCSS** for component-specific styles and design tokens
- Design tokens as CSS variables in `:root` in `styles.scss` (e.g., `--picta-yellow`, `--picta-font-primary`)
- **Dark mode only** — no light theme exists
- Font system: **Bebas Neue** (headlines), **Abel** (UI/controls), **Roboto** (body)
- Brand accent: yellow `#f3e628`; secondary: coral red `#e8462e`

## Important Notes
- Port **4211** (not the default 4200) to avoid conflicts
- UI Library: **Angular Material v20** with custom Picta theme overrides
- Video player: **Shaka Player** for DASH/HLS streaming; **Hls.js** also present
- Real-time: **Socket.IO** (`ngx-socket-io`) for chat, notifications, live TV presence
- Payment: **EnZona** integration for Cuban payment processing
- PWA: Service Worker via `ngsw-config.json` — enabled in production only
- SSR: `@angular/ssr` dependency present; Express server in `server.ts`
- Analytics: **Matomo** (`ngx-matomo-client`)
- Assorted: ngx-markdown, ngx-mask (form masking), angularx-qrcode, ngx-owl-carousel-o
- Locale: `es-US` / `es-CU` for date/number formatting

## File Layout
- `src/app/` — Application code (standalone components, no NgModules)
- `src/app/modules/picta/` — Main feature module (components/, pages/, services/, models/, pipes/, animations/)
- `src/app/modules/embed/` — Embed module (external embeds)
- `src/app/modules/chat/` — Chat module
- `src/styles.scss` — Global styles, tokens, Material overrides
- `public/` — Static assets served as-is at root
- `server.ts` — SSR Express server

## Environment Files
- `src/environments/environment.ts` — default
- `src/environments/environment.dev.ts` — used by `development` build config
