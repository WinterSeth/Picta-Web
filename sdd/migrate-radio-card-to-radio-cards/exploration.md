## Exploration: migrate-radio-card-to-radio-cards

### Objetivo

Investigar y preparar la migración del componente legacy `radio-card` (selector `app-radio-card`) al nuevo `radio-cards` (`app-radio-cards`), con foco en la ruta /radioenvivo. NO ejecutar cambios en esta fase — solo explorar y documentar.

### Resumen ejecutivo (español)

Encontré que el proyecto ya contiene un nuevo componente `app-radio-cards` en `src/app/components/radio-cards/` y que hay usos existentes de `app-radio-card` en la página principal de Radio (/radioenvivo). La migración es factible, pero NO es un simple rename: las APIs difieren (unicidad vs lista, inputs/outputs, propiedades de estación). Recomiendo mapear los objetos de estación desde el shape del servicio al shape esperado por `radio-cards`, reemplazar la lista de tarjetas individuales por un único `<app-radio-cards [stations]="...">` en `radio-list`, y manejar navegación/selección desde el componente padre usando el evento `select` que exporta `radio-cards`.

### Hallazgos - ubicaciones de `radio-card` (selector/tag)

- src/app/modules/picta/pages/radio/radio-card.component.ts (definición del componente, selector `app-radio-card`) — líneas relevantes encontradas en el archivo.
- src/app/modules/picta/pages/radio/radio-list.component.html — usa `<app-radio-card [station]="s"></app-radio-card>` (línea donde aparece)
- src/app/modules/picta/pages/radio/radio-list.component.ts — importa `RadioCardComponent` e incluye en imports

Busqueda completa (archivos y contexto):

- src/app/modules/picta/pages/radio/radio-card.component.ts — selector: 'app-radio-card' (definición)
- src/app/modules/picta/pages/radio/radio-list.component.html — <app-radio-card [station]="s"></app-radio-card>
- src/app/modules/picta/pages/radio/radio-list.component.ts — import { RadioCardComponent } ...; imports: [..., RadioCardComponent]

Nota: no encontré usos de `<app-radio-card>` fuera de radio-list en el repo.

### Localización del nuevo componente `radio-cards`

- Ruta de archivos: src/app/components/radio-cards/
  - radio-cards.component.ts
  - radio-cards.component.html
  - radio-cards.component.scss
  - index.ts (export)
- Selector: 'app-radio-cards'
- API pública (desde el código):
  - @Input() set stations(value: RadioStation[] | undefined)
    - Internamente mantiene signal<RadioStation[]>; espera array de objetos con shape definido en el componente.
  - Exports / Events (@Output):
    - play: EventEmitter<RadioStation>
    - stop: EventEmitter<RadioStation>
    - toggleFavorite: EventEmitter<RadioStation>
    - select: EventEmitter<RadioStation>
  - Expects a RadioStation interface (declarada en radio-cards.component.ts):
    - id: string | number
    - name: string
    - description?: string
    - imageUrl?: string
    - frequency?: string
    - isPlaying?: boolean
    - isFavorite?: boolean
  - ChangeDetection: OnPush — usa signals internamente y consume RadioService (inject)

### Comparación de APIs: `radio-card` vs `radio-cards`

- radio-card (legacy)
  - Selector: app-radio-card
  - Input: @Input() station?: RadioStation (shape: servicio — fields: mount, listenurl, server_description, server_name, listeners, etc.)
  - Comportamiento: cada tarjeta construye su propio routerLink (getRouterLink() => ['/radioenvivo', mount]), resuelve imagenes/local fallbacks, formatea listeners, y encapsula todo el markup y estilos.
  - No emite eventos a padre.

- radio-cards (nuevo)
  - Selector: app-radio-cards
  - Input: stations: RadioStation[] (otro shape con id/name/imageUrl...)
  - Exports: play/stop/toggleFavorite/select — comunica acciones al padre
  - No genera routerLink por tarjeta; emite select cuando se elige/entra
  - Usa RadioService internamente para isPlaying/isFavorite/play/stop

Principales diferencias y transformaciones mínimas propuestas:

1. Agregar un wrapper de lista en lugar de tarjetas individuales
   - Reemplazar la grid que renderiza muchas instancias de `<app-radio-card>` por un único `<app-radio-cards [stations]="mappedStations" (select)="onSelect($event)" ...>`
2. Mapping de datos: mapear el `RadioStation` del servicio al shape esperado por `radio-cards` (llenar id, name, imageUrl)
   - Ejemplo de mapeo (TS):
     const mapped = stations.map(s => ({
     ...s, // dejar propiedades originales para mantener mount/listenurl
     id: s.mount ?? s.server_name ?? s.listenurl ?? String(Math.random()),
     name: s.server_description ?? s.server_name ?? s.mount ?? 'Sin nombre',
     imageUrl: (s as any).thumbnail ?? '/public/img/default.webp',
     }));
   - Importante: conservar las propiedades originales (mount, listenurl) en el objeto para que RadioService al que recurre `radio-cards` pueda operar correctamente.
