import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Publication, Serie } from '../../../medias/models/publicacion.model';
import { PublicationService } from '../../../medias/services/publication-service';
import { SerieService } from '../../services/serie.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { SerieCardComponent } from '../serie-card/serie-card.component';

type CubaRecentMedia = 'peliculas' | 'series';

@Component({
  selector: 'app-recent-cuba-expanded',
  templateUrl: './recent-cuba-expanded.component.html',
  styleUrls: ['./recent-cuba-expanded.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton, MatIcon, MovieCardComponent, SerieCardComponent],
})
export class RecentCubaExpandedComponent {
  private readonly pageSize = 20;

  private readonly route = inject(ActivatedRoute);
  private readonly publicationService = inject(PublicationService);
  private readonly serieService = inject(SerieService);

  readonly media = signal<CubaRecentMedia>('peliculas');
  readonly loading = signal<boolean>(true);
  readonly items = signal<Array<Publication | Serie>>([]);

  readonly isMovieView = computed(() => this.media() === 'peliculas');
  readonly pageTitle = computed(() =>
    this.isMovieView() ? 'Películas recientes de Cuba' : 'Series recientes de Cuba',
  );
  readonly pageSubtitle = computed(() =>
    this.isMovieView()
      ? 'Listado de los 20 títulos más recientes de películas de Cuba.'
      : 'Listado de los 20 títulos más recientes de series de Cuba.',
  );
  readonly backLabel = computed(() =>
    this.isMovieView() ? 'Volver a Películas' : 'Volver a Series',
  );
  readonly backLink = computed(() =>
    this.isMovieView() ? ['/categoria', 'Película'] : ['/categoria', 'Serie'],
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const raw = params.get('media');
      const media: CubaRecentMedia = raw === 'series' ? 'series' : 'peliculas';
      this.media.set(media);
      this.loadRecentCubaItems();
    });
  }

  trackMovie(_index: number, item: Publication | Serie): number {
    return Number((item as Publication)?.id ?? 0);
  }

  trackSerie(_index: number, item: Publication | Serie): number {
    const raw = (item as any)?.pelser_id ?? (item as any)?.id;
    return Number(raw ?? 0);
  }

  private loadRecentCubaItems() {
    this.loading.set(true);

    if (this.isMovieView()) {
      this.publicationService
        .getPublications({
          ordering: '-fecha_publicado',
          page: 1,
          page_size: this.pageSize,
          tipologia_nombre_raw__in: 'Película',
          pais__wildcard: 'Cuba',
        })
        .subscribe({
          next: (response: any) => {
            const batch = Array.isArray(response?.results) ? response.results : [];
            this.items.set(batch);
            this.loading.set(false);
          },
          error: () => {
            this.items.set([]);
            this.loading.set(false);
          },
        });
      return;
    }

    this.serieService
      .getAll({
        tipologia_nombre_raw: 'Serie',
        page: 1,
        page_size: this.pageSize,
        pais__wildcard: 'Cuba',
      })
      .subscribe({
        next: (response: any) => {
          const batch = Array.isArray(response?.results) ? response.results : [];
          this.items.set(batch);
          this.loading.set(false);
        },
        error: () => {
          this.items.set([]);
          this.loading.set(false);
        },
      });
  }
}
