# Picta — AI Agent Context

> Design and implementation context for Picta frontend. This file is the single source of truth for AI agents working on this codebase.

---

## Design Context

### Users

Cuban viewers accessing streaming entertainment from within Cuba and the diaspora worldwide. Users may experience slow, intermittent internet connectivity (3G/4G mobile, shared connections). They seek movies, series, TV channels, doramas, animes, documentaries, sports, music/radio, and shorts. Many are price-sensitive; subscription plans start at CUP $25. The platform is a source of national pride — it represents Cuban-made technology and content.

**Key user context:**
- Primarily Cuban audience (island + diaspora), but accessible globally
- Unreliable internet → offline capabilities matter; loading states are critical UX
- Price sensitivity → payment via EnZona (Cuban payment processor)
- Content variety → broad catalog (VOD, live TV, radio, shorts)
- Mobile-first → significant mobile traffic

### Brand Personality

**Bold, cultural, accessible.** Picta is the Cuban answer to global streaming — a platform built in Cuba, for Cubans, that delivers world-class entertainment without the infrastructure limitations of global services. It's proud of its Cuban identity while aiming for international production quality.

**Three-word personality:** `CUBAN`, `PROUD`, `ENTERTECH` — technical entertainment culture.

**Emotional goal:** The interface should feel like Cuban innovation — smart, capable, modern, warm but not childish. Users should feel they're accessing something premium and well-made, not a compromise.

**Tagline:** "Dale Play!" (Play it!)

**Tone:** Confident, inviting, direct. Not stuffy corporate, not overly playful. Think: "welcome home to great content."

### Aesthetic Direction

