
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RadioService as AppRadioService } from '../../services/radio.service';
import { getImageSrcForStation } from '../../utils/radio-image.util';
import { NotificationService } from '../../services/notification.service';

export interface RadioStation {
  id: string | number;
  name: string;
  description?: string;
  imageUrl?: string;
  frequency?: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
  listeners?: number | string;
}

@Component({
  selector: 'app-radio-cards',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './radio-cards.component.html',
  styleUrls: ['./radio-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioCardsComponent {
    /** Formatea el nombre: sin guion bajo y con mayúscula inicial en cada palabra */
    formatStationName(st: RadioStation): string {
      let raw = st.name;
      if (!raw || raw.toLowerCase().includes('unspecified')) {
        // @ts-ignore: mount y server_name pueden venir del backend
        raw = (st as any).mount || (st as any).server_name || '';
      }
      return raw
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
  readonly appRadio = inject(AppRadioService);
  private notificationService = inject(NotificationService);
  // Internal signal-backed list — accept array via @Input but expose as signal internally
  private _stations = signal<RadioStation[]>([]);

  @Input() set stations(value: RadioStation[] | undefined) {
    this._stations.set(value ?? []);
  }
  @Input() compact = false;
  // Expose read-only signal for consumers inside template
  readonly stationsSignal = this._stations;

  // Selected station id (signal) — mirror service currentStationId
  selectedId = this.appRadio.currentStationId;

  // Events: play/stop and toggle favorite
  // play/stop events deprecated on card level — kept for compatibility but no-op
  @Output() play = new EventEmitter<RadioStation>();
  @Output() stop = new EventEmitter<RadioStation>();
  @Output() toggleFavorite = new EventEmitter<RadioStation>();
  @Output() select = new EventEmitter<RadioStation>();

  playToggle(st: RadioStation, ev?: Event) {
    // Playback is handled in the radio detail view. Suppress action from cards.
    ev?.stopPropagation();
    // Emit a deprecated event for compatibility but do not trigger playback.
    try {
      this.play.emit(st);
    } catch (e) {
      // keep as console.error only — remove stray console.log usage per request
      console.error('playToggle suppressed error', e);
    }
  }

  onToggleFavorite(st: RadioStation, ev?: Event) {
    ev?.stopPropagation();
    try {
      const wasFavorite = this.appRadio.isFavorite(st);
      // Use RadioService implementation to toggle favorites and emit event for parents
      this.appRadio.toggleFavorite(st);
      const stationName = this.formatStationName(st);
      this.notificationService.open(
        'notification',
        wasFavorite
          ? `Se elimino de favoritos: ${stationName}`
          : `Se agrego a favoritos: ${stationName}`
      );
      this.toggleFavorite.emit(st);
    } catch (e) {
      // Fail silently but surface to console.error for debugging (no console.log left)
      console.error('toggleFavorite error', e);
    }
  }

  /** Image error handler for the radio-cards grid */
  onImgError(event: Event) {
    const img = event?.target as HTMLImageElement | null;
    if (img && img.src) {
      if (!img.src.endsWith('/img/default.webp')) {
        img.src = '/img/default.webp';
      }
    }
  }

  onSelect(st: RadioStation) {
    try {
      this.appRadio.select(st);
      this.select.emit(st);
    } catch (e) {
      console.error('onSelect error', e);
    }
  }

  trackById(_: number, item: RadioStation) {
    return item.id;
  }

  /** Centralized image selection wrapper — delegates to shared util. */
  getImageSrc(st: RadioStation): string {
    return getImageSrcForStation(st as any);
  }

  /** Format listeners into human-friendly string, e.g. 12345 -> "12.3k" */
  formatListeners(raw: number | string | undefined | null): string {
    if (raw === undefined || raw === null || raw === '') return '—';
    const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    if (!Number.isFinite(n)) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }
}
