import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Publication } from '../../../models/publicacion.model';

@Component({
  selector: 'app-publication-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'publication-actions',
  },
  template: `
    <div class="actions-toolbar">
      <!-- Playlist button -->
      @if (innerWidth() < 1200 && hasPlayList()) {
        <button
          (click)="playlistClick.emit()"
          matTooltip="Ver lista de reproducción"
          aria-label="Ver lista de reproducción"
          class="action-button action-button-icon block lg:none"
          mat-stroked-button
        >
          <mat-icon>playlist_play</mat-icon>
        </button>
      }

      <!-- Chat button for live -->
      @if (isLive() && mostrarChat()) {
        <button
          (click)="chatClick.emit()"
          matTooltip="Chat en vivo"
          aria-label="Abrir chat"
          class="action-button action-button-icon block lg:none"
          mat-stroked-button
        >
          <mat-icon>sms</mat-icon>
        </button>
      }

      <!-- Download button -->
      @if (video()?.descargable && video()?.descarga && video()?.convertido) {
        <button
          #tooltipDownload="matTooltip"
          (click)="
            isLoggedIn()
              ? downloadClick.emit()
              : tooltipDownload.toggle()
          "
          [matTooltip]="
            isLoggedIn()
              ? 'Descargar video'
              : 'Debes estar autenticado para descargar'
          "
          [disabled]="
            isLoggedIn() ? isAdPlaying() && playTime() <= 5 : isAdPlaying() && playTime() <= 5
          "
          class="action-button"
          mat-stroked-button
        >
          @if (precioDescarga() && !video()?.pd) {
            <mat-icon matBadge="$">get_app</mat-icon>
          } @else {
            <mat-icon>get_app</mat-icon>
          }
          <span class="hidden lg:inline-block">Descargar</span>
        </button>
      }

      <!-- Share button -->
      <button
        (click)="shareClick.emit()"
        mat-stroked-button
        class="action-button"
        aria-label="Compartir publicación"
      >
        <mat-icon>share</mat-icon>
        <span class="hidden lg:block">Compartir</span>
      </button>

      <!-- More options menu (3 dots) -->
      <button
        class="action-trigger-button"
        aria-label="Más opciones"
        mat-icon-button
        [matMenuTriggerFor]="actionsMenu"
      >
        <mat-icon>more_vert</mat-icon>
      </button>

      <mat-menu #actionsMenu="matMenu" class="publication-actions-menu header-menu-panel">
        <!-- Denunciar option -->
        <button
          mat-menu-item
          #tooltipDenunciar="matTooltip"
          (click)="
            isLoggedIn()
              ? reportClick.emit()
              : tooltipDenunciar.toggle()
          "
          [matTooltip]="
            isLoggedIn() ? 'Denunciar' : 'Debes estar autenticado para denunciar'
          "
        >
          <mat-icon>assistant_photo</mat-icon>
          <span>Denunciar</span>
        </button>

        <!-- Add to playlist option -->
        <button
          mat-menu-item
          #tooltipPlaylist="matTooltip"
          (click)="
            isLoggedIn()
              ? addPlaylistClick.emit()
              : tooltipPlaylist.toggle()
          "
          [matTooltip]="
            isLoggedIn()
              ? 'Agregar a lista de reproducción'
              : 'Debes estar autenticado para crear listas personalizadas.'
          "
        >
          <mat-icon>playlist_add</mat-icon>
          <span>Agregar a lista de reproducción</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .actions-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .action-button,
    .action-button-icon,
    .action-trigger-button {
      --mat-button-outlined-container-shape: 999px;
      --mat-button-outlined-outline-color: var(--pub-color-border);
      --mat-button-outlined-label-text-color: rgba(244, 247, 251, 0.92);
      --mat-button-outlined-state-layer-color: var(--pub-color-accent);
      --mat-button-outlined-ripple-color: rgba(232, 70, 46, 0.16);

      min-width: 0;
      height: 38px;
      padding: 0 0.95rem;
      background: var(--pub-color-surface);
      box-shadow: none;
      transition:
        background-color var(--pub-fast) var(--pub-ease),
        border-color var(--pub-fast) var(--pub-ease),
        color var(--pub-fast) var(--pub-ease),
        transform var(--pub-fast) var(--pub-ease);
    }

    .action-button-icon {
      width: 38px;
      padding: 0;
    }

    .action-button .mat-icon,
    .action-button-icon .mat-icon,
    .action-trigger-button .mat-icon {
      margin-right: 0;
    }

    .action-button:hover,
    .action-button-icon:hover,
    .action-trigger-button:hover {
      background: var(--pub-color-surface-hover);
      transform: translateY(-1px);
    }

    .action-button:active,
    .action-button-icon:active,
    .action-trigger-button:active {
      transform: scale(0.97);
    }

    .action-button.is-active,
    .action-button-icon.is-active {
      background: rgba(232, 70, 46, 0.12);
      --mat-button-outlined-label-text-color: var(--pub-color-text);
    }

    .action-button .mat-icon,
    .action-button-icon .mat-icon,
    .action-trigger-button .mat-icon {
      margin-right: 0.4rem;
      color: rgba(244, 247, 251, 0.82);
    }

    .action-button.is-active .mat-icon {
      color: var(--picta-yellow, #f3e628);
    }

    .action-button span {
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .action-trigger-button {
      color: rgba(244, 247, 251, 0.82);
      background: var(--pub-color-surface);
      border: 1px solid var(--pub-color-border);
      width: 38px;
      min-width: 38px;
      height: 38px;
      padding: 0;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .action-trigger-button .mat-icon {
      margin: 0;
    }

    .action-trigger-button:hover {
      color: var(--pub-color-text);
      background: var(--pub-color-surface-hover);
      border-color: var(--pub-color-accent-border);
    }

    @media (max-width: 768px) {
      .actions-toolbar {
        justify-content: flex-start;
      }
    }
  `,
  imports: [
    MatIcon,
    MatButton,
    MatAnchor,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
  ],
})
export class PublicationActionsComponent {
  // Required inputs
  video = input.required<Publication>();

  // Optional inputs with defaults
  innerWidth = input(0);
  hasPlayList = input(false, { transform: booleanAttribute });
  isLive = input(false, { transform: booleanAttribute });
  mostrarChat = input(false, { transform: booleanAttribute });
  isLoggedIn = input(false, { transform: booleanAttribute });
  isAdPlaying = input(false, { transform: booleanAttribute });
  playTime = input(0);
  // Accept string (formatted) or number (raw price from API)
  precioDescarga = input<string | number>('');

  // Outputs
  playlistClick = output<void>();
  chatClick = output<void>();
  downloadClick = output<void>();
  shareClick = output<void>();
  reportClick = output<void>();
  addPlaylistClick = output<void>();
}