**Dark cinematic with warm yellow accent.** The entire app runs in dark mode — no light theme exists. The dark theme is rich, not flat: deep navy backgrounds with subtle gradients, warm yellow (#f3e628) as the primary brand accent, and coral red (#e8462e) for secondary actions/alerts.

The aesthetic is **cinematic streaming platform** — think the premium feel of a well-funded VOD service, not a utility tool. Glassmorphism effects (backdrop blur) on overlays, menus, and dialogs give it a modern layered depth. Text is high-contrast white on dark. The overall impression is "dark movie theater with yellow spotlight."

**Visual characteristics:**
- Deep navy backgrounds (not pure black) with layered elevation
- Warm yellow accent (brand identity, CTAs, focus states)
- Coral red for secondary emphasis and destructive actions
- Rounded corners: 8px (inputs, buttons), 16px (cards, menus), 24px (dialogs)
- Subtle grain/noise textures on surfaces (existing pattern)
- Backdrop blur on all overlay surfaces (dialogs, menus, drawers)
- Typography: Bebas Neue for drama (headlines), Abel for control/instruction, Roboto for reading
- Motion: smooth 160-200ms transitions, menu zoom animations, dialog scale-ins

**Anti-references:** Do NOT look like generic streaming clones or YouTube knockoffs. Avoid corporate blue-and-white palettes. Avoid flat Material Design without the brand's warmth layer.

### Design Principles

1. **Content is king.** The UI recedes to let movies, series, and live TV shine. Avoid visual noise that competes with thumbnails and video.

2. **Dark, warm, and cinematic.** Dark backgrounds create immersion. The warm yellow accent is the brand's signature — use it for CTAs, focus states, and brand moments. Never dilute it with competing warm colors.

3. **Graceful degradation for slow connections.** Loading states, skeletons, and offline handling are not afterthoughts — they are core UX. Every interactive element needs a visible, branded loading state.

4. **Consistent elevation language.** Use Angular Material tokens as a base, but override with Picta tokens (picta-yellow, picta-yellow-soft, navy backgrounds, blur effects). Every overlay/modal/dialog gets backdrop blur.

5. **Responsive but not mobile-only.** Mobile is primary, but the platform serves TV streaming too. Design for touch-first but maintain readability and tap targets on desktop.

### Color System

```scss
// Brand Accent
--picta-yellow:      #f3e628   // Primary CTA, brand moments, focus rings
--picta-yellow-soft: rgba(243, 230, 40, 0.16)  // Selected states background
--picta-yellow-softer: rgba(243, 230, 40, 0.08) // Hover glow
--picta-yellow-border: rgba(243, 230, 40, 0.28) // Border accent

// Primary (deep navy - backgrounds)
--picta-bg-deep:    rgba(10, 17, 38)     // Deepest layer
--picta-bg-mid:     rgba(16, 25, 53)     // Card/panel backgrounds
--picta-bg-surface: rgba(13, 20, 46)     // Dialog/overlay surfaces

// Secondary Accent
--picta-accent:     #e8462e             // Coral red - alerts, secondary actions

// Text
--picta-text:      #f4f7fb             // Primary text
--picta-text-muted: rgba(244, 247, 251, 0.6)  // Labels, secondary text
```

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Bebas Neue | Headlines H1-H6, hero text, movie titles, section headers |
| UI/Control | Abel | Buttons, labels, form fields, menu items, tabs, subtitles |
| Body/Reading | Roboto | Paragraphs, descriptions, comments, metadata |

### Component Patterns

**Dialogs/Drawers:**
- `border-radius: 16-24px`
- `backdrop-filter: blur(12px)`
- Gradient background: radial yellow glow at top-right + linear navy
- Yellow border: `1px solid var(--picta-yellow-border)`
- Box shadow with blur

**Menus:**
- Same blur + gradient treatment as dialogs
- `border-radius: 16px`
- Yellow accent on selected items

**Cards (movie/series):**
- Thumbnail-first: image dominates
- Hover: subtle scale + shadow
- Rounded corners: `rounded-lg` (8px)
- Year and genre metadata in muted text

**Buttons:**
- Primary: filled with `--picta-accent` (coral red) or yellow
- Secondary: outlined with yellow border
- `border-radius: 999px` (pill) or `8px` (standard)

**Form fields:**
- Filled style (not outlined)
- Yellow focus indicator
- Dark surface: `rgba(255, 255, 255, 0.06)`
- Label floats to yellow on focus

**Loading states:**
- Skeleton shimmer with dark-to-slightly-less-dark gradient
- Spinners use yellow accent color

### Iconography

- Material Icons (via `icon.css`)
- FontAwesome (free solid + brands)
- SVG icons registered via `MatIconRegistry` for custom paths

### Animations & Motion

- Menu/dialog: `180ms cubic-bezier(0.35, 0, 0.25, 1)` scale + fade
- Card hover: `300ms` scale `1.05` + shadow lift
- Dialog entrance: `340ms cubic-bezier(0.25, 1, 0.5, 1)` scale-in from `0.94`
- All Angular Material animations respect the brand timing

### Technical Architecture

**Framework:** Angular 20+ (standalone components, signals, OnPush CD, native control flow)
**UI Library:** Angular Material v20 + Tailwind CSS v4
**Video:** Shaka Player (DASH/HLS streaming)
**State:** Angular signals (local), RxJS + BehaviorSubject for shared services
**Styling:** Component SCSS + global tokens in `styles.scss`
**PWA:** Service Worker via Angular (`ngsw-config.json`)
**Animations:** Angular Animations + CSS keyframes

---

## Development Guidelines

> These guidelines were auto-generated from the codebase conventions. They override any conflicting generic advice.

### Angular

- **Standalone components** — never use NgModules for components
- **Signals** — `input()`, `output()`, `signal()`, `computed()`, `effect()` via `inject()`
- **OnPush change detection** — set on every component decorator
- **No decorators for i/o** — use `input.required<T>()` and `output<T>()` functions
- **Native control flow** — `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`
- **No `ngClass` / `ngStyle`** — use `class` and `style` bindings
- **`NgOptimizedImage`** for all static images (except base64 inline)
- **`inject()` over constructor injection** — prefer function-level `inject()`
- **No `@HostBinding` / `@HostListener`** — use `host` object in decorator
- **Reactive forms** over template-driven

### TypeScript

- Strict mode always
- No `any` — use `unknown` when uncertain, then narrow
- Prefer `interface` over `type` for object shapes

### CSS/Styling

- Tokens live in `:root` in `styles.scss`
- Component styles are scoped in `*.component.scss`
- Global overrides for Material components live in `styles.scss`
- Use Tailwind for layout/spacing; use SCSS for precise visual design
- Font families, colors, and radii use CSS variables

### Testing

- Unit tests via Karma (configured in `angular.json`)
- Coverage reports via `karma-coverage-istanbul-reporter`
- No E2E test infrastructure active

---

## Project Structure

```
src/
├── app/
│   ├── modules/picta/           # Main feature module
│   │   ├── components/         # Shared components (header, sidebar, dialogs...)
│   │   ├── pages/              # Feature pages (home, category, media, etc.)
│   │   ├── services/           # Picta-specific services
│   │   ├── models/              # TypeScript interfaces
│   │   ├── pipes/               # Custom pipes
│   │   └── animations/          # Angular animation definitions
│   ├── services/               # Core services (auth, websocket, etc.)
│   └── components/              # App-level components
├── styles.scss                 # Global styles, tokens, Material overrides
├── css2.css                    # Font declarations (Bebas Neue, Abel, Roboto)
├── icon.css                    # Material Icons fallback
├── assets/                     # Images, fonts, icons
└── public/                     # Static assets served as-is
```

---

## API / Backend Context

- **API base:** `https://api.picta.cu` (configured via environment files)
- **Payment:** EnZona integration for Cuban payment processing
- **Auth:** Token-based authentication (JWT stored in localStorage)
- **WebSocket:** Socket.IO for live chat, notifications, live TV presence
- **Video CDN:** External video hosting (`videos.picta.cu`, `live.picta.cu`)
- **Ads:** Server-side ads loaded from `public/ads.json`

---

## Environment

- **Dev server:** `npm start` → `http://localhost:4211`
- **Build:** `npm run build` (production), `npm run build-dev` (development)
- **Prettier:** Enabled with project config in `package.json`
- **No ESLint** — TSLint only (legacy)

---

*Last updated: 2026-04-27*
*Auto-generated from codebase exploration — pending UX clarification from project owner*