import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  makeStateKey,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubSink } from 'subsink';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { PublicationService } from '../../../medias/services/publication-service';
import { SerieService } from '../../services/serie.service';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { GeneroService } from '../../../serie/services/genero.service';
import {
  Genero,
  Publication,
  Serie,
} from '../../../medias/models/publicacion.model';
import { PictaResponse } from '../../../../models/response.picta.model';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import {
  isPlatformBrowser,
  NgIf,
  UpperCasePipe,
  NgOptimizedImage,
  DatePipe,
} from '@angular/common';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { EnvivoListComponent } from '../envivo-list/envivo-list.component';
import { MyCarouseloComponent } from '../../../common-components/components/my-carousel-o/my-carouselo.component';
import { Dir } from '@angular/cdk/bidi';
import { MusicalListComponent } from '../musical-list/musical-list.component';
import { DocumentalListComponent } from '../documental-list/documental-list.component';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { SerieListComponent } from '../serie-list/serie-list.component';
import {
  MatButtonToggleGroup,
  MatButtonToggle,
} from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import {
  MatFormField,
  MatFormFieldControl,
  MatLabel,
} from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OwlOptions } from 'ngx-owl-carousel-o';
import {
  GenreCarouselTag,
  GenreTagsCarouselComponent,
} from '../genre-tags-carousel/genre-tags-carousel.component';
import { CategoriaLoadingStateComponent } from '../categoria-loading-state/categoria-loading-state.component';
import { CarouselSkeletonComponent } from '../../../common-components/components/carousel-skeleton/carousel-skeleton.component';
import { SectionHeaderComponent } from '../../../common-components/components/section-header/section-header.component';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
  providers: [DatePipe],
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatButtonToggleGroup,
    MatButtonToggle,
    SerieListComponent,
    MovieListComponent,
    DocumentalListComponent,
    MusicalListComponent,
    MyCarouseloComponent,
    EnvivoListComponent,
    UpperCasePipe,
    MyCarouseloComponent,
    GenreTagsCarouselComponent,
    CategoriaLoadingStateComponent,
    CarouselSkeletonComponent,
    SectionHeaderComponent,
  ],
})
export class CategoriaComponent implements OnInit, OnDestroy {
  private readonly movieFavoritesStorageKey = 'picta.movieFavorites';
  private readonly seriesFavoritesStorageKey = 'picta.seriesFavorites';
  private readonly movieGenrePageSize = 8;
  private readonly favoriteGenrePageSize = 7;
  private readonly movieGenreApiPageSize = 8;
  private readonly movieGenreFavoritesStorageKey = 'picta.movieGenreFavorites';
  private readonly seriesGenrePageSize = 8;
  private readonly seriesGenreApiPageSize = 8;
  private readonly seriesGenreFavoritesStorageKey =
    'picta.seriesGenreFavorites';
  private movieGenrePage = 0;
  private favoriteMovieGenrePage = 0;
  private seriesGenrePage = 0;
  private favoriteSeriesGenrePage = 0;
  private movieGenreStartIndex = 0;
  private favoriteMovieGenreStartIndex = 0;
  private seriesGenreStartIndex = 0;
  private favoriteSeriesGenreStartIndex = 0;
  private seriesGenreNextPage: number | null = 1;
  private movieGenreNextPage: number | null = 1;
  private seriesGenreLoading = false;
  private movieGenreLoading = false;
  seriesGenres: Genero[] = [];
  movieGenres: Genero[] = [];
  favoriteMovieGenres: Genero[] = [];
  favoriteSeriesGenres: Genero[] = [];

  readonly movieGenreCarouselOptions: OwlOptions = {
    loop: false,
    dots: false,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 8,
    slideBy: 1,
    responsive: {
      0: { items: 2, slideBy: 1 },
      480: { items: 3, slideBy: 1 },
      768: { items: 4, slideBy: 1 },
      1024: { items: 6, slideBy: 1 },
      1280: { items: this.movieGenrePageSize, slideBy: 1 },
    },
  };

  readonly favoriteMovieGenreCarouselOptions: OwlOptions = {
    loop: false,
    dots: false,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 8,
    slideBy: 1,
    responsive: {
      0: { items: 2, slideBy: 1 },
      480: { items: 3, slideBy: 1 },
      768: { items: 4, slideBy: 1 },
      1024: { items: 6, slideBy: 1 },
      1280: { items: this.favoriteGenrePageSize, slideBy: 1 },
    },
  };

  readonly showAllGenresCarousels = false;

  readonly seriesGenreCarouselOptions: OwlOptions = {
    loop: false,
    dots: false,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 8,
    slideBy: 1,
    responsive: {
      0: { items: 2, slideBy: 1 },
      480: { items: 3, slideBy: 1 },
      768: { items: 4, slideBy: 1 },
      1024: { items: 6, slideBy: 1 },
      1280: { items: this.seriesGenrePageSize, slideBy: 1 },
    },
  };

  readonly favoriteSeriesGenreCarouselOptions: OwlOptions = {
    loop: false,
    dots: false,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 8,
    slideBy: 1,
    responsive: {
      0: { items: 2, slideBy: 1 },
      480: { items: 3, slideBy: 1 },
      768: { items: 4, slideBy: 1 },
      1024: { items: 6, slideBy: 1 },
      1280: { items: this.favoriteGenrePageSize, slideBy: 1 },
    },
  };

  readonly liveCarouselOptions: Partial<OwlOptions> = {
    responsive: {
      0: { items: 2.1 },
      400: { items: 3.1 },
      768: { items: 3.2 },
      1024: { items: 4.2 },
      1280: { items: 5.1 },
      1536: { items: 6.1 },
    },
  };

  readonly favoriteSeriesCarouselOptions: Partial<OwlOptions> = {
    loop: false,
    rewind: false,
    dots: false,
    nav: false,
    autoWidth: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 5,
  };

  readonly favoriteMoviesCarouselOptions: Partial<OwlOptions> = {
    loop: false,
    rewind: false,
    dots: false,
    nav: false,
    autoWidth: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 5,
  };

