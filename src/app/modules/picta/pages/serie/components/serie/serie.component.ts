import {
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  StateKey,
  input,
  viewChild,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { SerieService } from '../../../categoria/services/serie.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TemporadaService } from '../../../categoria/services/temporada.service';
import { PublicationService } from '../../../medias/services/publication-service';
import { GeneroService } from '../../services/genero.service';
import { PersonasService } from '../../services/personas.service';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
} from 'rxjs';
import { PositionServiceService } from '../../../categoria/services/position-service.service';
import { Subscription } from 'rxjs';
import {
  Genero,
  Persona,
  Publication,
  Serie,
  Temporada,
} from '../../../medias/models/publicacion.model';
import { PictaResponse } from '../../../../models/response.picta.model';
import {
  isPlatformBrowser,
  NgIf,
  NgFor,
  AsyncPipe,
  NgOptimizedImage,
} from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ListaReproduccionCanalService } from '../../../medias/services/lista-reproduccion-canal.service';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { MatAnchor } from '@angular/material/button';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { NotFoundComponent } from '../../../notfound/components/not-found/not-found.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { EmbedComponent } from '../../../../../embed/components/embed/embed.component';
import { MyCarouseloComponent } from '../../../common-components/components/my-carousel-o/my-carouselo.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import { RepartoExplorerDialogComponent, RepartoActor } from '../../../movie/components/reparto-explorer-dialog/reparto-explorer-dialog.component';
import { DescripcionDialogComponent } from '../../../movie/components/descripcion-dialog/descripcion-dialog.component';

@Component({
  selector: 'app-serie',
  templateUrl: './serie.component.html',
  styleUrls: [
    '../../../movie/components/movie/movie.component.scss',
    './serie.component.scss'
  ],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    MatIcon,
    RouterLink,
    MatAnchor,
    MatButton,
    NgOptimizedImage,
    MatFormField,
    MatSelect,
    MatOption,
    NotFoundComponent,
    MatProgressSpinner,
    AsyncPipe,
    MatChipsModule,
    MyCarouseloComponent,
    CarouselModule,
  ],
})
export class SerieComponent implements OnInit, OnDestroy {
  private readonly favoriteSeriesStorageKey = 'picta.seriesFavorites';
  private readonly favoriteAnimesStorageKey = 'picta.animesFavorites';
  private readonly favoriteDoramasStorageKey = 'picta.doramasFavorites';
  private serieService = inject(SerieService);
  private dialog = inject(MatDialog);
  private temporadaService = inject(TemporadaService);
  private publicationService = inject(PublicationService);
  private listaReproduccionCanalService = inject(ListaReproduccionCanalService);
  private generoService = inject(GeneroService);
  private personasService = inject(PersonasService);
  private positionService = inject(PositionServiceService);
  private renderer = inject(Renderer2);
  private title = inject(Title);
  private meta = inject(Meta);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private localStorage = inject(LocalstorageService);

  readonly serieNombre = input.required<string>();

  seriesRecomendadas: Serie[];
  serie$: Observable<any>;
  temporadas: Temporada[] = [];
  trailersTemporada: any = null;
  trailerEpisodes: any[] = [];
  generos: Genero[];
  personas: Persona[];
  generoNombre: string = ''; // Puede ser 'Show', 'Novela' o vacío
  description = '';

  // Getter para obtener temporadas sin la de Trailer
  get filteredTemporadas(): Temporada[] {
    return this.temporadas.filter(t => t.nombre?.toLowerCase() !== 'trailer');
  }
  subtitle = false;
  hd = false;
  clasificacion = '';
  resolucion: string = '';
  first: any;
  trailers: any;

  loading = true;
  numbers = [1, 2, 3, 4, 5];

  // Trailer carousel
  readonly trailerOption: OwlOptions = {
    loop: false,
    rewind: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    autoHeight: true,
    autoWidth: true,
    margin: 16,
    slideBy: 1,
    stagePadding: 0,
    responsive: {
      0: { items: 2 },
      400: { items: 3 },
      600: { items: 4 },
      768: { items: 5 },
      992: { items: 5 },
    },
    nav: true,
    navText: [
      '<span class="owl-nav-prev"><mat-icon>chevron_left</mat-icon></span>',
      '<span class="owl-nav-next"><mat-icon>chevron_right</mat-icon></span>'
    ]
  };

