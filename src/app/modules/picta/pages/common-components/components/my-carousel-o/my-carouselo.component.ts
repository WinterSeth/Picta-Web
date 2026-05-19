import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  computed,
  input,
  output,
  inject,
} from '@angular/core';
import { SubSink } from 'subsink';
import { Router, RouterLink } from '@angular/router';
import { UserModel } from '../../../../models/user.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { cardsAnimation } from '../../../../animations/cards';
import { favoriteRemovalCardAnimation } from '../../../../animations/favorites';
import { Publication } from '../../../medias/models/publicacion.model';
import {
  OwlOptions,
  CarouselModule,
  SlidesOutputData,
} from 'ngx-owl-carousel-o';
import { ShortNumbersPipe } from '../../../medias/pipes/short-numbers.pipe';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-my-carousel-o',
  templateUrl: './my-carouselo.component.html',
  styleUrls: ['./my-carouselo.component.scss'],
  animations: [
    cardsAnimation,
    favoriteRemovalCardAnimation,
    trigger('detailsAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: '0' }),
        animate('500ms', style({ opacity: 1, height: '100%' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '100%' }),
        animate('500ms', style({ opacity: 0, height: '0' })),
      ]),
    ]),
  ],
  imports: [
    MatIcon,
    CarouselModule,
    RouterLink,
    ShortNumbersPipe,
    NgOptimizedImage,
    MatButtonModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatButtonModule,
  ],
})
export class MyCarouseloComponent implements OnInit, OnDestroy, OnChanges {
  private readonly favoriteMoviesStorageKey = 'picta.movieFavorites';
  private readonly favoriteSeriesStorageKey = 'picta.seriesFavorites';
  private readonly favoriteAnimesStorageKey = 'picta.animesFavorites';
  private readonly favoriteDoramasStorageKey = 'picta.doramasFavorites';
  private router = inject(Router);
  private localStorage = inject(LocalstorageService);

  readonly videos = input<Publication[]>(undefined);
  readonly horizontal = input(true);
  readonly title = input<string>(undefined);
  readonly subtitle = input<string>(undefined);
  readonly controls = input(true);
  readonly arrows = input(true);
  readonly carouselOptions = input<Partial<OwlOptions>>(undefined);
  readonly envivo = input(false);
  readonly populares = input(false);
  readonly series = input(false);
  readonly tipo = input(false);
  readonly mode = input('card');
  readonly favoriteType = input<'movie' | 'series' | 'animes' | 'doramas' | null>(null);
  readonly shwDtail = input<boolean>(undefined, { alias: 'showDetails' });
  readonly hasMore = input(false);
  readonly showMoreRoute = input<string[] | string | undefined>(undefined);
  readonly showNav = input(this.arrows());
  readonly topRanked = input(false);

