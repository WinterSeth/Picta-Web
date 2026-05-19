import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardImage } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Publication } from '../../../medias/models/publicacion.model';

@Component({
  selector: 'app-musical-card',
  templateUrl: 'musical-card.component.html',
  styleUrls: ['musical-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, MatCard, MatCardImage, MatIcon, MatTooltip],
})
export class MusicalCardComponent {
  readonly videoclip = input.required<Publication>();

  readonly duration = computed(() => this.videoclip()?.duracion || 'Duración no disponible');
  readonly description = computed(() => (this.videoclip()?.descripcion || '').trim());
  readonly channelName = computed(() => this.videoclip()?.canal?.nombre || 'Canal no disponible');
}
