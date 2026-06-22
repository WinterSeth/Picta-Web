import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardImage } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Publication } from '../../../medias/models/publicacion.model';

@Component({
  selector: 'app-documental-card',
  templateUrl: './documental-card.component.html',
  styleUrls: ['./documental-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, MatCard, MatCardImage, MatIcon, MatTooltip],
})
export class DocumentalCardComponent {
  readonly documental = input.required<Publication>();

  readonly country = computed(() => this.documental()?.categoria?.documental?.pais || '');
  readonly year = computed(() => this.documental()?.categoria?.video?.ano || '');
  readonly duration = computed(() => this.documental()?.duracion || 'Duración no disponible');
  readonly description = computed(() => (this.documental()?.descripcion || '').trim());
}