  serieOption: OwlOptions = {
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
      0: {
        items: 2,
        slideBy: 1,
      },
      400: {
        items: 3,
        slideBy: 1,
      },
      768: {
        items: 4,
        slideBy: 1,
      },
      1024: {
        items: 5,
        slideBy: 1,
      },
      1280: {
        items: 5,
        slideBy: 1,
      },
      1536: {
        items: 6,
        slideBy: 1,
      },
    },
  };

  readonly resolvedOptions = computed<OwlOptions>(() => {
    const customOptions = this.carouselOptions();
    if (!customOptions) {
      return this.serieOption;
    }

    return {
      ...this.serieOption,
      ...customOptions,
      responsive: {
        ...(this.serieOption.responsive || {}),
        ...(customOptions.responsive || {}),
      },
    };
  });

  isDown = false;
  startX;
  scrollLeft;
  showDetailsPanel: boolean;
  activeVideo: Publication;
  readonly load = output();
  readonly favoriteChanged = output<{
    type: 'movie' | 'series';
    key: number;
    isFavorite: boolean;
  }>();
  showLeftArrow: boolean;
  showRigthArrow = true;
  readonly hasNext = input<boolean>(undefined);
  subs = new SubSink();
  subscribing: boolean;
  subscribed: boolean;
  readonly subscription = input<any>(undefined);
  user: UserModel;
  readonly canal = input<any>(undefined);
  readonly temporada = input<any>(undefined);
  readonly showSideOverlays = input(true);
  readonly noPadding = input(false);
  private carouselStartPosition = 0;
  private visibleSlides = 1;
  private favoriteMovieIds = new Set<number>();
  private favoriteSerieIds = new Set<number>();
  private favoriteAnimesIds = new Set<number>();
  private favoriteDoramasIds = new Set<number>();
  private removingFavoriteKeys = new Set<number>();
  private readonly favoriteRemovalDurationMs = 220;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  //isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(result => result.matches));

  constructor() {}

  ngOnInit() {
    this.loadFavoriteStorage();
    /* this.checkSubscription();
    this.subs.add(
      this.getScroll(this.carousel.nativeElement).subscribe(scroll => {
        if (scroll > 0) {
          this.showLeftArrow = true;
        } else {
          this.showLeftArrow = false;
        }
        if (scroll < this.carousel.nativeElement.scrollWidth - this.carousel.nativeElement.clientWidth - 200) {
          this.showRigthArrow = true;
        } else {
          this.load.emit();
          this.showRigthArrow = false;
        } 
      })
    ); */
  }

  continueWatching(episode) {
    if (localStorage.getItem(episode.slug_url)) {
      //console.log(this.canal.nombre);
      const duration = episode.duracion;
      const a = duration.split(':'); // split
      let seconds = 0;
      if (a.length === 3) {
        seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
      } else if (a.length === 2) {
        seconds = +a[0] * 60 + +a[1];
      } else {
        seconds = +a[0];
      }
      return (
        (parseFloat(localStorage.getItem(episode.slug_url)) / seconds) * 100
      );
    }
    return null;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  navigate() {
    const canal = this.canal();
    if (canal) {
      this.router.navigate(['/canal', canal.alias]);
    }
    const temporada = this.temporada();
    if (temporada) {
      this.router.navigate(['/serie', temporada.serieId]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['favoriteType']) {
      this.loadFavoriteStorage();
    }
    this.checkSubscription();
  }

  isFavoriteEpisode(episode: Publication): boolean {
    if (this.favoriteType() === 'movie') {
      return !!episode?.id && this.favoriteMovieIds.has(episode.id);
    }

    if (this.favoriteType() === 'series') {
      const serieId = this.getSeriesFavoriteId(episode);
      return serieId !== null && this.favoriteSerieIds.has(serieId);
    }

    return false;
  }

  favoriteAriaLabel(episode: Publication): string {
    return this.isFavoriteEpisode(episode)
      ? 'Quitar de favoritos'
      : 'Agregar a favoritos';
  }

  toggleFavoriteEpisode(episode: Publication, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const type = this.favoriteType();
    if (type === 'movie') {
      const movieId = episode?.id;
      if (!movieId) {
        return;
      }

      const isFavorite = this.toggleFavoriteItem(
        this.favoriteMovieIds,
        movieId,
      );
      this.persistFavoriteMovieIds();
      this.emitFavoriteChange(type, movieId, isFavorite);
      return;
    }

    if (type === 'series') {
      const serieId = this.getSeriesFavoriteId(episode);
      if (serieId === null) {
        return;
      }

      const isFavorite = this.toggleFavoriteItem(
        this.favoriteSerieIds,
        serieId,
      );
      this.persistFavoriteSerieIds();
      this.emitFavoriteChange(type, serieId, isFavorite);
      return;
    }

    if (type === 'animes') {
      const serieId = this.getSeriesFavoriteId(episode);
      if (serieId === null) {
        return;
      }

      const isFavorite = this.toggleFavoriteItem(
        this.favoriteAnimesIds,
        serieId,
      );
      this.persistFavoriteAnimesIds();
      this.emitFavoriteChange('series', serieId, isFavorite);
      return;
    }

    if (type === 'doramas') {
      const serieId = this.getSeriesFavoriteId(episode);
      if (serieId === null) {
        return;
      }

      const isFavorite = this.toggleFavoriteItem(
        this.favoriteDoramasIds,
        serieId,
      );
      this.persistFavoriteDoramasIds();
      this.emitFavoriteChange('series', serieId, isFavorite);
    }
  }

  isRemovingFavorite(episode: Publication): boolean {
    const type = this.favoriteType();
    if (!type) {
      return false;
    }

    if (type === 'movie') {
      const movieId = episode?.id;
      return !!movieId && this.removingFavoriteKeys.has(movieId);
    }

    const serieId = this.getSeriesFavoriteId(episode);
    return serieId !== null && this.removingFavoriteKeys.has(serieId);
  }

  private emitFavoriteChange(
    type: 'movie' | 'series',
    key: number,
    isFavorite: boolean,
  ): void {
    if (isFavorite) {
      this.favoriteChanged.emit({ type, key, isFavorite: true });
      return;
    }

    if (this.removingFavoriteKeys.has(key)) {
      return;
    }

    this.removingFavoriteKeys.add(key);
    setTimeout(() => {
      this.favoriteChanged.emit({ type, key, isFavorite: false });
      this.removingFavoriteKeys.delete(key);
    }, this.favoriteRemovalDurationMs);
  }

  private toggleFavoriteItem(collection: Set<number>, key: number): boolean {
    if (collection.has(key)) {
      collection.delete(key);
      return false;
    }

    collection.add(key);
    return true;
  }

  private getSeriesFavoriteId(episode: Publication): number | null {
    const rawId = (episode as any)?.pelser_id ?? episode?.id;
    const serieId = Number(rawId);
    return Number.isFinite(serieId) && serieId > 0 ? serieId : null;
  }

  private loadFavoriteStorage(): void {
    this.favoriteMovieIds = this.readFavoriteNumberSet(
      this.favoriteMoviesStorageKey,
    );
    this.favoriteSerieIds = this.readFavoriteNumberSet(
      this.favoriteSeriesStorageKey,
    );
    this.favoriteAnimesIds = this.readFavoriteNumberSet(
      this.favoriteAnimesStorageKey,
    );
    this.favoriteDoramasIds = this.readFavoriteNumberSet(
      this.favoriteDoramasStorageKey,
    );
  }

  private readFavoriteNumberSet(storageKey: string): Set<number> {
    const raw = this.localStorage.getItem(storageKey);
    if (!raw) {
      return new Set<number>();
    }

    try {
      const parsed = JSON.parse(raw) as Array<number | string>;
      const values = Array.isArray(parsed)
        ? parsed
            .map(value => Number(value))
            .filter(value => Number.isFinite(value) && value > 0)
        : [];

      return new Set<number>(values);
    } catch {
      return new Set<number>();
    }
  }

  private persistFavoriteMovieIds(): void {
    this.localStorage.setItem(
      this.favoriteMoviesStorageKey,
      JSON.stringify(Array.from(this.favoriteMovieIds)),
    );
  }

  private persistFavoriteSerieIds(): void {
    this.localStorage.setItem(
      this.favoriteSeriesStorageKey,
      JSON.stringify(Array.from(this.favoriteSerieIds)),
    );
  }

  private persistFavoriteAnimesIds(): void {
    this.localStorage.setItem(
      this.favoriteAnimesStorageKey,
      JSON.stringify(Array.from(this.favoriteAnimesIds)),
    );
  }

  private persistFavoriteDoramasIds(): void {
    this.localStorage.setItem(
      this.favoriteDoramasStorageKey,
      JSON.stringify(Array.from(this.favoriteDoramasIds)),
    );
  }

  onCarouselInitialized(data: SlidesOutputData): void {
    this.syncCarouselState(data);
  }

  onCarouselTranslated(data: SlidesOutputData): void {
    this.syncCarouselState(data);
  }

  navigatePrev(carousel: any): void {
    if (this.prevDisabled()) {
      return;
    }

    carousel.prev(250);
  }

  navigateNext(carousel: any): void {
    if (this.nextDisabled()) {
      return;
    }

    if (this.isAtEnd() && this.hasNext()) {
      this.load.emit();
      return;
    }

    carousel.next(250);
  }

  prevDisabled(): boolean {
    return this.carouselStartPosition <= 0;
  }

  nextDisabled(): boolean {
    const videos = this.videos() ?? [];

    if (!videos.length) {
      return true;
    }

    if (this.hasNext()) {
      return false;
    }

    return this.isAtEnd();
  }

  private isAtEnd(): boolean {
    const totalItems = this.videos()?.length ?? 0;

    if (!totalItems) {
      return true;
    }

    return this.carouselStartPosition + this.visibleSlides >= totalItems;
  }

  private syncCarouselState(data: SlidesOutputData): void {
    this.carouselStartPosition = Number(data?.startPosition ?? 0);
    this.visibleSlides = Math.max(Number(data?.slides?.length ?? 1), 1);
  }

  deleteVideo(url) {
    this.localStorage.removeItem(url);
  }

  private checkSubscription() {
    this.subscribed = !!this.subscription();
  }

  onShowMore(): void {
    // Emitir evento si el padre quiere manejarlo
    this.load.emit();
  }
}