  // Reparto carousel
  readonly repartoOption: OwlOptions = {
    loop: false,
    rewind: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    autoHeight: false,
    autoWidth: true,
    margin: 5,
    slideBy: 1,
    responsive: {
      0: { items: 2 },
      400: { items: 3 },
      600: { items: 4 },
      768: { items: 5 },
      1024: { items: 6 },
    },
  };

  readonly repartoCar = viewChild<any>('repartoCar');
  private repartoStartPosition = 0;
  private currentSerie: any = null;

  coords: { x: number; y: number };
  readonly heroImg = viewChild<ElementRef>('heroImg');
  innerWidth: number;
  innerHeigth: number;
  resizeObs: Subscription;
  seasonsKey: StateKey<any>;
  defaultTemp: number;
  defaultCapi: Publication[] = [];
  episodesNextPage: number | null = null;
  episodesLoading = false;
  episodesLoadingMore = false;
  private readonly episodesPageSize = 20;

  loadingTemp = false;
  trailerURL: any;
  recomendados$: Observable<any>;
  recomendadosLoading = true;
  favoriteSerieIds = new Set<number>();

  onSelectEvent(value: any) {
    if (!value) {
      return;
    }

    const tempId = Number(value);
    this.defaultTemp = tempId;
    this.defaultCapi = [];
    this.episodesNextPage = 1;

    // Resetear metadatos de la temporada anterior
    this.first = null;
    this.subtitle = false;
    this.hd = false;
    this.trailerURL = null;

    // Cargar episodios (los metadatos se extraen del primer video en loadEpisodesPage)
    this.loadEpisodesPage(true);
  }

