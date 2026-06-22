import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, effect, inject, OnInit, OnDestroy, PLATFORM_ID, Renderer2, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { Observable, of, fromEvent, Subscription } from 'rxjs';
import { DownloadPopupComponent } from '../../../../components/download-popup/download-popup.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthService } from '../../../../../../services/auth.service';
import { ListaReproduccionCanalService } from '../../../medias/services/lista-reproduccion-canal.service';
import { PositionServiceService } from '../../../categoria/services/position-service.service';
import { Publication } from '../../../medias/models/publicacion.model';
import { isPlatformBrowser, AsyncPipe, NgOptimizedImage, NgClass } from '@angular/common';
import { EmbedComponent } from '../../../../../embed/components/embed/embed.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { PayItemComponent } from '../../../common-components/components/pay-item/pay-item.component';
import { PaymentService } from '../../../profile/services/payment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublicationService } from '../../../medias/services/publication-service';
import { MatAnchor } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NotFoundComponent } from '../../../notfound/components/not-found/not-found.component';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatomoTracker } from 'ngx-matomo-client';
import { MyCarouseloComponent } from '../../../common-components/components/my-carousel-o/my-carouselo.component';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { favoriteHeartAnimation } from '../../../../animations/favorites';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import { RepartoExplorerDialogComponent, RepartoActor } from '../reparto-explorer-dialog/reparto-explorer-dialog.component';
import { DescripcionDialogComponent } from '../descripcion-dialog/descripcion-dialog.component';

