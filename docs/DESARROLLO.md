# Guía de Desarrollo — Picta Web Frontend

Guía completa para desarrolladores que trabajan en el proyecto.

---

## Requisitos Previos

| Herramienta | Versión | Verificar |
|-------------|---------|-----------|
| Node.js | >= 18.x | `node --version` |
| npm | >= 9.x | `npm --version` |
| Angular CLI | 20.x | `ng version` |

```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli
```

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala todas las dependencias |
| `npm start` | Dev server en `localhost:4211` (config `development`) |
| `npm run start-prod` | Dev server con configuración `production` |
| `npm run build` | Build de producción → `dist/picta/` |
| `npm run build-prod` | Build con `--configuration production` |
| `npm run build-dev` | Build con `--configuration development` |
| `npm test` | Unit tests (Karma/Jasmine) |
| `npm run lint` | Linting (TSLint) |
| `npm run e2e` | End-to-end tests (Protractor) |
| `npx prettier --write .` | Formatear todo el código |

> **Puerto 4211** (no el default 4200) para evitar conflictos.

---

## Convenciones de Código

### Componentes

```typescript
// ✅ Correcto
@Component({
  selector: 'app-mi-componente',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MaterialModule],
  templateUrl: './mi-componente.component.html',
  styleUrl: './mi-componente.component.scss'
})
export class MiComponenteComponent {
  private router = inject(Router);
  
  // Signals para estado reactivo
  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();
}

// ❌ Incorrecto
@Component({
  selector: 'app-mi-componente',
  // Falta standalone: true
  // Falta changeDetection: OnPush
})
export class MiComponenteComponent {
  constructor(private router: Router) {} // No usar constructor injection
}
```

### Control Flow

```html
<!-- ✅ Correcto: Control flow nativo -->
@if (isLoading) {
  <app-spinner />
}

@for (item of items; track item.id) {
  <app-card [item]="item" />
}

@switch (tipo) {
  @case ('pelicula') { <app-movie /> }
  @case ('serie') { <app-serie /> }
}

<!-- ❌ Incorrecto: Directivas de estructura -->
<div *ngIf="isLoading">
  <app-spinner />
</div>

<div *ngFor="let item of items">
  <app-card [item]="item"></app-card>
</div>

<div *ngSwitch="tipo">
  <app-movie *ngSwitchCase="'pelicula'"></app-movie>
</div>
```

### Inyección de Dependencias

```typescript
// ✅ Correcto: inject()
@Injectable({ providedIn: 'root' })
export class MiServicio {
  private http = inject(HttpClient);
  private router = inject(Router);
}

// ❌ Incorrecto: Constructor injection
@Injectable({ providedIn: 'root' })
export class MiServicio {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
}
```

### Signals vs RxJS

```typescript
// ✅ Correcto: Signals para estado local
private _items = signal<Item[]>([]);
readonly items = this._items.asReadonly();

readonly filteredItems = computed(() =>
  this._items().filter(i => i.active)
);

// ✅ Correcto: RxJS para streams async
private items$ = this.http.get<Item[]>('/api/items');

// ❌ Incorrecto: BehaviorSubject para todo
private _items = new BehaviorSubject<Item[]>([]);
```

### Formularios

```typescript
// ✅ Correcto: Reactive Forms
this.fb.group({
  username: ['', [Validators.required, Validators.minLength(3)]],
  password: ['', Validators.required]
});

// ❌ Incorrecto: Template-driven forms
// <form #loginForm="ngForm">
```

---

## Estructura de un Nuevo Componente

```
src/app/modules/picta/pages/mi-pagina/
├── mi-pagina-routing.module.ts      # Rutas
├── components/
│   └── mi-pagina/
│       ├── mi-pagina.component.ts
│       ├── mi-pagina.component.html
│       ├── mi-pagina.component.scss
│       └── mi-pagina.component.spec.ts
├── services/
│   └── mi-pagina.service.ts
├── models/
│   └── mi-pagina.model.ts
└── resolvers/
    └── mi-pagina-resolver.service.ts
```

### Template de Componente

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-pagina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './mi-pagina.component.html',
  styleUrl: './mi-pagina.component.scss'
})
export class MiPaginaComponent {
  private router = inject(Router);
  
  // Estado reactivo con signals
  private _items = signal<Item[]>([]);
  readonly items = this._items.asReadonly();
  readonly hasItems = computed(() => this._items().length > 0);
  
  constructor() {
    this.loadData();
  }
  
  private loadData() {
    // Cargar datos
  }
  
  navigateTo(id: number) {
    this.router.navigate(['/mi-ruta', id]);
  }
}
```

### Template HTML

```html
<div class="mi-pagina-container">
  @if (hasItems()) {
    <div class="items-grid">
      @for (item of items(); track item.id) {
        <div class="item-card" (click)="navigateTo(item.id)">
          <img [src]="item.image" [alt]="item.name" />
          <h3>{{ item.name }}</h3>
        </div>
      }
    </div>
  } @else {
    <div class="empty-state">
      <p>No hay elementos disponibles</p>
    </div>
  }
