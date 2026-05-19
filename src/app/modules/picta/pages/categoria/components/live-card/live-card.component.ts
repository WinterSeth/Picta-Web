import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardImage } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Publication } from '../../../medias/models/publicacion.model';

@Component({
  selector: 'app-live-card',
  templateUrl: './live-card.component.html',
  styleUrls: ['./live-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, MatCard, MatCardImage, MatIcon, MatTooltip],
})
export class LiveCardComponent {
  readonly live = input.required<Publication>();

  readonly isOnAir = computed(() => this.live()?.categoria?.live?.finalizado === false);
  readonly description = computed(() => (this.live()?.descripcion || '').trim());
  readonly duration = computed(() => this.live()?.duracion || (this.isOnAir() ? 'Emisión activa' : 'Finalizado'));
  readonly viewersNow = computed(() => Number(this.live()?.cantidad_vistas_ahora || 0));
  readonly hasChat = computed(() => !!this.live()?.mostrar_chat);
  readonly showChat = computed(() => this.isOnAir() && this.hasChat());
  readonly channelName = computed(() => this.live()?.canal?.nombre || 'Canal no disponible');
}