@Component({
    selector: 'app-movie',
    templateUrl: 'movie.component.html',
    styleUrls: ['movie.component.scss'],
  animations: [favoriteHeartAnimation],
    imports: [
    MatButton,
    MatTooltip,
    MatIconModule,
    MatChipsModule,
    RouterLink,
    MatAnchor,
    NotFoundComponent,
    AsyncPipe,
    NgOptimizedImage,
    NgClass,
    MyCarouseloComponent,
    CarouselModule,
    MatDialogModule
],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent implements OnInit, OnDestroy {
  private readonly favoriteMoviesStorageKey = 'picta.movieFavorites';
  private breakpointObserver = inject(BreakpointObserver);
  private bottomSheet = inject(MatBottomSheet);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private listaReproduccionCanalService = inject(ListaReproduccionCanalService);
  authService = inject(AuthService);
  private positionService = inject(PositionServiceService);
  private renderer = inject(Renderer2);
  private meta = inject(Meta);
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private matomo = inject(MatomoTracker);
  private localStorage = inject(LocalstorageService);

  // Signal reactivo para detectar viewport móvil
  private readonly isMobileBreakpoint = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(state => state.matches)
    ),
    { initialValue: false }
  );

  loading = true;
  numbers = [1, 2, 3, 4, 5];
  private cdr = inject(ChangeDetectorRef);
  private publicacionService = inject(PublicationService);
  readonly slug_url = input.required<string>();

  get isMobile(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < 600;
    }
    return this.innerWidth < 600;
  } 

  movie: Publication;
  trailerURL: any;
  subtitle = false;
  hd = false;
  resolucion: string = '';
  descripcionExpandida = false;

  videosRecomendados: Publication[];
  loggedIn: boolean;
  readonly heroImg = viewChild<ElementRef>('heroImg');
  readonly repartoCar = viewChild<any>('repartoCar');
  coords: { x: number; y: number };
  innerWidth: number;
  innerHeigth: number;
  resizeObs: Subscription;
  film: any = null;
  notFound = false;
  recomendados$: Observable<any[]>;
  recomendadosLoading = true;
  favoriteMovieIds = new Set<number>();

  // Reparto carousel options
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
    margin: 8,
    slideBy: 1,
    responsive: {
      0: { items: 2 },
      400: { items: 3 },
      600: { items: 4 },
      768: { items: 5 },
      1024: { items: 6 },
    },
  };

  repartoCarousel: any;
  private repartoStartPosition = 0;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const platformId = this.platformId;

    if (isPlatformBrowser(platformId)) {
      this.innerWidth = window.innerWidth + 200;
      this.innerHeigth = window.innerHeight;
    }  
    
    this.authService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      if (user) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });

    effect((onCleanup) => {
      const slug = this.slug_url();

      this.loading = true;
      this.notFound = false;
      this.film = null;
      this.movie = undefined;
      this.trailerURL = null;
      this.subtitle = false;
      this.hd = false;
      this.recomendados$ = undefined;
      this.recomendadosLoading = true;
      this.cdr.markForCheck();

      const subscription = this.publicacionService.loadPublication(slug).pipe(
        map((response) => {
          if (response && response.results && response.results.length > 0) {
            this.title.setTitle(`${response.results[0].nombre} - Picta`);

            this.meta.updateTag({ name: 'description', content: response.results[0].descripcion });
            this.meta.updateTag({ name: 'keywords', content: response.results[0].palabraClave });
            this.meta.updateTag({ name: 'author', content: response.results[0].canal.alias });

            this.meta.updateTag({ property: 'og:title', content: response.results[0].nombre });
            this.meta.updateTag({ property: 'og:type', content: 'website' });
            this.meta.updateTag({ property: 'og:url', content: 'https://www.picta.cu' });
            this.meta.updateTag({ property: 'og:image', content: response.results[0].url_imagen + '_1200x630' });
            this.meta.updateTag({ property: 'og:description', content: response.results[0].descripcion });
            this.meta.updateTag({ property: 'og:image:width', content: '1200' });
            this.meta.updateTag({ property: 'og:image:height', content: '630' });
            this.meta.updateTag({ property: 'og:site_name', content: 'Picta' });

            this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
            this.meta.updateTag({ name: 'twitter:title', content: response.results[0].nombre });
            this.meta.updateTag({ name: 'twitter:description', content: response.results[0].descripcion });
            this.meta.updateTag({ name: 'twitter:image', content: response.results[0].url_imagen + '_1200x630' });
            this.meta.updateTag({ name: 'twitter:site', content: '@PictaCuba' });

            this.loadMovieData(response.results[0]);
            return response.results[0];
          }

          throw new Error('No se encontraron resultados');
        }),
        catchError((error) => {
          this.notFound = true;
          console.error('Error al cargar la película:', error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      ).subscribe(result => {
        this.film = result;
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

   // Para actualizaciones dinámicas
   updateTitle(newTitle: string) {
    this.title.setTitle(`${newTitle} - Picta`);
  }

  ngOnInit() {
    this.loadFavoriteMovieIds();
    if (isPlatformBrowser(this.platformId)) {
      this.resizeObs = new Subscription();
      this.resizeObs.add(
        fromEvent(window, 'resize').pipe(
          debounceTime(150)
        ).subscribe(() => {
          this.innerWidth = window.innerWidth;
          this.cdr.markForCheck();
        })
      );
    }
  }

  ngOnDestroy() {
    this.resizeObs?.unsubscribe();
  }

  isFavoriteMovie(movieId?: number | null): boolean {
    if (!movieId) {
      return false;
    }

    return this.favoriteMovieIds.has(movieId);
  }

  toggleFavoriteMovie(movie: Publication, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const movieId = Number(movie?.id);
    if (!Number.isFinite(movieId) || movieId <= 0) {
      return;
    }

    if (this.favoriteMovieIds.has(movieId)) {
      this.favoriteMovieIds.delete(movieId);
    } else {
      this.favoriteMovieIds.add(movieId);
    }

    this.persistFavoriteMovieIds();
  }

  loadMovieData(response: any) {
    if(response){
      this.movie = response;
      this.loadRecomendaciones(response.id);
      if(response.url_subtitulo){
        this.subtitle = true
      }
      if(response.hd){
        this.hd = true
      }
      // Parsear resolucion desde descarga
      if (response.descarga) {
        try {
          const descarga = JSON.parse(response.descarga);
          if (descarga.pro) {
            this.resolucion = '1080p';
          } else if (descarga.high) {
            this.resolucion = '720p';
          }
        } catch (e) {
          // ignore
        }
      }  
      if(response.lista_reproduccion_canal.length === 1){ 
        const { id } = response.lista_reproduccion_canal[0];
        this.listaReproduccionCanalService.getPlaylist(id).subscribe(data => {
          if (data[0].publicado) {
            for (let publicacion of data[0].publicaciones) {
              const title = (publicacion?.nombre || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              if (title.includes('trailer')) {
                this.trailerURL = publicacion.slug_url;
              }
            }
          }
        });
      }
    }
  }

  private trackMovieEvent(action: string, detail: string = ''): void {
    if (!this.movie?.id) {
      return;
    }

    const baseLabel = `${this.movie.id}:${this.movie.slug_url || this.movie.nombre || 'sin-slug'}`;
    const eventLabel = detail ? `${baseLabel}:${detail}` : baseLabel;

    setTimeout(() => this.matomo.trackEvent('video', action, eventLabel), 0);
  }

  private trackPaymentByType(type: string): void {
    const paymentAction = (type === 'renta' || type === 'reproduccion') ? 'renta' : 'compra';
    this.trackMovieEvent(paymentAction, type || 'evento');
  }

  private runAfterTracking(action: () => void, delayMs = 300): void {
    setTimeout(() => action(), delayMs);
  }

  openPayment(type = '') {
    if (!this.movie) return;
    if (type === 'donacion') {
      const ref = this.dialog.open(PayItemComponent, {
        closeOnNavigation: true,
        hasBackdrop: true,
        panelClass: 'picta-pay-dialog',
        backdropClass: 'picta-pay-backdrop',
        data: { channel_id: this.movie.canal?.id },
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'donation-successful') {
          this.snackBar.open('Donación realizada satisfactoriamente');
        }
      });
    } else if (type === 'reproduccion' || type === 'renta' || type === 'descarga') {
      const externalId = `${this.movie.tipo}_${type}_${this.movie.id}`;
      this.paymentService.getItem({external_id: externalId,}).subscribe((data: any) => {
          if (data.results.length) {
            const offer = data.results[0];
            const dialogRef = this.dialog.open(PayItemComponent, {
              closeOnNavigation: true,
              hasBackdrop: true,
              panelClass: 'picta-pay-dialog',
              backdropClass: 'picta-pay-backdrop',
              width: '92vw',
              maxWidth: '980px',
              maxHeight: '90vh',
              data: { video: this.movie, offer, externalId },
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result === 'payment-successful') {
                this.trackPaymentByType(type);
                this.snackBar.open('Pago realizado satisfactoriamente');
                this.runAfterTracking(() => window.location.reload());
              }
            });
          } else {
            this.snackBar.open('No existe una oferta para esta publicación');
          }
        });
    }
  }

  openTrailer() {
    let videoWidth = this.innerWidth;
    if(videoWidth > 800){
      videoWidth = this.innerWidth/2;
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
        video: this.trailerURL
      },
    });
  }

  openDownload() {
    const ref = this.bottomSheet.open(DownloadPopupComponent, {
      data: { video: this.movie },
      panelClass: 'bottomSheet',
    });
  }

  goBack() {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    }
  }

  private loadRecomendaciones(id: any) {
      this.recomendadosLoading = true;
      const recomendados$ = this.listaReproduccionCanalService.getVideosRecomendados(id, {
        tipologia_nombre: 'pelicula'
      }).pipe(
        map((response) => (response.results ?? []).map((item) => {
          const canalData = item?.canal && typeof item.canal === 'object' ? item.canal : {};
          const tipologia = item?.categoria?.tipologia;
          const peliculaData = tipologia?.pelicula;
          return {
            ...item,
            categoria: {
              ...item.categoria,
              pelicula: peliculaData ? {
                ano: peliculaData.ano,
                imagen_secundaria: peliculaData.imagen_secundaria 
                  ? `https://www.picta.cu/${peliculaData.imagen_secundaria}` 
                  : undefined,
                pais: peliculaData.pais,
                genero: peliculaData.genero,
                duracion: tipologia.duracion,
                director: tipologia.director,
                reparto: tipologia.reparto,
              } : undefined
            },
            canal: {
              ...canalData,
              alias: item?.canal_alias ?? canalData.alias ?? '',
              url_avatar: item?.canal_avatar ?? canalData.url_avatar ?? '',
              nombre: typeof item?.canal === 'string' ? item.canal : canalData.nombre ?? ''
            }
          };
        })),
        catchError((error) => {
          console.error('Error al cargar títulos similares de la película:', error);
          return of([]);
        }),
        finalize(() => {
          this.recomendadosLoading = false;
          this.cdr.markForCheck();
        }),
        shareReplay(1)
      );

      this.recomendados$ = recomendados$;
      recomendados$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private loadFavoriteMovieIds(): void {
    const raw = this.localStorage.getItem(this.favoriteMoviesStorageKey);
    if (!raw) {
      this.favoriteMovieIds = new Set<number>();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Array<number | string>;
      const ids = Array.isArray(parsed)
        ? parsed
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0)
        : [];
      this.favoriteMovieIds = new Set<number>(ids);
    } catch {
      this.favoriteMovieIds = new Set<number>();
    }
  }

  private persistFavoriteMovieIds(): void {
    this.localStorage.setItem(
      this.favoriteMoviesStorageKey,
      JSON.stringify(Array.from(this.favoriteMovieIds))
    );
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
    const reparto = this.film?.categoria?.pelicula?.reparto;
    const totalItems = reparto?.length ?? 0;
    if (!totalItems) return true;
    return this.repartoStartPosition >= totalItems - 1;
  }

  openRepartoExplorer(): void {
    const reparto = this.film?.categoria?.pelicula?.reparto;
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
    if (!this.film?.descripcion) return;

    this.dialog.open(DescripcionDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      maxHeight: '85vh',
      panelClass: ['picta-dark-dialog', 'picta-reparto-dialog', 'picta-reparto-backdrop'],
      backdropClass: 'picta-descripcion-backdrop',
      data: {
        titulo: this.film.nombre,
        descripcion: this.film.descripcion
      }
    });
  }

  getActorSlug(actor: any): string[] {
    const slug = actor.slug_url || actor.slug;
    if (slug) {
      return ['/actor', slug];
    }
    // Fallback: usar el nombre tal cual está
    if (actor.nombre) {
      return ['/actor', actor.nombre];
    }
    return [];
  }

  getDirectorSlug(director: any): string[] {
    const slug = director.slug_url || director.slug;
    if (slug) {
      return ['/director', slug];
    }
    // Fallback: usar el nombre tal cual está
    if (director.nombre) {
      return ['/director', director.nombre];
    }
    return [];
  }

  hasActorSlug(actor: any): boolean {
    // Siempre true porque usamos fallback con el nombre
    return !!actor.nombre;
  }

  get actoresPrincipales(): any[] {
    const reparto = this.film?.categoria?.pelicula?.reparto;
    const count = this.isMobile ? 2 : 3;
    return Array.isArray(reparto) ? reparto.slice(0, count) : [];
  }

  get totalActores(): number {
    const reparto = this.film?.categoria?.pelicula?.reparto;
    return Array.isArray(reparto) ? reparto.length : 0;
  }

  get mostrarMasActores(): boolean {
    return this.totalActores > (this.isMobile ? 2 : 3);
  }

  get duracionFormateada(): string {
    const duracion = this.film?.duracion;
    if (!duracion) return '';

    const parts = duracion.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      // HH:MM:SS
      const [horas, minutos] = parts;
      if (horas > 0) {
        return `${horas}h ${minutos}m`;
      }
      return `${minutos}m`;
    } else if (parts.length === 2) {
      // MM:SS
      const [minutos] = parts;
      return `${minutos}m`;
    }
    return duracion;
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
}
