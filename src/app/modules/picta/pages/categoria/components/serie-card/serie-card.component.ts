import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardImage } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Serie } from '../../../medias/models/publicacion.model';

@Component({
  selector: 'app-serie-card',
  templateUrl: './serie-card.component.html',
  styleUrls: ['./serie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgOptimizedImage,
    MatCard,
    MatCardImage,
    MatIcon,
    MatTooltip,
  ],
})
export class SerieCardComponent {
  readonly serie = input.required<Serie>();

  // Ruta base para los filtros de país y año. Por defecto es '/categoria/Serie'
  // Puede ser '/novelas' o '/shows' para redirigir a esas rutas
  readonly baseRoute = input<string>('/categoria/Serie');

  readonly serieYear = computed(() => this.serie()?.ano || '');
  readonly serieCountry = computed(() => this.serie()?.pais || '');

  readonly seasonsCount = computed(() =>
    Number(this.serie()?.cantidad_temporadas || 0),
  );
  readonly episodesCount = computed(() =>
    Number(this.serie()?.cantidad_capitulos || 0),
  );

  readonly seasonsLabel = computed(() => {
    const count = this.seasonsCount();
    return `${count} ${count === 1 ? 'Temporada' : 'Temporadas'}`;
  });

  readonly episodesLabel = computed(() => {
    const count = this.episodesCount();
    return `${count} ${count === 1 ? 'Capítulo' : 'Capítulos'}`;
  });

  readonly genresSummary = computed(() => {
    const names = (this.serie()?.genero || [])
      .map(genre => genre.nombre)
      .filter(Boolean);
    if (!names.length) {
      return '';
    }
    if (names.length === 1) {
      return names[0];
    }
    return `${names[0]} +${names.length - 1}`;
  });

  readonly genresTooltip = computed(() => {
    const names = (this.serie()?.genero || [])
      .map(genre => genre.nombre)
      .filter(Boolean);
    return names.join(', ');
  });

  readonly synopsis = computed(() => {
    const serie = this.serie() as Serie & {
      sinopsis?: string;
      descripcion?: string;
    };
    const text = serie?.sinopsis || serie?.descripcion || '';
    return String(text).trim();
  });
}
