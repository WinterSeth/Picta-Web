# Modelos de Datos — Picta Web Frontend

Interfaces y modelos TypeScript utilizados en la aplicación.

---

## Modelos Globales

### UserModel

**Archivo:** `src/app/modules/picta/models/user.model.ts`

```typescript
interface UserModel {
  id: number;
  avatar: string;
  groups: any[];
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  fecha_nacimiento: Date;
  code: string;
  dias_restantes?: number;
  days_remaining?: number;
  remaining_days?: number;
  aprobacion_solicitudes: {
    solicitud_canal: boolean;
    solicitud_seller: boolean;
  };
  subscription_plan: {
    nombre?: string;
    name?: string;
    estado?: string;
    status?: string;
    activo?: boolean;
    is_active?: boolean;
    dias_restantes?: number;
    days_remaining?: number;
    remaining_days?: number;
    fecha_fin?: string;
    end_date?: string;
    fecha_vencimiento?: string;
    vencimiento?: string;
    expires_at?: string;
    plan?: {
      nombre?: string;
      name?: string;
      estado?: string;
      status?: string;
      activo?: boolean;
      is_active?: boolean;
      dias_restantes?: number;
      days_remaining?: number;
      remaining_days?: number;
      fecha_fin?: string;
      end_date?: string;
      fecha_vencimiento?: string;
      vencimiento?: string;
      expires_at?: string;
      beneficios?: { nombre_raw: string; valor: string }[];
    };
    beneficios: { nombre_raw: string; valor: string }[];
  };
}
```

**Campos clave:**
- `code` — Código único del usuario (usado para suscripción NATS)
- `subscription_plan` — Plan de suscripción activo (puede estar anidado)
- `aprobacion_solicitudes` — Permisos de aprobación de canales/sellers

---

### PictaResponse<T>

**Archivo:** `src/app/modules/picta/models/response.picta.model.ts`

```typescript
interface PictaResponse<T> {
  count: number;
  next: number;
  previous: string;
  results: T[];
}
```

**Uso:** Respuesta genérica paginada de la API REST.

---

### Credentials

**Archivo:** `src/app/modules/picta/services/credentials.service.ts`

```typescript
interface Credentials {
  user?: any;
  access_token: string;
  refresh_token: string;
}
```

**Uso:** Almacenamiento de credenciales de autenticación en localStorage.

---

## Modelos de Contenido

### Publication (Publicación)

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Publication {
  url_imagen: string;
  canal_url_avatar: string;
  id: number;
  nombre: string;
  descripcion: string;
  publicado: boolean;
  categoria: Categoria;
  palabraClave: string;
  tipo: string;
  url_manifiesto: string;
  url_descarga: string;
  url_subtitulo: string;
  duracion: string;
  cantidad_visitas: number;
  cantidad_reproducciones: number;
  cantidad_me_gusta: number;
  cantidad_no_me_gusta: number;
  cantidad_vistas_ahora: number;
  cantidad_comentarios: number;
  canal: Canal;
  canal_id: number;
  canal_slug_url: string;
  premium: boolean;
  only_subs: boolean;
  mostrar_chat: boolean;
  mostrar_comentarios: boolean;
  precios: { tipo: string; valor: number }[];
  precio_id: number;
  lista_reproduccion_canal?: any[];
  hd: boolean;
  fecha_creacion: Date;
  fecha_publicado: string;
  convertido: boolean;
  usuario: string;
  slug_url: string;
  cantidad_descargas: number;
  descarga: string;
  usuario_username: string;
  descargable: boolean;
  tiempo_creacion: string;
  lista_comentarios: PictaResponse<Comentario>;
  active: boolean;
  imagen_secundaria: string;
  time: number;
  live?: any;
  pd?: boolean;
  pr?: boolean;
  audios?: string;
  subtitulos?: string[];
  cantidad_temporadas?: number;
  cantidad_capitulos?: number;
  ano?: string;
}
```

**Campos importantes:**
- `premium` — Contenido de pago
- `only_subs` — Solo para suscriptores del canal
- `mostrar_chat` / `mostrar_comentarios` — Habilita interacción
- `precios` — Lista de precios disponibles
- `convertido` — Si el video ya está procesado y listo para reproducir
- `url_manifiesto` — URL del manifiesto DASH/HLS para Shaka Player

---

### Canal

**Archivo:** `src/app/modules/picta/pages/canal/models/canal.model.ts`

```typescript
interface Canal {
  url_imagen: string;
  url_avatar: string;
  id: number;
  idEprog?: string;           // ID externo para API de programación
  titulo?: string;
  nombre: string;
  descripcion: string;
  cantidad_suscripciones: number;
  usuario: string;
  palabra_clave: string[];
  prioridad: number;
  tipo: string;
  fecha_publicado: Date;
  seller: any;
  tiempo_creacion: string;
  fecha_creacion: Date;
  usuarios_asociados: string[];
  usuarios_asociados_ids: number[];
  publicado: boolean;
  suscripcion: any;
  slug_url: string;
  donar: boolean;
  alias: string;
  lista_publicaciones: PictaResponse<Publication>;
  videos: Publication[];
}
```

**Campos importantes:**
- `alias` — Identificador corto para URLs (`/canal/:alias`)
- `idEprog` — ID para API de programación de TV
- `usuarios_asociados` — Usuarios que pueden gestionar el canal
- `donar` — Si acepta donaciones

---

### Serie

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Serie {
  pelser_id: number;
  nombre: string;
  ano: string;
  pais: string;
  imagen_secundaria: string;
  url_imagen?: string;
  sinopsis?: string;
  productividad?: Extra[];
  director?: Persona[];
  guion?: Persona[];
  musica?: Persona[];
  fotografia?: Persona[];
  reparto?: Persona[];
  cantidad_capitulos: number;
  cantidad_temporadas: number;
  canal: Canal;
  genero: Genero[];
}
```