  loadMoreEpisodes() {
    if (
      this.episodesLoading ||
      this.episodesLoadingMore ||
      this.episodesNextPage === null
    ) {
      return;
    }

    this.loadEpisodesPage(false);
  }

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth + 200;
      this.innerHeigth = window.innerHeight;
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      //this.resizeObs.unsubscribe();
    }
  }

  ngOnInit() {
    this.loadFavoriteSerieIds();

    this.route.paramMap
      .pipe(
        map(params => params.get('serieNombre') ?? this.serieNombre()),
        filter((serieNombre): serieNombre is string => !!serieNombre),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(serieNombre => {
        this.loadSerieData(serieNombre);
      });

    this.loadGeneros();
    // this.loadPersonas();
  }

  isFavoriteSerie(serieId?: number | null): boolean {
    if (!serieId) {
      return false;
    }

    return this.favoriteSerieIds.has(serieId);
  }

  toggleFavoriteSerie(serie: Serie, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const serieId = Number(serie?.pelser_id);
    if (!Number.isFinite(serieId) || serieId <= 0) {
      return;
    }

    // Detect genre from the serie object
    const storageKey = this.getFavoriteStorageKeyForSerie(serie);

    // Actualizar el Set local
    if (this.favoriteSerieIds.has(serieId)) {
      this.favoriteSerieIds.delete(serieId);
    } else {
      this.favoriteSerieIds.add(serieId);
    }

    // Guardar solo en el storage correcto (animes O series, NO ambos)
    this.persistFavoriteSerieId(storageKey, serieId, this.favoriteSerieIds.has(serieId));
  }

  private getFavoriteStorageKeyForSerie(serie: Serie): string {
    const generos = serie?.genero || [];
    const isAnime = generos.some((g: any) => g.nombre === 'Anime');
    const isDorama = generos.some((g: any) => g.nombre === 'Dorama');
    if (isAnime) {
      return this.favoriteAnimesStorageKey;
    }
    if (isDorama) {
      return this.favoriteDoramasStorageKey;
    }
    return this.favoriteSeriesStorageKey;
  }

  private loadSerieData(serieNombre: string) {
    this.loading = true;
    this.temporadas = [];
    this.defaultCapi = [];
    this.episodesNextPage = null;
    this.description = '';
    this.subtitle = false;
    this.hd = false;
    this.first = undefined;
    this.trailerURL = undefined;
    this.currentSerie = null;
    this.repartoStartPosition = 0;

    this.serie$ = this.serieService.loadSerie(serieNombre).pipe(
      map(response => {
        if (response && response.results && response.results.length > 0) {
          const serieData = response.results[0];
          // Guardar el nombre del género para determinar la ruta de redirección
          const generos = serieData.genero || [];
          const hasShow = generos.some((g: any) => g.nombre === 'Show');
          const hasNovela = generos.some((g: any) => g.nombre === 'Novela');
          const hasAnime = generos.some((g: any) => g.nombre === 'Anime');
          const hasDorama = generos.some((g: any) => g.nombre === 'Dorama');
          if (hasShow) {
            this.generoNombre = 'Show';
          } else if (hasNovela) {
            this.generoNombre = 'Novela';
          } else if (hasAnime) {
            this.generoNombre = 'Anime';
          } else if (hasDorama) {
            this.generoNombre = 'Dorama';
          } else {
            this.generoNombre = '';
          }
          this.loadSeasons(serieData.pelser_id, serieData.sinopsis);
          this.loadRecomendaciones(serieData.pelser_id);
          this.currentSerie = serieData; // Guardar para uso local
          this.clasificacion = serieData.clasificacion || '';
          return serieData; // Retorna la serie si existe
        } else {
          throw new Error('No se encontraron resultados'); // Lanza un error si no hay resultados
        }
      }),
      catchError(error => {
        this.loading = false; // Desactiva el loading si hay un error
        console.error('Error al cargar la película:', error);
        return of(null); // Retorna un observable con valor null para manejar el error
      }),
      finalize(() => {
        this.loading = false; // Desactiva el loading cuando la solicitud finaliza
      }),
    );
  }

  private loadFavoriteSerieIds(): void {
    // Load from ALL storages (series + animes + doramas) to check favorites from any
    const rawSeries = this.localStorage.getItem(this.favoriteSeriesStorageKey);
    const rawAnimes = this.localStorage.getItem(this.favoriteAnimesStorageKey);
    const rawDoramas = this.localStorage.getItem(this.favoriteDoramasStorageKey);

    const parseIds = (raw: string | null): number[] => {
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw) as Array<number | string>;
        return Array.isArray(parsed)
          ? parsed
              .map(id => Number(id))
              .filter(id => Number.isFinite(id) && id > 0)
          : [];
      } catch {
        return [];
      }
    };

    const seriesIds = parseIds(rawSeries);
    const animeIds = parseIds(rawAnimes);
    const doramaIds = parseIds(rawDoramas);

    const allIds = new Set<number>([...seriesIds, ...animeIds, ...doramaIds]);
    this.favoriteSerieIds = allIds;
  }

  private persistFavoriteSerieId(storageKey: string, serieId: number, isFavorite: boolean): void {
    // Leer solo el storage específico
    const raw = this.localStorage.getItem(storageKey);
    const currentIds = raw 
      ? (JSON.parse(raw) as (number | string)[]).map(id => Number(id)).filter(id => Number.isFinite(id))
      : [];
    const currentSet = new Set<number>(currentIds);
    
    // Agregar o quitar solo el ID específico
    if (isFavorite) {
      currentSet.add(serieId);
    } else {
      currentSet.delete(serieId);
    }
    
    this.localStorage.setItem(
      storageKey,
      JSON.stringify(Array.from(currentSet)),
    );
  }

  getGenero(id: number) {
    return this.generos.find(g => g.id === id).nombre;
  }

  // Determina la ruta de categoría según el tipo de serie
  getCategoryRoute(): string {
    switch (this.generoNombre) {
      case 'Show':
        return '/shows';
      case 'Novela':
        return '/novelas';
      case 'Anime':
        return '/animes';
      case 'Dorama':
        return '/doramas';
      default:
        return '/categoria/Serie';
    }
  }

  getPersona(id: number) {
    return this.personas.find(g => g.id === id).nombre;
  }

  openTrailer() {
    let videoWidth = this.innerWidth;
    if (videoWidth > 800) {
      videoWidth = this.innerWidth / 2;
    }
    const dialogRef = this.dialog.open(EmbedComponent, {
      width: `${Math.round(videoWidth)}px`,
      maxWidth: '96vw',
      panelClass: 'picta-trailer-dialog',
      backdropClass: 'picta-trailer-backdrop',
      autoFocus: false,
      enterAnimationDuration: '100ms',
      exitAnimationDuration: '100ms',
      data: {
        video: this.trailerURL,
      },
    });
  }

  playVideo(trailer: any) {
    let videoWidth = this.innerWidth;
    if (videoWidth > 800) {
      videoWidth = this.innerWidth / 2;
    }
    const dialogRef = this.dialog.open(EmbedComponent, {
      width: `${Math.round(videoWidth)}px`,
      maxWidth: '96vw',
      panelClass: 'picta-trailer-dialog',
      backdropClass: 'picta-trailer-backdrop',
      autoFocus: false,
      enterAnimationDuration: '100ms',
      exitAnimationDuration: '100ms',
      data: {
        video: trailer.slug_url,
      },
    });
  }

  goBack() {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    }
  }

  private loadSeasons(pelser_id: string, sinopsis?: string) {
    this.temporadaService
      .getAll({ serie_pelser_id: pelser_id, ordering: 'fecha_creacion' })
      .subscribe((response: PictaResponse<any>) => {
        this.temporadas = response.results;
        
        // Buscar temporada de Trailer (numero === 0)
        console.log('[Serie] Temporadas cargadas:', this.temporadas.length);
        this.trailersTemporada = this.temporadas.find(
          (t: any) => t.numero === '0' || t.numero === 0
        );
        console.log('[Serie] Temporada Trailer encontrada:', this.trailersTemporada);
        
        if (!this.temporadas.length) {
          return;
        }

        this.defaultTemp = this.temporadas[0].id;

        // Si existe la temporada de Trailer, cargar sus episodios
        if (this.trailersTemporada) {
          this.loadTrailerEpisodes(this.trailersTemporada.id);
        }

        // Usar la sinopsis directamente de la serie si está disponible
        if (sinopsis) {
          this.description = sinopsis;
          this.meta.updateTag({
            name: 'description',
            content: this.description,
          });
        }

        // Cargar episodios de la primera temporada (ya incluye metadatos del primer video)
        this.onSelectEvent(this.defaultTemp);
      });
  }

  private loadTrailerEpisodes(temporadaId: number) {
    console.log('[Serie] Cargando trailers para temporada:', temporadaId);
    this.publicationService.getPublications({ temporada_id: temporadaId, page: 1, page_size: 10 }).subscribe({
      next: (response: PictaResponse<any>) => {
        console.log('[Serie] Trailer episodes response:', response);
        this.trailerEpisodes = response.results || [];
        console.log('[Serie] Trailer episodes cargados:', this.trailerEpisodes.length);
      },
      error: () => {
        this.trailerEpisodes = [];
      }
    });
  }

  private loadEpisodesPage(reset = false) {
    if (!this.defaultTemp || this.episodesNextPage === null) {
      return;
    }

    const page = reset ? 1 : this.episodesNextPage;
    if (page === null) {
      return;
    }

    if (reset) {
      this.episodesLoading = true;
    } else {
      this.episodesLoadingMore = true;
    }

    this.publicationService
      .getPublications({
        temporada_id: this.defaultTemp,
        ordering: 'fecha_publicado',
        page,
        page_size: this.episodesPageSize,
      })
      .pipe(
        finalize(() => {
          this.episodesLoading = false;
          this.episodesLoadingMore = false;
        }),
      )
      .subscribe((response: PictaResponse<Publication>) => {
        const nextResults = response?.results ?? [];
        this.defaultCapi = reset
          ? nextResults
          : [...this.defaultCapi, ...nextResults];
        this.episodesNextPage = response?.next ?? null;

        // Extraer metadatos del primer video solo en reset (y si hay resultados)
        if (reset && nextResults.length > 0) {
          const firstVideo = nextResults[0];
          const temporada = this.temporadas.find(
            t => t.id === this.defaultTemp,
          );

          if (temporada?.nombre === 'Trailer') {
            this.trailerURL = firstVideo.slug_url;
          }
          this.first = firstVideo;
          // Solo usar la descripción si no tenemos sinopsis de la serie
          if (!this.description && firstVideo.descripcion) {
            this.description = firstVideo.descripcion;
            this.meta.updateTag({
              name: 'description',
              content: this.description,
            });
          }
          if (firstVideo.url_subtitulo) {
            this.subtitle = true;
          }
          if (firstVideo.hd) {
            this.hd = true;
          }
          // Parsear resolucion desde descarga
          if (firstVideo.descarga) {
            try {
              const descarga = JSON.parse(firstVideo.descarga);
              if (descarga.pro) {
                this.resolucion = '1080p';
              } else if (descarga.high) {
                this.resolucion = '720p';
              }
            } catch (e) {
              // ignore
            }
          }
        }
      });
  }

  private loadGeneros() {
    this.generoService.getAll({}).subscribe((res: PictaResponse<Genero>) => {
      this.generos = res.results;
    });
  }

  private loadPersonas() {
    this.personasService
      .getAll({ page_size: 100000 })
      .subscribe((res: PictaResponse<Persona>) => {
        this.personas = res.results;
      });
  }

  private loadRecomendaciones(pelser_id: string) {
    this.recomendadosLoading = true;
    const recomendados$ = this.listaReproduccionCanalService
      .getSeriesRecomendadas(pelser_id)
      .pipe(
        map(response => {
          return (response.results || []).map((item: any) => ({
            ...item,
            // In similar titles we need to show the opposite image field.
            url_imagen: item?.imagen_secundaria || item?.url_imagen,
          }));
        }),
        catchError(error => {
          console.error(
            'Error al cargar títulos similares de la serie:',
            error,
          );
          return of([]);
        }),
        finalize(() => {
          this.recomendadosLoading = false;
        }),
        shareReplay(1),
      );

    this.recomendados$ = recomendados$;
    recomendados$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  // Reparto carousel navigation
  onRepartoInitialized(data: any): void {
    this.repartoStartPosition = Number(data?.startPosition ?? 0);
  }

  onRepartoTranslated(data: any): void {
    this.repartoStartPosition = Number(data?.startPosition ?? 0);
  }

  navigatePrevReparto(): void {
    if (this.prevRepartoDisabled()) return;
    this.repartoCar()?.prev(250);
  }

  navigateNextReparto(): void {
    if (this.nextRepartoDisabled()) return;
    this.repartoCar()?.next(250);
  }

  prevRepartoDisabled(): boolean {
    return this.repartoStartPosition <= 0;
  }

  nextRepartoDisabled(): boolean {
    const reparto = this.currentSerie?.reparto;
    const totalItems = reparto?.length ?? 0;
    if (!totalItems) return true;
    return this.repartoStartPosition >= totalItems - 1;
  }

  openRepartoExplorer(): void {
    const reparto = this.currentSerie?.reparto;
    if (!reparto || !reparto.length) return;

    const actores: RepartoActor[] = reparto.map((actor: any) => ({
      id: actor.id,
      nombre: actor.nombre,
      imagen: actor.imagen,
      url_avatar: actor.url_avatar,
      slug: actor.slug_url || actor.slug,
    }));

    this.dialog.open(RepartoExplorerDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '85vh',
      panelClass: ['picta-dark-dialog', 'picta-reparto-dialog'],
      backdropClass: 'picta-reparto-backdrop',
      data: {
        title: 'Reparto',
        actores: actores,
      },
    });
  }

  openDescripcionDialog(): void {
    if (!this.description) return;

    this.dialog.open(DescripcionDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      maxHeight: '85vh',
      panelClass: ['picta-dark-dialog', 'picta-reparto-dialog'],
      backdropClass: 'picta-descripcion-backdrop',
      data: {
        titulo: this.currentSerie?.nombre,
        descripcion: this.description
      }
    });
  }

  getClasificacionDisplay(clasificacion: string): string {
    if (!clasificacion) return '';
    const cl = clasificacion.toUpperCase().replace(/\s/g, '');
    if (cl === 'ATP') return 'A';
    return clasificacion;
  }

  getClasificacionClase(clasificacion: string): string {
    if (!clasificacion) return 'default';
    
    const cl = clasificacion.toUpperCase().replace(/\s/g, '');
    
    if (cl === 'ATP') return 'atp';
    if (cl === '7+' || cl === '7MAS') return 'siete';
    if (cl === '13+' || cl === '13MAS') return 'trece';
    if (cl === '16+' || cl === '16MAS') return 'diesciseis';
    if (cl === '18+' || cl === '18MAS') return 'diesciocho';
    
    return 'default';
  }

  getActorSlug(actor: any): string[] {
    const slug = actor.slug_url || actor.slug;
    if (slug) {
      return ['/actor', slug];
    }
    if (actor.nombre) {
      return ['/actor', actor.nombre];
    }
    return [];
  }

  hasActorSlug(actor: any): boolean {
    return !!actor.nombre;
  }

  get actoresPrincipales(): any[] {
    const reparto = this.currentSerie?.reparto;
    const count = this.isMobile ? 2 : 3;
    return Array.isArray(reparto) ? reparto.slice(0, count) : [];
  }

  get totalActores(): number {
    const reparto = this.currentSerie?.reparto;
    return Array.isArray(reparto) ? reparto.length : 0;
  }

  get isMobile(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < 600;
    }
    return this.innerWidth < 600;
  }

  get mostrarMasActores(): boolean {
    return this.totalActores > (this.isMobile ? 2 : 3);
  }

  getDirectorSlug(director: any): string[] {
    const slug = director.slug_url || director.slug;
    if (slug) {
      return ['/director', slug];
    }
    if (director.nombre) {
      return ['/director', director.nombre];
    }
    return [];
  }
}