3. Navegación: `radio-cards` no crea routerLinks — usar el evento (select) en el padre para navegar a ['/radioenvivo', mount]
   - Ejemplo (TS en RadioListComponent):
     onSelect(st: any) {
     const mount = st.mount ?? st.server_name ?? deriveFromListenUrl(st.listenurl);
     this.router.navigate(['/radioenvivo', mount]);
     }
4. Imagenes: `radio-card` tiene onImgError fallback y special-case `cubandjpro` — replicar esa lógica si es necesaria (puede agregarse en el mapping o extender radio-cards con input/behavior)

### Foco en /radioenvivo (radio-list)

Actual: radio-list.template itera estaciones y renderiza `<app-radio-card [station]="s"></app-radio-card>`; radio-card gestiona el anchor y el routerLink.

Propuesta mínima de cambios (no aplicar aquí, solo ejemplo de migración):

- radio-list.component.ts (añadir imports/logic)
  - import { RadioCardsComponent } from 'src/app/components/radio-cards/radio-cards.component';
  - import { Router } from '@angular/router'; inject router
  - crear getter/mappedStations que mapea `this.stations` hacia el shape esperado (ver mapping arriba). Mantener propiedades originales.
  - añadir onSelect(st) que navegue a ['/radioenvivo', mount]

- radio-list.component.html (reemplazo sugerido)
  - <app-radio-cards [stations]="mappedStations" (select)="onSelect($event)" (play)="onPlay($event)" (toggleFavorite)="onToggleFavorite($event)"></app-radio-cards>

Ejemplo concreto (template):

```
<div class="radio-grid">
  <app-radio-cards
    [stations]="mappedStations"
    (select)="onSelect($event)"
    (play)="onPlay($event)"
    (toggleFavorite)="onToggleFavorite($event)">
  </app-radio-cards>
</div>
```

### Riesgos potenciales

- Tests y specs que referencien `app-radio-card` o su template selector fallarán y deberán actualizarse.
- Estilos: `radio-cards` tiene sus propias clases/markup. El grid/responsive existente puede necesitar ajustes CSS para mantener el mismo layout visual.
- Accesibilidad: `radio-card` usaba un anchor para hacer la tarjeta completa focusable con routerLink; `radio-cards` usa mat-radio-group y tabindex en cada mat-card — comportamiento de foco/tab puede cambiar y deberíamos validar keyboard navigation.
- Comportamiento de imagen fallback: `radio-card` implementa onImgError y special-case para `cubandjpro`. Si esa imagen es importante, hay que replicarla (o mantener la lógica como parte del mapeo).
- Runtime: `radio-cards` llama a RadioService methods con el objeto `st`. Si el objeto mapeado no contiene `mount`/`listenurl`/`server_name`, algunas funciones pueden no comportarse como se espera. Por eso se recomienda mantener esas propiedades en los objetos pasados.
- Integración con favoritos: `RadioFavoritesComponent` ya usa `app-radio-cards` pasando objetos minimalistas ({ id, name }). Este comportamiento muestra que `radio-cards` tolera objetos minimales, pero no todas las acciones (play) funcionarán ahí — el componente de favoritos ya documenta esa limitación.

### Evaluación de seguridad de migración (¿directa y segura?)

Sí, la migración es directa si:

- Reemplazás la renderización por lista completa (no intentás reemplazar cada tarjeta individual por otra sin mapear)
- Mapeás/extends las estaciones para incluir los campos esperados por RadioService (mount/listenurl) o mantienes las propiedades originales al pasar al nuevo componente

Si no se cumplen los puntos anteriores, hay riesgo de comportamiento roto (play/favoritos/navigation incorrecta).

### Next recommended (pasos para sdd-apply)

1. Añadir pruebas manuales: abrir /radioenvivo y comparar antes/después en un branch.
2. Cambios a realizar en apply:
   - Reemplazar imports de RadioCardComponent por RadioCardsComponent en radio-list.component.ts
   - Cambiar template de radio-list.component.html para usar <app-radio-cards> con mappedStations
   - Implementar mappedStations getter y onSelect() que navegue a ['/radioenvivo', mount]
   - Replicar la lógica onImgError/special-case si se necesita (opción: mapear imageUrl a '/img/cubandjpro.jpg' cuando mount==='cubandjpro')
   - Actualizar tests/specs y stories que usen app-radio-card
3. Ejecutar test suite y revisar visualmente la página /radioenvivo

Si querés que ejecute el apply automáticamente: la migración es relativamente directa pero requiere cambios en tests y verificación visual; puedo dejar el patch preparado y solicitar al orchestrator lanzar `sdd-apply` para implementarlo.

### Artefactos

- Archivo con resultados: sdd/migrate-radio-card-to-radio-cards/exploration.md (este documento)
- Archivos donde aparece `radio-card`:
  - src/app/modules/picta/pages/radio/radio-card.component.ts
  - src/app/modules/picta/pages/radio/radio-list.component.html
  - src/app/modules/picta/pages/radio/radio-list.component.ts

### Notas para subagentes

If you make important discoveries, decisions, or fix bugs, save them to engram via mem_save with project: 'Picta-Frontend-Angular7'.

---

Status: ready-for-proposal