---

### Pelicula

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Pelicula {
  ano: string;
  pais: string;
  productora: Extra[];
  premio: Extra[];
  director: Persona[];
  guion: Persona[];
  musica: Persona[];
  fotografia: Persona[];
  reparto: Persona[];
  genero: Genero[];
  imagen_secundaria: string;
}
```

---

### Temporada

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Temporada {
  id: number;
  nombre: string;
  cantidad_capitulos: number;
  canal: Canal;
  serie: Serie;
  videos?: Publication[];
  next?: any;
  title?: any;
  subtitle?: any;
}
```

---

### Documental

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Documental {
  id: number;
  pais: string;
  productora: Extra[];
}
```

---

### Disco

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Disco {
  id: number;
  imagen: string;
  duracion: number;
  casa_disquera: any[];
  interprete: Persona[];
  genero: Genero[];
  canal: Canal;
}
```

---

### Audio

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Audio {
  ano?: number;
  pais?: string;
  interprete: Persona[];
  productor: any[];
  genero: Genero[];
  disco: Disco;
}
```

---

### Categoria

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Categoria {
  audio?: Audio;
  cancion?: any;
  videoclip?: any;
  tipologia: Tipologia;
  capitulo?: Capitulo;
  video?: Video;
  pelicula?: Pelicula;
  documental?: Documental;
  eventotipologia?: any;
  curso?: any;
  modelo?: string;
  live?: any;
}
```

---

### Tipologia

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Tipologia {
  nombre: string;
  modelo: string;
}
```

---

### Video

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Video {
  ano: string;
  genero: Genero[];
  interprete?: Persona[];
  productor?: Persona[];
  director?: Persona[];
}
```

---

### Extra

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Extra {
  id: number;
  tipo: string;
  nombre: string;
}
```

---

### Persona

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Persona {
  id: number;
  nombre: string;
}
```

---

### Genero

**Archivo:** `src/app/modules/picta/pages/medias/models/publicacion.model.ts`

```typescript
interface Genero {
  id: number;
  nombre: string;
}
```

---

## Modelos de Comentarios

### Comentario

**Archivo:** `src/app/modules/picta/pages/medias/models/comentario.model.ts`

```typescript
interface Comentario {
  id: number;
  texto: string;
  fecha: string;
  usuario: any;
  publicacion: any;
  publicado: boolean;
  cantidad_respuestas: number;
  publicacion_id: number;
  comentario: number;
}
```

---

## Modelos de Soporte

### IssueReport

**Archivo:** `src/app/modules/picta/services/support.service.ts`

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

---

### IssueInteraction

**Archivo:** `src/app/modules/picta/services/support.service.ts`

```typescript
interface IssueInteraction {
  id: number;
  message: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
  issue: number;
  user: number;
}
```

---

### SupportUser

**Archivo:** `src/app/modules/picta/services/support.service.ts`

```typescript
interface SupportUser {
  id?: number;
  username?: string;
  email?: string;
  phone_number?: string;
}
```

---

## Modelos de Radio

### RadioStation

**Archivo:** `src/app/services/radio.service.ts`

```typescript
interface RadioStation {
  mount?: string;
  listeners?: number | string;
  listenurl?: string;
  server_description?: string;
  server_name?: string;
  bitrate?: number;
  id: string | number;
  name: string;
  imageUrl?: string;
  description?: string;
  [key: string]: any;  // Permisivo para Icecast icestats
}
```

---

## Modelos de Perfil

### Perfil

**Archivo:** `src/app/services/perfiles.service.ts`

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

---

## Modelos de Autenticación

### IslaplayAuthResponse

**Archivo:** `src/app/services/auth.service.ts`

```typescript
interface IslaplayAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}
```

---

### IslaplayUser

**Archivo:** `src/app/services/auth.service.ts`

```typescript
interface IslaplayUser {
  username: string;
  tokenType?: string;
}
```

---

## Notificación

### Notificacion

**Archivo:** `src/app/modules/picta/services/notification-store.service.ts`

```typescript
interface Notificacion {
  id: number;
  vista: boolean;
  // ... otros campos del backend
}
```

---

## Resumen de Modelos por Archivo

| Archivo | Modelos |
|---------|---------|
| `models/user.model.ts` | `UserModel` |
| `models/response.picta.model.ts` | `PictaResponse<T>` |
| `medias/models/publicacion.model.ts` | `Publication`, `Canal`, `Serie`, `Pelicula`, `Temporada`, `Capitulo`, `Video`, `Documental`, `Videoclip`, `Disco`, `Audio`, `Categoria`, `Tipologia`, `Extra`, `Persona`, `Genero` |
| `medias/models/comentario.model.ts` | `Comentario` |
| `canal/models/canal.model.ts` | `Canal`, `Playlist` |
| `services/credentials.service.ts` | `Credentials` |
| `services/perfiles.service.ts` | `Perfil` |
| `services/support.service.ts` | `IssueReport`, `IssueInteraction`, `SupportUser` |
| `services/radio.service.ts` | `RadioStation` |
| `services/auth.service.ts` | `IslaplayAuthResponse`, `IslaplayUser` |
| `services/notification-store.service.ts` | `Notificacion` |
