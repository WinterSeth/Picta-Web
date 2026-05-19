import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RadioService, RadioStation } from '../../services/radio.service';
import { RadioCardsComponent } from '../../components/radio-cards/radio-cards.component';

@Component({
  selector: 'app-radio-favorites',
  standalone: true,
  imports: [
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RadioCardsComponent,
    NgIf
  ],
  template: `
    <div class="favorites-page">
      <h2>Favoritos</h2>
      <div role="list" class="favorites-list">
        <app-radio-cards
          [stations]="stations"
          (play)="onPlay($event)"
          (toggleFavorite)="onToggleFavorite($event)">
        </app-radio-cards>
      </div>
      <div *ngIf="stations.length === 0" class="empty">
        No tenés estaciones favoritas aún.
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 1rem;
      }
      .favorites-list {
        display: grid;
        gap: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioFavoritesComponent {
  private radio = inject(RadioService);

  get stations(): RadioStation[] {
    // Map favorites keys back to station placeholders — the service does not store
    // full station objects, so we'll present minimal cards with id set to key.
    return this.radio
      .favorites()
      .map(k => ({ id: k, name: k }) as RadioStation);
  }

  onPlay(s: RadioStation) {
    // Since we don't have full listenurl here, delegate to select; users can navigate
    // to full list to play. If station id matches current stations, radio.play should work.
    // Prefer selecting the station; playback may require full station object elsewhere
    try {
      this.radio.select(s as any);
    } catch (e) {
      console.error('onPlay favorite error', e);
    }
  }

  onToggleFavorite(s: RadioStation) {
    // Toggle via service (will remove)
    this.radio.toggleFavorite(s as any);
  }
}
