import { Component } from '@angular/core';
import {
  RadioCardsComponent,
  RadioStation,
} from '../../components/radio-cards/radio-cards.component';
import { VolumeControlComponent } from '../../components/volume-control/volume-control.component';

@Component({
  selector: 'app-radio-demo',
  standalone: true,
  imports: [RadioCardsComponent, VolumeControlComponent],
  template: `
    <div style="padding:1rem">
      <h3>Demo: Radio Cards</h3>
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
        <app-volume-control></app-volume-control>
        <a routerLink="/radio-favorites" class="mat-button">Favoritos</a>
      </div>
      <app-radio-cards
        [stations]="stations"
        (play)="onPlay($event)"
        (toggleFavorite)="onToggleFav($event)"></app-radio-cards>
    </div>
  `,
})
export class RadioDemoComponent {
  stations: RadioStation[] = [
    {
      id: 'r1',
      name: 'Picta FM',
      description: 'Lo mejor de la música',
      imageUrl: '/img/default.webp',
      frequency: '101.1',
      isFavorite: false,
      isPlaying: false,
    },
    {
      id: 'r2',
      name: 'Cubana Radio',
      description: 'Noticias y cultura',
      imageUrl: '/img/default.webp',
      frequency: '98.3',
      isFavorite: true,
      isPlaying: false,
    },
  ];

  onPlay(s: RadioStation) {
    try {
      // delegate to RadioService when demo triggers play
      // inject service lazily to avoid changing constructor signature
      const {
        RadioService,
      } = require('../../modules/picta/services/radio.service');
    } catch (e) {
      // noop: demo only
    }
  }
  onToggleFav(s: RadioStation) {
    // demo no-op: parent components listen to toggleFavorite output
  }
}
