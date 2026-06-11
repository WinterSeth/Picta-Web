import { Component, inject, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CanalService } from '../../../canal/services/canal-service.service';
import { Canal } from '../../../canal/models/canal.model';

@Component({
  selector: 'app-select-channel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    MatDialogModule,
    MatIcon,
    MatButton,
    MatProgressSpinner,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-icon">
        <mat-icon>tv</mat-icon>
      </div>
      <h2 class="header-title">Selecciona un canal</h2>
      <p class="header-subtitle">Elige el canal al que deseas asociar tu membresía</p>
    </div>

    <div class="dialog-search">
      <div class="search-input-wrapper">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          #searchInput
          type="text"
          class="search-input"
          placeholder="Escribí el nombre del canal..."
          [value]="searchValue()"
          (input)="onInput($event)" />
        @if (searching()) {
          <mat-spinner class="search-spinner" [diameter]="18" color="accent"></mat-spinner>
        }
        @if (searchValue().length > 0) {
          <button class="search-clear" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    </div>

    <div class="channel-list" [@listAnimation]="channels().length">
      @if (searching() && channels().length === 0) {
        <div class="loading-state">
          <mat-spinner [diameter]="28" color="accent"></mat-spinner>
          <span>Buscando canales...</span>
        </div>
      } @else if (channels().length === 0) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <span>No se encontraron canales</span>
        </div>
      } @else {
        @for (channel of channels(); track channel.id) {
          <button
            class="channel-item"
            [class.selected]="selectedChannel()?.id === channel.id"
            (click)="selectChannel(channel)">
            <div class="channel-avatar">
                  @if (channel.url_avatar) {
                    <img [ngSrc]="channel.url_avatar + '_300x300'" [alt]="channel.nombre" width="40" height="40" priority />
                  } @else {
                <div class="avatar-fallback">{{ channel.nombre.charAt(0) | uppercase }}</div>
              }
            </div>
            <div class="channel-info">
              <span class="channel-name">{{ channel.nombre }}</span>
              <span class="channel-meta">
                {{ channel.cantidad_suscripciones | number }} seguidores
                @if (channel.tipo) {
                  <span class="channel-badge">{{ channel.tipo }}</span>
                }
                @if (memberIds().has(channel.id)) {
                  <span class="member-badge">Miembro</span>
                }
              </span>
            </div>
            @if (selectedChannel()?.id === channel.id) {
              <mat-icon class="check-icon">check_circle</mat-icon>
            }
          </button>
        }
      }
    </div>

    <div class="dialog-footer">
      <button mat-button (click)="dialogRef.close()" class="close-btn">Cancelar</button>
      <button
        mat-flat-button
        class="confirm-btn"
        [disabled]="!selectedChannel()"
        (click)="confirm()">
        Confirmar
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 70vh;
      color: white;
    }

    /* ── Header ── */
    .dialog-header {
      text-align: center;
      padding: 24px 24px 16px;
      background: linear-gradient(135deg, rgba(35, 166, 213, 0.1) 0%, rgba(243, 230, 40, 0.08) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 14px;
      background: linear-gradient(135deg, #23a6d5 0%, #1a8ab8 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(35, 166, 213, 0.35);
    }

    .header-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #ffffff;
    }

    .header-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.55);
      margin: 0;
      line-height: 1.4;
    }

    /* ── Search ── */
    .dialog-search {
      padding: 16px 16px 0;
      flex-shrink: 0;
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 10px 14px;
      transition: border-color 0.2s, background 0.2s;
    }

    .search-input-wrapper:focus-within {
      border-color: rgba(35, 166, 213, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }

    .search-icon {
      color: rgba(255, 255, 255, 0.35);
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-size: 0.9rem;
      font-family: inherit;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .search-spinner {
      flex-shrink: 0;
    }

    .search-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      border-radius: 50%;
      color: rgba(255, 255, 255, 0.4);
      transition: color 0.15s, background 0.15s;
    }

    .search-clear:hover {
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.08);
    }

    .search-clear mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* ── Channel list ── */
    .channel-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .channel-list::-webkit-scrollbar {
      width: 5px;
    }

    .channel-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .channel-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }

    .channel-list::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px 16px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.85rem;
    }

    .empty-state mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: rgba(255, 255, 255, 0.2);
    }

    .channel-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      color: white;
      font-family: inherit;
    }

    .channel-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .channel-item.selected {
      background: rgba(35, 166, 213, 0.1);
    }

    .channel-avatar {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 10px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(35, 166, 213, 0.2), rgba(243, 230, 40, 0.15));
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .channel-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-fallback {
      font-size: 1rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.8);
    }

    .channel-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .channel-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .channel-meta {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.45);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .channel-badge {
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 8px;
      background: rgba(243, 230, 40, 0.12);
      color: rgba(243, 230, 40, 0.8);
      border: 1px solid rgba(243, 230, 40, 0.2);
    }

    .member-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 8px;
      border-radius: 20px;
      background: rgba(76, 175, 80, 0.12);
      color: #81c784;
      border: none;
    }

    .check-icon {
      color: #23a6d5;
      font-size: 22px;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    /* ── Footer ── */
    .dialog-footer {
      padding: 12px 16px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    .close-btn {
      color: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .close-btn:hover {
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.06);
    }

    .confirm-btn {
      border-radius: 8px;
      font-size: 0.85rem;
      background: linear-gradient(135deg, #23a6d5, #1a8ab8);
      color: #ffffff;
      padding: 0 20px;
    }

    .confirm-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #2bb8e8, #23a6d5);
      box-shadow: 0 4px 12px rgba(35, 166, 213, 0.4);
    }

    .confirm-btn:disabled {
      opacity: 0.4;
    }
  `],
  host: {
    '(document:keydown.escape)': 'dialogRef.close()',
  },
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(12px)' }),
          stagger('30ms', [
            animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class SelectChannelDialogComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  dialogRef = inject(MatDialogRef<SelectChannelDialogComponent>);
  private canalService = inject(CanalService);

  channels = signal<Canal[]>([]);
  selectedChannel = signal<Canal | null>(null);
  searching = signal(false);
  searchValue = signal('');
  memberIds = signal<Set<number>>(new Set());

  constructor() {
    effect((onCleanup) => {
      const query = this.searchValue();

      const timer = setTimeout(() => {
        this.searching.set(true);

        const params: Record<string, any> = {
          page_size: 10,
          ordering: '-cantidad_suscripciones',
        };
        if (query.length > 0) {
          params['nombre__contains'] = query;
        }

        this.canalService.getChanels(params).subscribe({
          next: (response: any) => {
            const results = (response.results ?? response).filter(
              (c: Canal) => c.planes && c.planes.length > 0
            );
            this.channels.set(results);
            this.searching.set(false);
            this.checkMembership(results);
          },
          error: () => this.searching.set(false),
        });
      }, query === '' ? 0 : 300);

      onCleanup(() => clearTimeout(timer));
    });
  }

  private checkMembership(channels: Canal[]): void {
    const ids = new Set<number>();
    channels.forEach(channel => {
      this.canalService.esMiembro(channel.id).subscribe({
        next: (res: any) => {
          if (res.is_member) {
            ids.add(channel.id);
            this.memberIds.set(new Set(ids));
          }
        },
        error: () => {},
      });
    });
  }

  onInput(event: Event): void {
    this.searchValue.set((event.target as HTMLInputElement).value);
  }

  selectChannel(channel: Canal): void {
    if (this.selectedChannel()?.id === channel.id) {
      this.selectedChannel.set(null);
    } else {
      this.selectedChannel.set(channel);
    }
  }

  clearSearch(): void {
    this.searchValue.set('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  confirm(): void {
    if (this.selectedChannel()) {
      this.dialogRef.close(this.selectedChannel());
    }
  }
}
