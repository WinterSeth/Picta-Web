import { Component, Input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { RadioStation } from '../../services/radio.service';
import { getImageSrcForStation } from '../../../../utils/radio-image.util';

@Component({
  selector: 'app-radio-card',
  standalone: true,
  imports: [MatCardModule, RouterLink],
  template: `
    <!--
      Accessibility: wrap mat-card in an anchor so the whole card is keyboard-focusable
      and behaves like a link. We avoid adding new NgModule imports — using plain <img>
      instead of mat-card-image to keep module surface minimal. TODO: consider adding
      MatCardModule's image support to the parent NgModule for consistent styling.
    -->
    <a
      class="card-link"
      [routerLink]="getRouterLink()"
      [attr.aria-label]="
        'Ir a estación ' + (station?.server_name || station?.mount)
      ">
      <mat-card class="radio-card">
        <!-- Image at top: special-case 'cubandjpro' mount to use local image -->
        <img
          class="radio-card-image"
          [src]="getImageSrc()"
          [alt]="'Estación ' + (station?.server_name || station?.mount)"
          (error)="onImgError($event)" />

        <mat-card-title>{{
          station?.server_description || station?.mount || 'Sin nombre'
        }}</mat-card-title>

        <!-- Show mount (human-friendly) and listeners with icon. Do NOT display raw listen URL. -->
        <mat-card-subtitle class="meta-row">
          <span class="mount" [attr.title]="getDisplayMount() || '-'">{{
            getDisplayMount() || '—'
          }}</span>
          <span
            class="listeners"
            [attr.aria-label]="
              listenersDisplay() === '—'
                ? 'Oyentes no disponibles'
                : listenersDisplay() + ' oyentes'
            ">
            <!-- Inline user/listener SVG icon (decorative) -->
            <svg
              class="icon-user"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
              focusable="false">
              <path
                d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
            <span class="count">{{ listenersDisplay() }}</span>
          </span>
        </mat-card-subtitle>
      </mat-card>
    </a>
  `,
  styles: [
    `
      /* Card link fills the grid cell and is keyboard accessible */
      .card-link {
        display: block;
        text-decoration: none;
        color: inherit; /* preserve text color */
      }

      .radio-card {
        cursor: pointer;
        display: block;
      }

      /* Image sizing: keep a consistent visual grid with object-fit */
      .radio-card-image {
        width: 100%;
        height: 160px; /* reasonable preview height */
        max-height: 220px;
        display: block;
        object-fit: cover;
      }

      /* TODO: replace hard-coded sizes with design tokens when available */

      /* Meta row: mount and listeners */
      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(0, 0, 0, 0.7);
        font-size: 0.95rem;
      }

      .meta-row .mount {
        font-weight: 600;
      }

      .meta-row .listeners {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .icon-user {
        /* make the listener icon visually small but still clear */
        width: 16px;
        height: 16px;
        fill: currentColor;
        opacity: 0.95;
        flex: 0 0 16px;
      }

      /* Slightly larger icon on very small screens for legibility */
      @media (max-width: 480px) {
        .icon-user {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
        }
        .meta-row {
          font-size: 0.95rem;
        }
      }
    `,
  ],
})
export class RadioCardComponent {
  @Input() station?: RadioStation;

  /** Format listeners into human-friendly string, matching card component */
  listenersDisplay(): string {
    if (!this.station) return '—';
    const raw: any = (this.station as any).listeners;
    if (raw === undefined || raw === null || raw === '') return '—';
    const num = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    if (Number.isFinite(num)) {
      if (num >= 1000000)
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return String(num);
    }
    return '—';
  }

  /**
   * Compute a safe mount value for routing. Prefer station.mount, fallback to parsing listenurl.
   * Return lower-cased mount without leading/trailing slashes so comparisons are stable.
   */
  private computeMount(): string {
    if (!this.station) {
      return '';
    }

    let mount = (this.station.mount ?? '') as string;
    if (!mount && this.station.listenurl) {
      try {
        const u = new URL(this.station.listenurl);
        mount = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      } catch (e) {
        const idx = (this.station.listenurl || '').lastIndexOf('/');
        if (idx !== -1) {
          mount = (this.station.listenurl || '').substring(idx + 1);
        }
      }
    }

    return (mount || '').toLowerCase();
  }

  /** Human-friendly display for mount: prefer provided mount, else derive from listenurl */
  getDisplayMount(): string {
    if (!this.station) return '';
    const m = (this.station.mount ?? '') as string;
    if (m) return m;
    // derive from listenurl path last segment (do not lower-case for display)
    const url = this.station.listenurl || '';
    try {
      const u = new URL(url);
      return u.pathname.replace(/^\/+/, '').replace(/\/+$/, '') || '';
    } catch (e) {
      const idx = url.lastIndexOf('/');
      if (idx !== -1) return url.substring(idx + 1);
      return '';
    }
  }

  // listenersDisplay is implemented above (with human-friendly k/M formatting).

  /** Return routerLink array for this station's card */
  getRouterLink(): any[] {
    const mount = this.computeMount();
    return ['/radioenvivo', mount];
  }

  /** Return the best image src for this station. Special-case mount 'cubandjpro' */
  getImageSrc(): string {
    return getImageSrcForStation(this.station as any);
  }

  /** Image error handler: swap to default placeholder when loading fails */
  onImgError(event: Event) {
    const img = event?.target as HTMLImageElement | null;
    if (img && img.src) {
      // Avoid infinite loop: only change if it's not already the default
      if (!img.src.endsWith('/img/default.webp')) {
        img.src = '/img/default.webp';
      }
    }
  }
}