  private loadPublicaciones = inject(PublicationService);
  private loadSeries = inject(SerieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private localStorage = inject(LocalstorageService);
  private generoService = inject(GeneroService);
  private breakpointObserver = inject(BreakpointObserver);
  @Inject(PLATFORM_ID) private platformId: any;
  private datePipe = inject(DatePipe);

  popularLikeMovie: Publication[] = [];

  items = [];
  page = 1;

  categoria = '';
  next: string;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Small, Breakpoints.XSmall])
    .pipe(map(result => result.matches));
  @Output() selectionChange: EventEmitter<MatSelectChange>;

  paises = [
    'Cuba',
    'EEUU',
    'UK',
    'España',
    'Turquía',
    'Corea',
    'China',
    'Japón',
    'Inglaterra',
    'Alemania',
    'México',
    'Colombia',
    'Argentina',
    'Francia',
    'Brasil',
    'Italia',
    'Rusia',
    'Canadá',
    'Austria',
    'Australia',
    'Taiwán',
    'Hong Kong',
    'Noruega',
    'Finlandia',
    'Ucrania',
    'Irlanda',
  ];

  years: string[] = Array.from(
    { length: new Date().getFullYear() - 1949 },
    (_, index) => String(new Date().getFullYear() - index),
  );

  filtersSeries = {
    page: 1,
    page_size: 20,
    next: 1,
    ordering: '-last_update',
    nombre__contains: '',
    genero_raw: '',
    genero_raw_exclude: 'Novela__Show__Anime__Dorama__Infantil__Videojuego__Deportivo',
    pais__contains: '',
    ano__in: '',
  };

  filterCategories: any = {
    page: 1,
    tipologia_nombre_raw: this.categoria,
    page_size: 20,
    next: 1,
    ordering: '-fecha_publicado',
    genero_raw: '',
    pais__contains: '',
  };

  topMovie: any = {
    page: 1,
    tipologia_nombre_raw: 'Película',
    page_size: 10,
    ordering: '-cantidad_me_gusta',
    genero_raw: '',
    pais__contains: '',
  };

  videos: Publication[];
  series: Serie[] = [];
  filteredSeries: Serie[];
  animes: Serie[] = [];
  filteredVideos: Publication[];

  generosCategories: Genero[] = [];

  searchControl = new UntypedFormControl('');
  generoControl = new UntypedFormControl('');
  paisControl = new UntypedFormControl('');
  anoControl = new UntypedFormControl('');
  generoCategorieControl = new UntypedFormControl('');
  viewModeControl = new UntypedFormControl('card');

  private subs = new SubSink();
  private filterSubs = new SubSink();
  loading = true;
  resultsLoading = false;
  private lastAppliedQuerySignature = '';

