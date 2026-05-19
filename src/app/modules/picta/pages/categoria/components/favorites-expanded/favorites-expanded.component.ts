import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Publication } from '../../../medias/models/publicacion.model';
import { Serie } from '../../../medias/models/publicacion.model';
import { PublicationService } from '../../../medias/services/publication-service';
import { SerieService } from '../../services/serie.service';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { SerieCardComponent } from '../serie-card/serie-card.component';
import { CategoriaLoadingStateComponent } from '../categoria-loading-state/categoria-loading-state.component';

type FavoriteMedia = 'peliculas' | 'series' | 'animes' | 'doramas';

@Component({
  selector: 'app-favorites-expanded',
  templateUrl: './favorites-expanded.component.html',
  styleUrls: ['./favorites-expanded.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButton,
    MatIcon,
    MovieCardComponent,
    SerieCardComponent,
    CategoriaLoadingStateComponent,
  ],
})
export class FavoritesExpandedComponent {
  private readonly movieFavoritesStorageKey = 'picta.movieFavorites';
  private readonly seriesFavoritesStorageKey = 'picta.seriesFavorites';
  private readonly animesFavoritesStorageKey = 'picta.animesFavorites';
  private readonly doramasFavoritesStorageKey = 'picta.doramasFavorites';
  private readonly pageSize = 20;

  private readonly route = inject(ActivatedRoute);
  private readonly publicationService = inject(PublicationService);
  private readonly serieService = inject(SerieService);
  private readonly localStorage = inject(LocalstorageService);

  readonly media = signal<FavoriteMedia>('peliculas');
  readonly favorites = signal<Array<Publication | Serie>>([]);
  readonly loading = signal<boolean>(true);
  readonly loadingMore = signal<boolean>(false);
  readonly hasMore = signal<boolean>(false);

  readonly isMovieView = computed(() => this.media() === 'peliculas');
  readonly isSeriesView = computed(() => this.media() === 'series');
  readonly isAnimesView = computed(() => this.media() === 'animes');
  readonly isDoramasView = computed(() => this.media() === 'doramas');
  readonly pageTitle = computed(() => {
    if (this.media() === 'peliculas') return 'Todas tus películas favoritas';
    if (this.media() === 'series') return 'Todas tus series favoritas';
    if (this.media() === 'animes') return 'Todos tus animes favoritos';
    return 'Todos tus doramas favoritos';
  });
  readonly backLabel = computed(() => {
    if (this.media() === 'peliculas') return 'Volver a Películas';
    if (this.media() === 'series') return 'Volver a Series';
    if (this.media() === 'animes') return 'Volver a Animes';
    return 'Volver a Doramas';
  });
  readonly backLink = computed(() => {
    if (this.media() === 'peliculas') return ['/categoria', 'Película'];
    if (this.media() === 'series') return ['/categoria', 'Serie'];
    if (this.media() === 'animes') return ['/animes'];
    return ['/doramas'];
  });