</div>
```

### Template SCSS

```scss
.mi-pagina-container {
  padding: 1rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.item-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  
  h3 {
    padding: 0.5rem;
    margin: 0;
  }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
```

---

## Estilos

### Tokens CSS

Los tokens de diseño están definidos en `src/styles.scss`:

```css
:root {
  /* Colores */
  --picta-yellow: #f3e628;
  --picta-coral: #e8462e;
  
  /* Fuentes */
  --picta-font-primary: 'Bebas Neue', sans-serif;  /* Headlines */
  --picta-font-secondary: 'Abel', sans-serif;      /* UI/controles */
  --picta-font-body: 'Roboto', sans-serif;         /* Body text */
  
  /* Tema oscuro (único) */
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
}
```

### Uso de Tailwind

Tailwind CSS v4 está importado en `styles.scss`. Se puede usar directamente en templates:

```html
<div class="flex items-center gap-4 p-4 bg-surface rounded-lg">
  <img class="w-12 h-12 rounded-full" [src]="avatar" />
  <div class="flex-1">
    <h3 class="text-lg font-semibold text-white">{{ name }}</h3>
    <p class="text-sm text-gray-400">{{ description }}</p>
  </div>
</div>
```

### Estilos de Componente

Cada componente tiene su propio archivo SCSS con estilos encapsulados:

```scss
// mi-componente.component.scss
:host {
  display: block;
}

.container {
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
}
```

---

## Testing

### Unit Tests

```bash
npm test
```

Framework: **Karma** + **Jasmine**

```typescript
// mi-componente.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiComponenteComponent } from './mi-componente.component';

describe('MiComponenteComponent', () => {
  let component: MiComponenteComponent;
  let fixture: ComponentFixture<MiComponenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiComponenteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### E2E Tests

```bash
npm run e2e
```

Framework: **Protractor** (configuración presente, infraestructura no activa)

---

## Git Workflow

### Branching

```
main ───────────────────────────────────────────►
  │
  ├── feature/nombre-feature ──────────────────► merge
  │
  ├── fix/nombre-fix ──────────────────────────► merge
  │
  └── release/v1.x.x ─────────────────────────► tag
```

### Commits

Formato: `<type>(<scope>): <description>`

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Estilos (no afecta lógica)
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Configuración, dependencias

**Ejemplos:**
```bash
git commit -m "feat(radio): add favorites persistence"
git commit -m "fix(auth): resolve token refresh race condition"
git commit -m "docs(readme): update development guide"
```

---

## APIs y Endpoints

### API Principal

| Versión | URL Base | Uso |
|---------|----------|-----|
| v1 | `https://api.picta.cu/v1/` | Endpoints principales |
| v2 | `https://api.picta.cu/v2/` | Endpoints actualizados |
| v3 | `https://api.picta.cu/v3/` | Endpoints nuevos |

### Autenticación

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/o/token/` | POST | Login (OAuth2 password grant) |
| `/v1/usuario/` | POST | Registro |
| `/v1/usuario/sms_verify/` | POST | Verificación SMS |
| `/v2/usuario/me/` | GET | Datos del usuario |

### Contenido

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/v1/publicacion/` | GET | Lista de publicaciones |
| `/v1/publicacion/{slug}/` | GET | Detalle de publicación |
| `/v1/canal/` | GET | Lista de canales |
| `/v1/canal/{alias}/` | GET | Detalle de canal |
| `/v1/serie/` | GET | Lista de series |
| `/v1/categoria/` | GET | Categorías |
| `/v1/busqueda/` | GET | Búsqueda |

### Interacción

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/v1/comentario/` | GET/POST | Comentarios |
| `/v1/voto/` | POST | Votar |
| `/v1/favorito/` | GET/POST/DELETE | Favoritos |
| `/v1/suscripcion/` | GET/POST/DELETE | Suscripciones |

### Soporte

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/v3/issuereport/` | GET/POST | Reportes de soporte |
| `/v3/interact/` | POST | Interacciones con soporte |
| `/v1/faq/` | GET | Preguntas frecuentes |

---

## Entornos de Desarrollo

### Variables de Entorno

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  clientId: 'ebkU3YeFu3So9hesQHrS8AZjEa4v7TiYbS5QZIgO',
  pictaUrl: 'https://www.picta.cu',
  baseUrl: 'https://api.picta.cu',
  baseUrlV1: 'https://api.picta.cu/v1',
  baseUrlV2: 'https://api.picta.cu/v2',
  baseUrlv3: 'https://api.picta.cu/v3',
  authUrl: 'https://api.picta.cu/o/token/',
  natioUrl: 'https://natio.picta.cu'
};
```

### Desarrollo Local

```bash
# Iniciar con configuración de desarrollo
npm start

# La app estará disponible en:
# http://localhost:4211
```

---

## Solución de Problemas Comunes

### Errores de CORS

Si aparecen errores CORS al consumir la API, verificar que el backend esté configurado para aceptar requests desde `http://localhost:4211`.

### Token Expirado

Si el usuario recibe errores 401 repetidos, verificar que `refreshToken()` se esté ejecutando correctamente en el interceptor.

### Estilos no se aplican

1. Verificar que Tailwind CSS esté importado en `styles.scss`
2. Verificar que los tokens CSS estén definidos en `:root`
3. Verificar que el componente tenga `styleUrl` apuntando al archivo correcto

### WebSocket no conecta

1. Verificar que `natio.picta.cu` esté accesible
2. Verificar que el usuario tenga un `code` válido
3. Verificar los logs del navegador para errores de conexión

---

## Recursos Útiles

| Recurso | URL |
|---------|-----|
| Angular Documentation | https://angular.dev |
| Angular Material | https://material.angular.io |
| Tailwind CSS | https://tailwindcss.com |
| Shaka Player | https://shaka-player-demo.appspot.com |
| TypeScript | https://www.typescriptlang.org |