canalesTv: Publication[] = [];
  popular: Publication[] = [];

  popularMovie = signal<Publication[]>([]);
  paidMovie = signal<Publication[]>([]);
  newestMovie = signal<Publication[]>([]);
  latestPaidMovies = signal<Publication[]>([]);

  isLoadingPopularMovie = signal(true);
  isLoadingPaidMovie = signal(true);
  isLoadingLatestPaidMovie = signal(true);
  isLoadingNewestMovie = signal(true);

  newestMoviePreview = computed(() => (this.newestMovie() || []).slice(0, 20));

  newestCubanMovie = signal<Publication[]>([]);

  latestSerie = signal<Publication[]>([]);

  latestSeriePreview = computed(() => (this.latestSerie() || []).slice(0, 20));

  latestCubanSerie = signal<Publication[]>([]);

  latestUpdatedSerie = signal<Publication[]>([]);

  favoriteSeries = signal<Publication[]>([]);
  favoriteMovies = signal<Publication[]>([]);
  isLoadingFavoriteMovies = signal(false);
  isLoadingFavoriteSeries = signal(false);

  popularSerie: Publication[] = [];
  loadMore: boolean;

  constructor() {}

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading || this.resultsLoading || this.loadMore) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      if (
        (this.categoria === 'Película' ||
          this.categoria === 'Documental' ||
          this.categoria === 'Video Musical' ||
          this.categoria === 'Live') &&
        this.filterCategories?.next
      ) {
        this.loadVideos();
      }

      if (this.categoria === 'Serie' && this.filtersSeries?.next) {
        this.filters();
      }
    }
  }

  ngOnInit() {
    this.subs.add(
      this.route.paramMap
        .pipe(
          tap(params => {
            this.categoria =
              params.get('cat') !== 'Peliculas'
                ? params.get('cat')
                : 'Películas';
            this.title.setTitle(`${this.categoria} - Picta`);
            this.loading = true;
            this.resultsLoading = false;
            this.resetMovieHighlights();
            this.resetSeriesHighlights();
            this.videos = [];
            this.filteredVideos = [];
            this.series = [];
            this.resetMovieGenresPagination();
            if (this.categoria === 'Película') {
              this.loadMovieHighlights();
              this.loadFavoriteMoviesCarousel();
            }
            if (this.categoria === 'Serie') {
              this.loadSeriesHighlights();
              this.loadFavoriteSeriesCarousel();
              this.resetSeriesGenresPagination();
              this.loadNextSeriesGenresPage();
            }
            if (this.categoria === 'Live') {
              this.loadDataLives();
            }
            if (this.categoria === 'Video Musical') {
              this.loadVideoMusicalGenres();
            }
            this.resetControls();
            this.hydrateFiltersFromQueryParams(
              this.route.snapshot.queryParamMap,
            );
            this.applyHydratedFiltersToState();
            this.lastAppliedQuerySignature = this.buildQuerySignature(
              this.route.snapshot.queryParamMap,
            );
          }),
          switchMap(params => {
            if (this.categoria !== 'Serie') {
              this.filterCategories.tipologia_nombre_raw__in = this.categoria;
              this.filterCategories.tipologia_nombre_raw__in +=
                this.categoria === 'Video Musical' ? '__Videoclip' : '';
              this.filterCategories.page = 1;
              return this.loadPublicaciones
                .getPublications(this.filterCategories)
                .pipe();
            } else {
              this.filtersSeries.page = 1;
              return this.loadSeries.getAll(this.filtersSeries).pipe();
            }
          }),
        )
        .subscribe((response: any) => {
          if (this.categoria === 'Serie') {
            this.filtersSeries.page = 1;
            this.series = response.results;
            this.filteredSeries = response.results;
            const nextPage = this.resolveNextPage(response.next);
            this.filtersSeries.page = nextPage ?? 1;
            this.filtersSeries.next = nextPage ?? 0;
            this.loading = false;
            // this.filters();
          } else {
            this.videos = response.results;
            this.filteredVideos = response.results;
            const nextPage = this.resolveNextPage(response.next);
            this.filterCategories.page = nextPage ?? 1;
            this.filterCategories.next = nextPage;
            this.loading = false;
          }
          this.filterSubs.unsubscribe();
          this.filterSubs = new SubSink();
          this.initSearchForm();
          this.listenQueryParams();
        }),
    );
    if (isPlatformBrowser(this.platformId)) {
      this.listenViewModeControl();
    }
  }

  private resetMovieHighlights() {
    this.popularMovie.set([]);
    this.newestMovie.set([]);
    this.newestCubanMovie.set([]);
    this.paidMovie.set([]);
    this.latestPaidMovies.set([]);
  }

  private loadMovieHighlights() {
    const now = new Date();
    const currentDate = this.datePipe.transform(now, 'yyyy-MM-dd');
    const monthAgo = this.datePipe.transform(
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd',
    );

    this.subs.add(
      this.loadPublicaciones
        .getByMovieLastTime(currentDate, monthAgo)
        .subscribe((response: Publication[]) => {
          this.popularMovie.set(response || []);
          this.isLoadingPopularMovie.set(false);
        }),
    );

    this.subs.add(
      this.loadPublicaciones
        .getNewestMovies()
        .subscribe((response: Publication[]) => {
          this.newestMovie.set(response || []);
          this.isLoadingNewestMovie.set(false);
        }),
    );

    this.subs.add(
      this.loadPublicaciones
        .getPopularPaidMovies()
        .subscribe((response: Publication[]) => {
          this.paidMovie.set(response || []);
          this.isLoadingPaidMovie.set(false);
        }),
    );

    this.subs.add(
      this.loadPublicaciones
        .getLatestPaidMovies()
        .subscribe(
          (response: Publication[]) => {
            this.latestPaidMovies.set(response || []);
            this.isLoadingLatestPaidMovie.set(false);
          },
          () => {
            this.latestPaidMovies.set([]);
            this.isLoadingLatestPaidMovie.set(false);
          },
        ),
    );
  }

  private loadFavoriteMoviesCarousel() {
    const ids = this.getFavoriteMovieIdsFromStorage();
    if (!ids.length) {
      this.favoriteMovies.set([]);
      this.isLoadingFavoriteMovies.set(false);
      return;
    }

    this.isLoadingFavoriteMovies.set(true);
    this.loadFavoriteMoviesPage(ids, 1, []);
  }

  private loadFavoriteMoviesPage(
    ids: number[],
    page: number,
    collected: Publication[],
  ) {
    this.subs.add(
      this.loadPublicaciones
        .getPublications({
          id__in: ids.join('__'),
          page_size: 10,
          page,
        })
        .subscribe({
          next: (response: any) => {
            const batch = Array.isArray(response?.results)
              ? response.results
              : [];
            const merged = [...collected, ...batch];
            const nextPage = this.resolveNextPage(response?.next);

            if (nextPage) {
              this.loadFavoriteMoviesPage(ids, nextPage, merged);
              return;
            }

            this.favoriteMovies.set(
              this.sortMoviesByFavoriteOrder(merged, ids),
            );
            this.isLoadingFavoriteMovies.set(false);
          },
          error: () => {
            this.favoriteMovies.set([]);
            this.isLoadingFavoriteMovies.set(false);
          },
        }),
    );
  }

  private getFavoriteMovieIdsFromStorage(): number[] {
    const raw = this.localStorage.getItem(this.movieFavoritesStorageKey);
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

  private resetSeriesHighlights() {
    this.latestSerie.set([]);
    this.latestCubanSerie.set([]);
    this.latestUpdatedSerie.set([]);
  }

  private loadSeriesHighlights() {
    this.subs.add(
      this.loadPublicaciones
        .getBySerie()
        .subscribe((response: Publication[]) => {
          this.latestSerie.set(response || []);
        }),
    );

    this.subs.add(
      this.loadPublicaciones
        .getByCubanSerie()
        .subscribe((response: Publication[]) => {
          this.latestCubanSerie.set(response || []);
        }),
    );

    this.subs.add(
      this.loadPublicaciones
        .getBySerieLastUpdate()
        .subscribe((response: Publication[]) => {
          this.latestUpdatedSerie.set(response || []);
        }),
    );
  }

  private loadFavoriteSeriesCarousel() {
    const ids = this.getFavoriteSeriesIdsFromStorage();
    if (!ids.length) {
      this.favoriteSeries.set([]);
      this.isLoadingFavoriteSeries.set(false);
      return;
    }

    this.isLoadingFavoriteSeries.set(true);
    this.loadFavoriteSeriesPage(ids, 1, []);
  }

  private loadFavoriteSeriesPage(
    ids: number[],
    page: number,
    collected: Publication[],
  ) {
    this.subs.add(
      this.loadSeries
        .getAll({
          id__in: ids.join('__'),
          pelser_id__in: ids.join('__'),
          page_size: 10,
          page,
        })
        .subscribe({
          next: (response: any) => {
            const batch = Array.isArray(response?.results)
              ? response.results
              : [];
            const merged = [...collected, ...batch];
            const nextPage = this.resolveNextPage(response?.next);

            if (nextPage) {
              this.loadFavoriteSeriesPage(ids, nextPage, merged);
              return;
            }

            this.favoriteSeries.set(
              this.sortSeriesByFavoriteOrder(merged, ids),
            );
            this.isLoadingFavoriteSeries.set(false);
          },
          error: () => {
            this.favoriteSeries.set([]);
            this.isLoadingFavoriteSeries.set(false);
          },
        }),
    );
  }

  private getFavoriteSeriesIdsFromStorage(): number[] {
    const raw = this.localStorage.getItem(this.seriesFavoritesStorageKey);
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

  filters(replace = false) {
    this.loadMore = true;
    if (this.filtersSeries.next) {
      this.loadSeries
        .getAll(this.filtersSeries)
        .subscribe((response: PictaResponse<Serie>) => {
          this.filteredSeries = replace
            ? response.results
            : [...this.filteredSeries, ...response.results];
          const nextPage = this.resolveNextPage(response.next);
          this.filtersSeries.page = nextPage ?? 1;
          this.filtersSeries.next = nextPage ?? 0;
          this.loadMore = false;
        });
    }
  }

  ngOnDestroy(): void {
    this.filterSubs.unsubscribe();
    this.subs.unsubscribe();
  }

  loadVideos(replace = false) {
    this.loadMore = true;
    if (this.filterCategories.next) {
      this.subs.add(
        this.loadPublicaciones
          .getPublications(this.filterCategories)
          .subscribe(response => {
            this.filteredVideos = replace
              ? response.results
              : [...this.filteredVideos, ...response.results];
            const nextPage = this.resolveNextPage(response.next);
            this.filterCategories.next = nextPage;
            this.filterCategories.page = nextPage ?? 1;
            this.loadMore = false;
          }),
      );
    }
  }

  loadDataLives() {
    this.subs.add(
      this.loadPublicaciones
        .getByTipoContenido('')
        .subscribe((response: any) => {
          this.canalesTv = response;
        }),
    );
  }

  private loadVideoMusicalGenres() {
    if (this.generosCategories.length) {
      return;
    }

    this.subs.add(
      this.generoService.getAll({ tipo: 'mu' }).subscribe({
        next: (response: PictaResponse<Genero>) => {
          this.generosCategories = response.results;
        },
        error: () => {
          this.generosCategories = [];
        },
      }),
    );
  }

  setOrder(order: string) {
    this.filtersSeries.ordering = order;
    this.filtersSeries.page = 1;
    this.filtersSeries.next = 1;
    this.filters(true);
  }

  setOrderCategoria(order: string) {
    this.filterCategories.ordering = order;
    this.filterCategories.page = 1;
    this.filterCategories.next = 1;
    this.loadVideos(true);
  }

  setMovieGenreTag(genre: string) {
    if (this.generoControl.value === genre) {
      return;
    }
    this.generoControl.setValue(genre);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        genre: genre || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  movieGenreCarouselTags(): GenreCarouselTag[] {
    return this.visibleMovieGenreTags().map(tag => ({
      id: tag.id,
      label: tag.label,
      value: tag.value,
      trackBy: tag.value || 'all',
      showFavorite: !!tag.id,
      isFavorite: !!tag.id && this.isFavoriteMovieGenre(tag.id),
      favoriteOnly: false,
    }));
  }

  movieFavoriteGenreIds(): number[] {
    return this.favoriteMovieGenres.map(genre => genre.id);
  }

  favoriteMovieGenreCarouselTags(): GenreCarouselTag[] {
    return this.visibleFavoriteMovieGenreTags().map(genre => ({
      id: genre.id,
      label: genre.nombre,
      value: genre.nombre,
      trackBy: genre.id,
      showFavorite: true,
      isFavorite: true,
      favoriteOnly: true,
    }));
  }

  seriesFavoriteGenreIds(): number[] {
    return this.favoriteSeriesGenres.map(genre => genre.id);
  }

  seriesGenreCarouselTags(): GenreCarouselTag[] {
    return this.visibleSeriesGenreTags().map(tag => ({
      id: tag.id,
      label: tag.label,
      value: tag.value,
      trackBy: tag.value || 'all',
      showFavorite: !!tag.id,
      isFavorite: !!tag.id && this.isFavoriteSeriesGenre(tag.id),
      favoriteOnly: false,
    }));
  }

  favoriteSeriesGenreCarouselTags(): GenreCarouselTag[] {
    return this.visibleFavoriteSeriesGenreTags().map(genre => ({
      id: genre.id,
      label: genre.nombre,
      value: genre.nombre,
      trackBy: genre.id,
      showFavorite: true,
      isFavorite: true,
      favoriteOnly: true,
    }));
  }

  onMovieGenreFavoriteToggled(event: {
    id: number;
    label: string;
    event: Event;
  }) {
    this.toggleFavoriteMovieGenre(
      { id: event.id, nombre: event.label } as Genero,
      event.event,
    );
  }

  onSeriesGenreFavoriteToggled(event: {
    id: number;
    label: string;
    event: Event;
  }) {
    this.toggleFavoriteSeriesGenre(
      { id: event.id, nombre: event.label } as Genero,
      event.event,
    );
  }

  onFavoriteMediaChanged(event: {
    type: 'movie' | 'series';
    key: number;
    isFavorite: boolean;
  }) {
    if (event.isFavorite) {
      return;
    }

    if (event.type === 'movie') {
      // Update localStorage for movies (singular)
      const raw = this.localStorage.getItem(this.movieFavoritesStorageKey);
      const ids = raw ? (JSON.parse(raw) as number[]) : [];
      const newIds = ids.filter(id => id !== event.key);
      this.localStorage.setItem(this.movieFavoritesStorageKey, JSON.stringify(newIds));

      // Update local signal
      this.favoriteMovies.update(movies =>
        (movies || []).filter(movie => movie?.id !== event.key),
      );
      return;
    }

    // For series (non-anime series), update only seriesFavorites
    const raw = this.localStorage.getItem(this.seriesFavoritesStorageKey);
    const ids = raw ? (JSON.parse(raw) as number[]) : [];
    const newIds = ids.filter(id => id !== event.key);
    this.localStorage.setItem(this.seriesFavoritesStorageKey, JSON.stringify(newIds));

    // Update local signal
    this.favoriteSeries.update(series =>
      (series || []).filter(
        serie => this.getSeriesFavoriteId(serie) !== event.key,
      ),
    );
  }

  private getSeriesFavoriteId(serie: Publication): number {
    const raw = (serie as any)?.pelser_id ?? serie?.id;
    return Number(raw);
  }

  private sortMoviesByFavoriteOrder(
    items: Publication[],
    favoriteIds: number[],
  ): Publication[] {
    const orderMap = new Map<number, number>();
    favoriteIds.forEach((id, index) => orderMap.set(id, index));

    return [...items].sort((a, b) => {
      const left = orderMap.get(a?.id ?? -1) ?? Number.MAX_SAFE_INTEGER;
      const right = orderMap.get(b?.id ?? -1) ?? Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  }

  private sortSeriesByFavoriteOrder(
    items: Publication[],
    favoriteIds: number[],
  ): Publication[] {
    const orderMap = new Map<number, number>();
    favoriteIds.forEach((id, index) => orderMap.set(id, index));

    return [...items].sort((a, b) => {
      const left =
        orderMap.get(this.getSeriesFavoriteId(a)) ?? Number.MAX_SAFE_INTEGER;
      const right =
        orderMap.get(this.getSeriesFavoriteId(b)) ?? Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  }

  isMovieFilterActive() {
    return (
      !!this.generoControl.value ||
      !!this.paisControl.value ||
      !!this.anoControl.value ||
      !!this.filterCategories.genero_raw ||
      !!this.filterCategories.pais__contains ||
      !!this.filterCategories.pelicula_ano
    );
  }

  isSerieFilterActive() {
    return (
      !!this.generoControl.value ||
      !!this.paisControl.value ||
      !!this.anoControl.value ||
      !!this.filtersSeries.genero_raw ||
      !!this.filtersSeries.pais__contains ||
      !!this.filtersSeries.ano__in
    );
  }

  clearMovieFilters() {
    if (!this.isMovieFilterActive()) {
      return;
    }

    if (this.generoControl.value) {
      this.generoControl.setValue('');
    }
    if (this.paisControl.value) {
      this.paisControl.setValue('');
    }
    if (this.anoControl.value) {
      this.anoControl.setValue('');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        genre: null,
        pais: null,
        year: null,
        ano: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearSerieFilters() {
    if (!this.isSerieFilterActive()) {
      return;
    }

    if (this.generoControl.value) {
      this.generoControl.setValue('');
    }
    if (this.paisControl.value) {
      this.paisControl.setValue('');
    }
    if (this.anoControl.value) {
      this.anoControl.setValue('');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        genre: null,
        pais: null,
        year: null,
        ano: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  showAllRecentResults(type: 'movie' | 'series') {
    const media = type === 'movie' ? 'peliculas' : 'series';
    this.router.navigate(['/recientes', media]);
  }

  showAllCubaRecentResults(type: 'movie' | 'series') {
    const media = type === 'movie' ? 'peliculas' : 'series';
    this.router.navigate(['/recientes-cuba', media]);
  }

  showAllPopularMonthMovies() {
    this.router.navigate(['/populares-mes', 'peliculas']);
  }

  showAllUpdatedSeries() {
    this.router.navigate(['/series-actualizadas']);
  }

  setSeriesGenreTag(genre: string) {
    if (this.generoControl.value === genre) {
      return;
    }
    this.generoControl.setValue(genre);
    this.syncQueryParam('genre', genre || '');
  }

  isFavoriteSeriesGenre(genreId: number) {
    return this.favoriteSeriesGenres.some(genre => genre.id === genreId);
  }

  toggleFavoriteSeriesGenre(genre: Genero, event?: Event) {
    event?.stopPropagation();
    const exists = this.favoriteSeriesGenres.some(item => item.id === genre.id);
    if (exists) {
      this.favoriteSeriesGenres = this.favoriteSeriesGenres.filter(
        item => item.id !== genre.id,
      );
    } else {
      this.favoriteSeriesGenres = [...this.favoriteSeriesGenres, genre];
    }
    this.favoriteSeriesGenrePage = 0;
    this.persistFavoriteSeriesGenres();
  }

  visibleSeriesGenreTags() {
    return this.seriesGenreTags();
  }

  private seriesGenreTags() {
    // Excluir Show y Novela del carrusel y modal de géneros
    const excludedGenres = ['Show', 'Novela'];
    const genres = this.seriesGenres.filter(
      genre => !excludedGenres.includes(genre.nombre),
    );
    const selectedGenre = this.generoControl.value as string;
    const selectedNotLoaded =
      !!selectedGenre && !genres.some(genre => genre.nombre === selectedGenre);

    return [
      ...(selectedNotLoaded
        ? [{ id: 0, label: selectedGenre, value: selectedGenre }]
        : []),
      ...genres.map(genero => ({
        id: genero.id,
        label: genero.nombre,
        value: genero.nombre,
      })),
    ];
  }

  visibleFavoriteSeriesGenreTags() {
    return this.favoriteSeriesGenres;
  }

  canPrevSeriesGenrePage() {
    return this.seriesGenreStartIndex > 0;
  }

  canNextSeriesGenrePage() {
    const visibleItems = this.getSeriesGenreVisibleItems();
    return (
      this.seriesGenreStartIndex + visibleItems < this.seriesGenres.length ||
      !!this.seriesGenreNextPage
    );
  }

  prevSeriesGenrePage(carousel: any) {
    if (!this.canPrevSeriesGenrePage()) {
      return;
    }
    carousel.prev(250);
  }

  nextSeriesGenrePage(carousel: any) {
    if (!this.canNextSeriesGenrePage() || this.seriesGenreLoading) {
      return;
    }

    const visibleItems = this.getSeriesGenreVisibleItems();
    const nextStartIndex = this.seriesGenreStartIndex + 1;
    const needsRemotePage =
      nextStartIndex + visibleItems > this.seriesGenres.length;

    if (needsRemotePage && this.seriesGenreNextPage) {
      this.loadNextSeriesGenresPage(() => {
        setTimeout(() => {
          carousel.next(250);
        }, 0);
      });
      return;
    }

    carousel.next(250);
  }

  onSeriesGenreTranslated(event: any) {
    const startPosition = this.getCarouselStartPosition(event);
    this.seriesGenreStartIndex = startPosition;
    this.seriesGenrePage = Math.floor(startPosition / this.seriesGenrePageSize);
  }

  isSeriesGenreLoading() {
    return this.seriesGenreLoading;
  }

  canPrevFavoriteSeriesGenrePage() {
    return this.favoriteSeriesGenreStartIndex > 0;
  }

  canNextFavoriteSeriesGenrePage() {
    const visibleItems = this.getFavoriteGenreVisibleItems();
    return (
      this.favoriteSeriesGenreStartIndex + visibleItems <
      this.favoriteSeriesGenres.length
    );
  }

  prevFavoriteSeriesGenrePage(carousel: any) {
    if (!this.canPrevFavoriteSeriesGenrePage()) {
      return;
    }
    carousel.prev(250);
  }

  nextFavoriteSeriesGenrePage(carousel: any) {
    if (!this.canNextFavoriteSeriesGenrePage()) {
      return;
    }
    carousel.next(250);
  }

  onFavoriteSeriesGenreTranslated(event: any) {
    const startPosition = this.getCarouselStartPosition(event);
    this.favoriteSeriesGenreStartIndex = startPosition;
    this.favoriteSeriesGenrePage = Math.floor(
      startPosition / this.favoriteGenrePageSize,
    );
  }

  isFavoriteMovieGenre(genreId: number) {
    return this.favoriteMovieGenres.some(genre => genre.id === genreId);
  }

  toggleFavoriteMovieGenre(genre: Genero, event?: Event) {
    event?.stopPropagation();
    const exists = this.favoriteMovieGenres.some(item => item.id === genre.id);
    if (exists) {
      this.favoriteMovieGenres = this.favoriteMovieGenres.filter(
        item => item.id !== genre.id,
      );
    } else {
      this.favoriteMovieGenres = [...this.favoriteMovieGenres, genre];
    }
    this.favoriteMovieGenrePage = 0;
    this.persistFavoriteMovieGenres();
  }

  visibleFavoriteMovieGenreTags() {
    return this.favoriteMovieGenres;
  }

  canPrevFavoriteMovieGenrePage() {
    return this.favoriteMovieGenreStartIndex > 0;
  }

  canNextFavoriteMovieGenrePage() {
    const visibleItems = this.getFavoriteGenreVisibleItems();
    return (
      this.favoriteMovieGenreStartIndex + visibleItems <
      this.favoriteMovieGenres.length
    );
  }

  prevFavoriteMovieGenrePage(carousel: any) {
    if (!this.canPrevFavoriteMovieGenrePage()) {
      return;
    }
    carousel.prev(250);
  }

  nextFavoriteMovieGenrePage(carousel: any) {
    if (!this.canNextFavoriteMovieGenrePage()) {
      return;
    }
    carousel.next(250);
  }

  onFavoriteMovieGenreTranslated(event: any) {
    const startPosition = this.getCarouselStartPosition(event);
    this.favoriteMovieGenreStartIndex = startPosition;
    this.favoriteMovieGenrePage = Math.floor(
      startPosition / this.favoriteGenrePageSize,
    );
  }

  visibleMovieGenreTags() {
    return this.movieGenreTags();
  }

  prevMovieGenrePage(carousel: any) {
    if (!this.canPrevMovieGenrePage()) {
      return;
    }
    carousel.prev(250);
  }

  nextMovieGenrePage(carousel: any) {
    if (!this.canNextMovieGenrePage() || this.movieGenreLoading) {
      return;
    }

    const visibleItems = this.getMovieGenreVisibleItems();
    const nextStartIndex = this.movieGenreStartIndex + 1;
    const needsRemotePage =
      nextStartIndex + visibleItems > this.movieGenres.length;

    if (needsRemotePage && this.movieGenreNextPage) {
      this.loadNextMovieGenresPage(() => {
        setTimeout(() => {
          carousel.next(250);
        }, 0);
      });
      return;
    }

    carousel.next(250);
  }

  isMovieGenreLoading() {
    return this.movieGenreLoading;
  }

  onMovieGenreTranslated(event: any) {
    const startPosition = this.getCarouselStartPosition(event);
    this.movieGenreStartIndex = startPosition;
    this.movieGenrePage = Math.floor(startPosition / this.movieGenrePageSize);
  }

  canPrevMovieGenrePage() {
    return this.movieGenreStartIndex > 0;
  }

  canNextMovieGenrePage() {
    const visibleItems = this.getMovieGenreVisibleItems();
    return (
      this.movieGenreStartIndex + visibleItems < this.movieGenres.length ||
      !!this.movieGenreNextPage
    );
  }

  private getCarouselStartPosition(event: any): number {
    const raw = event?.startPosition ?? event?.item?.index ?? 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private getMovieGenreVisibleItems(): number {
    return this.getVisibleItemsByViewport(this.movieGenrePageSize);
  }

  private getSeriesGenreVisibleItems(): number {
    return this.getVisibleItemsByViewport(this.seriesGenrePageSize);
  }

  private getFavoriteGenreVisibleItems(): number {
    return this.getVisibleItemsByViewport(this.favoriteGenrePageSize);
  }

  private getVisibleItemsByViewport(desktopItems: number): number {
    if (!isPlatformBrowser(this.platformId)) {
      return desktopItems;
    }

    const width = window.innerWidth;
    if (width >= 1280) {
      return desktopItems;
    }
    if (width >= 1024) {
      return 6;
    }
    if (width >= 768) {
      return 4;
    }
    if (width >= 480) {
      return 3;
    }
    return 2;
  }

  private movieGenreTags() {
    const selectedGenre = this.generoControl.value as string;
    const selectedNotLoaded =
      !!selectedGenre &&
      !this.movieGenres.some(genre => genre.nombre === selectedGenre);

    return [
      ...(selectedNotLoaded
        ? [{ id: 0, label: selectedGenre, value: selectedGenre }]
        : []),
      ...this.movieGenres.map(genero => ({
        id: genero.id,
        label: genero.nombre,
        value: genero.nombre,
      })),
    ];
  }

  private maxMovieGenrePage() {
    return Math.max(
      Math.ceil(this.movieGenres.length / this.movieGenrePageSize) - 1,
      0,
    );
  }

  private maxFavoriteMovieGenrePage() {
    return Math.max(
      Math.ceil(this.favoriteMovieGenres.length / this.movieGenrePageSize) - 1,
      0,
    );
  }

  private maxSeriesGenrePage() {
    return Math.max(
      Math.ceil(this.seriesGenres.length / this.seriesGenrePageSize) - 1,
      0,
    );
  }

  private maxFavoriteSeriesGenrePage() {
    return Math.max(
      Math.ceil(this.favoriteSeriesGenres.length / this.seriesGenrePageSize) -
        1,
      0,
    );
  }

  private resetMovieGenresPagination() {
    this.movieGenrePage = 0;
    this.favoriteMovieGenrePage = 0;
    this.movieGenreStartIndex = 0;
    this.favoriteMovieGenreStartIndex = 0;
    this.movieGenreNextPage = 1;
    this.movieGenres = [];
    this.movieGenreLoading = false;
    this.loadFavoriteMovieGenres();
  }

  private loadNextMovieGenresPage(onSuccess?: () => void) {
    if (!this.movieGenreNextPage || this.movieGenreLoading) {
      return;
    }

    this.movieGenreLoading = true;
    this.subs.add(
      this.generoService
        .getAll({
          tipo: 'ci',
          page: this.movieGenreNextPage,
          page_size: this.movieGenreApiPageSize,
        })
        .subscribe({
          next: (response: PictaResponse<Genero>) => {
            const existingIds = new Set(
              this.movieGenres.map(genre => genre.id),
            );
            const mergedGenres = response.results.filter(
              genre => !existingIds.has(genre.id),
            );
            this.movieGenres = [...this.movieGenres, ...mergedGenres];
            this.syncFavoriteMovieGenresWithLoaded();
            this.movieGenreNextPage = this.resolveNextPage(response.next);
            onSuccess?.();
          },
          error: () => {
            this.movieGenreNextPage = null;
            this.movieGenreLoading = false;
          },
          complete: () => {
            this.movieGenreLoading = false;
          },
        }),
    );
  }

  private resolveNextPage(
    next: number | string | null | undefined,
  ): number | null {
    if (typeof next === 'number') {
      return next > 0 ? next : null;
    }
    if (typeof next === 'string' && next) {
      const numeric = Number(next);
      if (!Number.isNaN(numeric) && numeric > 0) {
        return numeric;
      }
      const pageMatch = next.match(/[?&]page=(\d+)/);
      if (pageMatch?.[1]) {
        const page = Number(pageMatch[1]);
        return Number.isNaN(page) ? null : page;
      }
    }
    return null;
  }

  private loadFavoriteMovieGenres() {
    const raw = this.localStorage.getItem(this.movieGenreFavoritesStorageKey);
    if (!raw) {
      this.favoriteMovieGenres = [];
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Genero[];
      this.favoriteMovieGenres = Array.isArray(parsed)
        ? parsed.filter(
            genre =>
              genre &&
              typeof genre.id === 'number' &&
              typeof genre.nombre === 'string',
          )
        : [];
    } catch {
      this.favoriteMovieGenres = [];
    }
  }

  private persistFavoriteMovieGenres() {
    this.localStorage.setItem(
      this.movieGenreFavoritesStorageKey,
      JSON.stringify(this.favoriteMovieGenres),
    );
  }

  private syncFavoriteMovieGenresWithLoaded() {
    if (!this.favoriteMovieGenres.length) {
      return;
    }
    const loadedMap = new Map(this.movieGenres.map(genre => [genre.id, genre]));
    this.favoriteMovieGenres = this.favoriteMovieGenres.map(
      favorite => loadedMap.get(favorite.id) ?? favorite,
    );
    this.persistFavoriteMovieGenres();
  }

  private loadFavoriteSeriesGenres() {
    const raw = this.localStorage.getItem(this.seriesGenreFavoritesStorageKey);
    if (!raw) {
      this.favoriteSeriesGenres = [];
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Genero[];
      this.favoriteSeriesGenres = Array.isArray(parsed)
        ? parsed.filter(
            genre =>
              genre &&
              typeof genre.id === 'number' &&
              typeof genre.nombre === 'string',
          )
        : [];
    } catch {
      this.favoriteSeriesGenres = [];
    }
    this.syncFavoriteSeriesGenresWithLoaded();
  }

  private persistFavoriteSeriesGenres() {
    this.localStorage.setItem(
      this.seriesGenreFavoritesStorageKey,
      JSON.stringify(this.favoriteSeriesGenres),
    );
  }

  private syncFavoriteSeriesGenresWithLoaded() {
    if (!this.favoriteSeriesGenres.length) {
      return;
    }
    const loadedMap = new Map(
      this.seriesGenres.map(genre => [genre.id, genre]),
    );
    this.favoriteSeriesGenres = this.favoriteSeriesGenres.map(
      favorite => loadedMap.get(favorite.id) ?? favorite,
    );
    this.persistFavoriteSeriesGenres();
  }

  private resetSeriesGenresPagination() {
    this.seriesGenrePage = 0;
    this.favoriteSeriesGenrePage = 0;
    this.seriesGenreStartIndex = 0;
    this.favoriteSeriesGenreStartIndex = 0;
    this.seriesGenreNextPage = 1;
    this.seriesGenres = [];
    this.seriesGenreLoading = false;
    this.loadFavoriteSeriesGenres();
  }

  private loadNextSeriesGenresPage(onSuccess?: () => void) {
    if (!this.seriesGenreNextPage || this.seriesGenreLoading) {
      return;
    }

    this.seriesGenreLoading = true;
    this.subs.add(
      this.generoService
        .getAll({
          tipo: 'ci',
          page: this.seriesGenreNextPage,
          page_size: this.seriesGenreApiPageSize,
        })
        .subscribe({
          next: (response: PictaResponse<Genero>) => {
            const existingIds = new Set(
              this.seriesGenres.map(genre => genre.id),
            );
            const mergedGenres = response.results.filter(
              genre => !existingIds.has(genre.id),
            );
            this.seriesGenres = [...this.seriesGenres, ...mergedGenres];
            this.syncFavoriteSeriesGenresWithLoaded();
            this.seriesGenreNextPage = this.resolveNextPage(response.next);
            onSuccess?.();
          },
          error: () => {
            this.seriesGenreNextPage = null;
            this.seriesGenreLoading = false;
          },
          complete: () => {
            this.seriesGenreLoading = false;
          },
        }),
    );
  }

  private initSearchForm() {
    if (this.categoria === 'Serie') {
      this.filterSubs.add(
        this.generoControl.valueChanges
          .pipe(
            tap(genero => {
              this.syncQueryParam('genre', genero || '');
              if (genero) {
                this.filtersSeries.genero_raw = genero;
                this.filtersSeries.page = 1;
                this.filtersSeries.next = 1;
              } else {
                delete this.filtersSeries.genero_raw;
              }
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.paisControl.valueChanges
          .pipe(
            tap(pais => {
              this.syncQueryParam('pais', pais || '');
              if (pais) {
                this.filtersSeries.pais__contains = pais;
                this.filtersSeries.page = 1;
                this.filtersSeries.next = 1;
              } else {
                delete this.filtersSeries.pais__contains;
              }
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.anoControl.valueChanges
          .pipe(
            tap(ano => {
              this.syncQueryParam('year', ano || '');
              if (ano) {
                this.filtersSeries.ano__in = ano;
              } else {
                delete this.filtersSeries.ano__in;
              }
              this.filtersSeries.page = 1;
              this.filtersSeries.next = 1;
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.searchControl.valueChanges
          .pipe(
            debounceTime(1000),
            map(query => (query ? '*' + query + '*' : '')),
            tap(query => {
              this.resultsLoading = true;
              if (query) {
                this.filtersSeries = {
                  ...this.filtersSeries,
                  nombre__contains: query,
                };
                this.filtersSeries.nombre__contains = query;
              } else {
                delete this.filtersSeries.nombre__contains;
              }
              this.filtersSeries.page = 1;
              this.filtersSeries.next = 1;
            }),
            distinctUntilChanged(),
            switchMap(query =>
              query ? this.loadSeries.getAll(this.filtersSeries) : of(null),
            ),
          )
          .subscribe((response: PictaResponse<Serie>) => {
            if (response) {
              this.filteredSeries = response.results;
              const nextPage = this.resolveNextPage(response.next);
              this.filtersSeries.page = nextPage ?? 1;
              this.filtersSeries.next = nextPage ?? 0;
            } else {
              this.filteredSeries = this.series;
              this.filtersSeries.page = 1;
              this.filtersSeries.next = 1;
            }
            this.resultsLoading = false;
          }),
      );
    } else {
      this.filterSubs.add(
        this.generoCategorieControl.valueChanges
          .pipe(
            tap(genero => {
              if (genero) {
                this.filterCategories.genero_raw = genero;
              } else {
                delete this.filterCategories.genero_raw;
              }
              this.filterCategories.page = 1;
              this.filterCategories.next = 1;
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.generoControl.valueChanges
          .pipe(
            tap(genero => {
              if (genero) {
                this.filterCategories.genero_raw = genero;
              } else {
                delete this.filterCategories.genero_raw;
              }
              this.filterCategories.page = 1;
              this.filterCategories.next = 1;
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.paisControl.valueChanges
          .pipe(
            tap(pais => {
              this.syncQueryParam('pais', pais || '');
              if (pais) {
                this.filterCategories.pais__contains = pais;
              } else {
                delete this.filterCategories.pais__contains;
              }
              this.filterCategories.page = 1;
              this.filterCategories.next = 1;
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.anoControl.valueChanges
          .pipe(
            tap(ano => {
              this.syncQueryParam('year', ano || '');
              if (ano) {
                this.filterCategories.pelicula_ano = ano;
              } else {
                delete this.filterCategories.pelicula_ano;
              }
              this.filterCategories.page = 1;
              this.filterCategories.next = 1;
            }),
          )
          .subscribe(),
      );

      this.filterSubs.add(
        this.searchControl.valueChanges
          .pipe(
            debounceTime(1000),
            map(query => (query ? '*' + query + '*' : '')),
            tap(query => {
              this.resultsLoading = true;
              if (query) {
                this.filterCategories = {
                  ...this.filterCategories,
                  nombre__contains: query,
                };
              } else {
                delete this.filterCategories.nombre__contains;
              }
              this.filterCategories.page = 1;
              this.filterCategories.next = 1;
            }),
            distinctUntilChanged(),
            switchMap(query =>
              this.loadPublicaciones.getPublications(this.filterCategories),
            ),
          )
          .subscribe((response: PictaResponse<Publication>) => {
            if (response) {
              this.filteredVideos = response.results;
              const nextPage = this.resolveNextPage(response.next);
              this.filterCategories.page = nextPage ?? 1;
              this.filterCategories.next = nextPage;
            } else {
              this.filteredVideos = this.videos;
              this.filterCategories.page = 1;
              this.filterCategories.next = 1;
            }
            this.resultsLoading = false;
          }),
      );
    }
  }

  private listenQueryParams() {
    this.filterSubs.add(
      this.route.queryParamMap.subscribe(queryParams => {
        const signature = this.buildQuerySignature(queryParams);
        if (signature === this.lastAppliedQuerySignature) {
          return;
        }

        this.hydrateFiltersFromQueryParams(queryParams);
        this.lastAppliedQuerySignature = signature;
        this.applyActiveUrlFilters();
      }),
    );
  }

  private hydrateFiltersFromQueryParams(
    queryParams: import('@angular/router').ParamMap,
  ) {
    const genre = queryParams.get('genre') || '';
    const pais = queryParams.get('pais') || '';
    const year = queryParams.get('year') || queryParams.get('ano') || '';

    if (this.categoria === 'Serie') {
      this.generoControl.setValue(genre, { emitEvent: false });
      this.paisControl.setValue(pais, { emitEvent: false });
      this.anoControl.setValue(year, { emitEvent: false });
      return;
    }

    if (this.categoria === 'Película') {
      this.generoControl.setValue(genre, { emitEvent: false });
      this.paisControl.setValue(pais, { emitEvent: false });
      this.anoControl.setValue(year, { emitEvent: false });
    }
  }

  private applyHydratedFiltersToState() {
    const genero = this.generoControl.value || '';
    const pais = this.paisControl.value || '';
    const ano = this.anoControl.value || '';

    if (this.categoria === 'Serie') {
      if (genero) {
        this.filtersSeries.genero_raw = genero;
      } else {
        delete this.filtersSeries.genero_raw;
      }

      if (pais) {
        this.filtersSeries.pais__contains = pais;
      } else {
        delete this.filtersSeries.pais__contains;
      }

      if (ano) {
        this.filtersSeries.ano__in = ano;
      } else {
        delete this.filtersSeries.ano__in;
      }

      this.filtersSeries.page = 1;
      this.filtersSeries.next = 1;
      return;
    }

    if (genero) {
      this.filterCategories.genero_raw = genero;
    } else {
      delete this.filterCategories.genero_raw;
    }

    if (pais) {
      this.filterCategories.pais__contains = pais;
    } else {
      delete this.filterCategories.pais__contains;
    }

    if (ano) {
      this.filterCategories.pelicula_ano = ano;
    } else {
      delete this.filterCategories.pelicula_ano;
    }

    this.filterCategories.page = 1;
    this.filterCategories.next = 1;
  }

  private buildQuerySignature(queryParams: import('@angular/router').ParamMap) {
    const genre = queryParams.get('genre') || '';
    const pais = queryParams.get('pais') || '';
    const year = queryParams.get('year') || queryParams.get('ano') || '';
    return [this.categoria, genre, pais, year].join('|');
  }

  private applyActiveUrlFilters() {
    if (this.categoria === 'Serie') {
      const genero = this.generoControl.value || '';
      const pais = this.paisControl.value || '';
      const ano = this.anoControl.value || '';

      if (genero) {
        this.filtersSeries.genero_raw = genero;
      } else {
        delete this.filtersSeries.genero_raw;
      }

      if (pais) {
        this.filtersSeries.pais__contains = pais;
      } else {
        delete this.filtersSeries.pais__contains;
      }

      if (ano) {
        this.filtersSeries.ano__in = ano;
      } else {
        delete this.filtersSeries.ano__in;
      }

      const hasActiveFilters = !!genero || !!pais || !!ano;
      this.filtersSeries.page = 1;
      this.filtersSeries.next = 1;

      if (!hasActiveFilters) {
        this.filteredSeries = this.series;
        return;
      }

      this.resultsLoading = true;
      this.filterSubs.add(
        this.loadSeries.getAll(this.filtersSeries).subscribe({
          next: (response: PictaResponse<Serie>) => {
            this.filteredSeries = response.results;
            const nextPage = this.resolveNextPage(response.next);
            this.filtersSeries.page = nextPage ?? 1;
            this.filtersSeries.next = nextPage ?? 0;
            this.resultsLoading = false;
          },
          error: () => {
            this.resultsLoading = false;
          },
        }),
      );
      return;
    }

    const genero = this.generoControl.value || '';
    const pais = this.paisControl.value || '';
    const ano = this.anoControl.value || '';

    if (genero) {
      this.filterCategories.genero_raw = genero;
    } else {
      delete this.filterCategories.genero_raw;
    }

    if (pais) {
      this.filterCategories.pais__contains = pais;
    } else {
      delete this.filterCategories.pais__contains;
    }

    if (ano) {
      this.filterCategories.pelicula_ano = ano;
    } else {
      delete this.filterCategories.pelicula_ano;
    }

    const hasActiveFilters = !!genero || !!pais || !!ano;
    this.filterCategories.page = 1;
    this.filterCategories.next = 1;

    if (!hasActiveFilters) {
      this.filteredVideos = this.videos;
      return;
    }

    this.resultsLoading = true;
    this.filterSubs.add(
      this.loadPublicaciones.getPublications(this.filterCategories).subscribe({
        next: (response: PictaResponse<Publication>) => {
          this.filteredVideos = response.results;
          const nextPage = this.resolveNextPage(response.next);
          this.filterCategories.page = nextPage ?? 1;
          this.filterCategories.next = nextPage;
          this.resultsLoading = false;
        },
        error: () => {
          this.resultsLoading = false;
        },
      }),
    );
  }

  private syncQueryParam(param: string, value: string) {
    const currentValue = this.route.snapshot.queryParamMap.get(param) || '';
    if (currentValue === value) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [param]: value || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private resetControls() {
    this.searchControl.setValue('', { emitEvent: false });
    this.generoControl.setValue('', { emitEvent: false });
    this.paisControl.setValue('', { emitEvent: false });
    this.anoControl.setValue('', { emitEvent: false });
    this.generoCategorieControl.setValue('', { emitEvent: false });
    delete this.filtersSeries.nombre__contains;
    delete this.filtersSeries.pais__contains;
    delete this.filtersSeries.ano__in;
    delete this.filterCategories.nombre;
    delete this.filterCategories.pais__contains;
    delete this.filterCategories.pelicula_ano;
  }

  private listenViewModeControl() {
    const savedValue = JSON.parse(this.localStorage.getItem('viewMode'));
    if (savedValue) {
      this.viewModeControl.setValue(savedValue);
    }
    this.viewModeControl.valueChanges.subscribe(value => {
      this.localStorage.setItem('viewMode', JSON.stringify(value));
    });
  }
}