  private favoriteIds: number[] = [];
  private nextPage: number | null = 1;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const raw = params.get('media');
      let media: FavoriteMedia = 'peliculas';
      if (raw === 'series') {
        media = 'series';
      } else if (raw === 'animes') {
        media = 'animes';
      } else if (raw === 'doramas') {
        media = 'doramas';
      } else if (raw === 'peliculas') {
        media = 'peliculas';
      }
      this.media.set(media);
      this.resetAndLoad();
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading() || this.loadingMore() || !this.hasMore() || !this.nextPage) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 80;

    if (scrollPosition >= scrollThreshold) {
      this.loadPage(this.nextPage, false);
    }
  }

  private resetAndLoad() {
    this.loading.set(true);
    this.loadingMore.set(false);
    this.favorites.set([]);
    this.nextPage = 1;
    this.favoriteIds = this.readFavoriteIds();

    if (!this.favoriteIds.length) {
      this.loading.set(false);
      this.hasMore.set(false);
      return;
    }

    this.loadPage(1, true);
  }

  private loadPage(page: number, initial: boolean) {
    if (initial) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    const idList = this.favoriteIds.join('__');

    if (this.isMovieView()) {
      this.publicationService
        .getPublications({
          id__in: idList,
          page_size: this.pageSize,
          page,
        })
        .subscribe({
          next: (response: any) => this.applyPageResult(response, initial),
          error: () => this.handleLoadError(),
        });
      return;
    }

    // Para series y animes usamos serieService
    const params: any = {
      id__in: idList,
      pelser_id__in: idList,
      page_size: this.pageSize,
      page,
    };

    // Agregar filtro de género para animes
    if (this.isAnimesView()) {
      params.genero_raw = 'Anime';
    }

    this.serieService
      .getAll(params)
      .subscribe({
        next: (response: any) => this.applyPageResult(response, initial),
        error: () => this.handleLoadError(),
      });
  }

  private applyPageResult(response: any, initial: boolean) {
    const batch = Array.isArray(response?.results) ? response.results : [];
    const merged = initial ? batch : [...this.favorites(), ...batch];
    const sorted = this.sortByFavoriteOrder(merged);

    this.favorites.set(sorted);

    this.nextPage = this.resolveNextPage(response?.next);
    this.hasMore.set(!!this.nextPage);

    this.loading.set(false);
    this.loadingMore.set(false);
  }

  private handleLoadError() {
    this.loading.set(false);
    this.loadingMore.set(false);
    this.hasMore.set(false);
  }

  private readFavoriteIds(): number[] {
    let key: string;
    if (this.isMovieView()) {
      key = this.movieFavoritesStorageKey;
    } else if (this.isAnimesView()) {
      key = this.animesFavoritesStorageKey;
    } else if (this.isDoramasView()) {
      key = this.doramasFavoritesStorageKey;
    } else {
      key = this.seriesFavoritesStorageKey;
    }
    const raw = this.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<number | string>;
      if (!Array.isArray(parsed)) {
        return [];
      }

      const deduped = new Set<number>();
      for (const item of parsed) {
        const id = Number(item);
        if (Number.isFinite(id) && id > 0) {
          deduped.add(id);
        }
      }

      return Array.from(deduped);
    } catch {
      return [];
    }
  }

  private sortByFavoriteOrder(items: Array<Publication | Serie>): Array<Publication | Serie> {
    const orderMap = new Map<number, number>();
    this.favoriteIds.forEach((id, index) => orderMap.set(id, index));

    return [...items].sort((a, b) => {
      const left = orderMap.get(this.resolveItemId(a)) ?? Number.MAX_SAFE_INTEGER;
      const right = orderMap.get(this.resolveItemId(b)) ?? Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  }

  private resolveItemId(item: Publication | Serie): number {
    const raw = this.isMovieView()
      ? (item as Publication)?.id
      : ((item as any)?.pelser_id ?? (item as any)?.id);

    return Number(raw);
  }

  trackMovie(_index: number, item: Publication | Serie): number {
    return Number((item as Publication)?.id ?? 0);
  }

  trackSerie(_index: number, item: Publication | Serie): number {
    const raw = (item as any)?.pelser_id ?? (item as any)?.id;
    return Number(raw ?? 0);
  }

  private resolveNextPage(next: string | number | null | undefined): number | null {
    if (next === null || next === undefined || next === '') {
      return null;
    }

    if (typeof next === 'number') {
      return Number.isFinite(next) && next > 0 ? next : null;
    }

    if (typeof next === 'string') {
      const trimmed = next.trim();
      if (!trimmed) {
        return null;
      }

      if (/^\d+$/.test(trimmed)) {
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      }

      try {
        const parsedUrl = new URL(trimmed, 'http://localhost');
        const pageValue = parsedUrl.searchParams.get('page');
        if (!pageValue) {
          return null;
        }

        const parsed = Number(pageValue);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      } catch {
        return null;
      }
    }

    return null;
  }
}
