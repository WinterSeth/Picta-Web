import { Component, DestroyRef, HostListener, OnDestroy, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanalService } from '../../services/canal-service.service';
import { PublicationService } from '../../../medias/services/publication-service';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../../../../services/subscription.service';
import { AuthService } from '../../../../../../services/auth.service';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { SubSink } from 'subsink';
import { UserModel } from '../../../../models/user.model';
import { Meta, Title } from '@angular/platform-browser';
import { SerieService } from '../../../categoria/services/serie.service';
import { ConfirmDialogComponent } from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Publication, Serie } from '../../../medias/models/publicacion.model';
import { Canal } from '../../models/canal.model';
import { PictaResponse } from '../../../../models/response.picta.model';
import { DonateDialogComponent } from '../../../common-components/components/donate-dialog/donate-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../../../../../services/notification.service';
import { Playlist } from '../../models/playlist';
import { ChannelPlaylistService } from '../../services/channel-playlist.service';
import { MovieListComponent } from '../../../categoria/components/movie-list/movie-list.component';
import { SerieListComponent } from '../../../categoria/components/serie-list/serie-list.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MyCarouselComponent } from '../../../common-components/components/my-carousel/my-carousel.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatTabChangeEvent, MatTabGroup, MatTab, MatTabContent, MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { PortadaComponent } from '../../../common-components/components/portada/portada.component';
import { NgOptimizedImage, NgStyle, UpperCasePipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarkdownModule } from 'ngx-markdown';
import { ShortNumbersPipe } from '../../../medias/pipes/short-numbers.pipe';
import { CategoriaLoadingStateComponent } from '../../../categoria/components/categoria-loading-state/categoria-loading-state.component';
import { MembershipPlansDialogComponent } from '../membership-plans-dialog/membership-plans-dialog.component';
import { PayItemComponent } from '../../../common-components/components/pay-item/pay-item.component';

@Component({
    selector: 'app-canal',
    templateUrl: './canal.component.html',
    styleUrls: ['./canal.component.scss'],
    imports: [
    PortadaComponent,
    MatButton,
    MatIcon,
    NgStyle,
    MatTabGroup,
    MatTab,
    MatTabContent,
    MatTabsModule,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatSuffix,
    MyCarouselComponent,
    MatProgressSpinner,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    SerieListComponent,
    MovieListComponent,
    UpperCasePipe,
    NgOptimizedImage,
    MarkdownModule,
    ShortNumbersPipe,
    DatePipe,
    CategoriaLoadingStateComponent
]
})
export class CanalComponent implements OnInit, OnDestroy {
  @ViewChild('channelDialog') channelDialog: TemplateRef<any>;
  channelDialogRef: any;
  
  canal: Canal;
  videos = [];
  next = '1';
  searchControl = new UntypedFormControl('');
  isTop: boolean;
  isSolid: boolean;
  videoPortada: Publication;
  subscribing: boolean;
  subscribed: boolean;
  // indica que se está cargando el estado inicial de suscripción
  subscriptionLoading: boolean = true;
  subscription: any;
  notificationMode: 'all' | 'none' = 'all';
  subs = new SubSink();
  user: UserModel;
  
  private route: ActivatedRoute;
  private canalService: CanalService;
  private postService: PublicationService;
  private publicationService: PublicationService;
  private channelPlaylistService: ChannelPlaylistService;
  private snackBar: MatSnackBar;
  private titleService: Title;
  private serieService: SerieService;
  private meta: Meta;
  private destroyRef = inject(DestroyRef);
  private dialog: MatDialog;
  private localStorage: LocalstorageService;
  private subscribeService: SubscriptionService;
  public authService: AuthService;
  
  seriesList: any[] = [];
  peliculasList: any[] = [];
  documentalList: any[] = [];
  reportajeList: any[] = [];
  videoMusicalList: any[] = [];
  cancionlList: any[] = [];
  videoCliplList: any[] = [];
  audioList: any[] = [];
  cursoList: any[] = [];
  series: any[] = [];
  list: {
    title: string;
    subtitle: string;
    next: any;
    videos: Publication[];
    temporadaId: number;
  }[] = [];
  filtersSeries = {
    page: 1,
    page_size: 10,
    nombre__wildcard: '',
    ordering: '-id',
  };
  filtersPlaylist: any = {
    page: 1,
    page_size: 10,
    canal_nombre_raw: '',
  };
  filters: any = {
    page: 1,
    page_size: 10
  };
  filtersMovie: any = {
    page: 1,
    page_size: 10,
    ordering: '-fecha_creacion',
    tipologia_nombre_raw: 'Película',
  };
  loadingVideos = true;
  searchControlSerie = new UntypedFormControl('');
  filteredSeries: Serie[];
  searchControlPelicula = new UntypedFormControl('');
  canalKey;
  playlists: any[] = [];
  total: any;
  loadingSeries = false;
  loadingMovies = false;
  loadingPlaylists = false;
  activeTabLabel = 'Inicio';
  private filtersInitialized = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor(
    route: ActivatedRoute,
    canalService: CanalService,
    postService: PublicationService,
    publicationService: PublicationService,
    authService: AuthService,
    localStorage: LocalstorageService,
    titleService: Title,
    meta: Meta,
    serieService: SerieService,
    dialog: MatDialog,
    snackBar: MatSnackBar,
    private notificationService: NotificationService,
    channelPlaylistService: ChannelPlaylistService,
    subscribeService: SubscriptionService
  ) {
    this.route = route;
    this.canalService = canalService;
    this.postService = postService;
    this.publicationService = publicationService;
    this.authService = authService;
    this.localStorage = localStorage;
    this.titleService = titleService;
    this.meta = meta;
    this.serieService = serieService;
    this.dialog = dialog;
    this.snackBar = snackBar;
    this.channelPlaylistService = channelPlaylistService;
    this.subscribeService = subscribeService;
    this.route.paramMap
      .pipe(
        map(params => params.get('alias')),
        switchMap(alias => {
          return this.canalService.getChannel(alias);
        })
      ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: PictaResponse<Canal>) => {        
        this.canal = response.results[0];
        if (this.canal) {
          this.titleService.setTitle(this.canal.nombre);
          this.meta.updateTag({
            content: this.canal.descripcion,
            name: 'description',
          });
          this.meta.addTags([
            {
              name: 'twitter:card',
              content: this.canal.nombre,
            },
            {
              name: 'og:url',
              content: `https://www.picta.cu/canal/${this.canal.alias}`,
            },
            {
              name: 'og:image',
              content: `${this.canal.url_avatar}_600x600`,
            },
            {
              name: 'og:title',
              content: this.canal.nombre,
            },
            {
              name: 'og:description',
              content: this.canal.descripcion,
            },
            {
              name: 'og:image:width',
              content: '600',
            },
            {
              name: 'og:image:height',
              content: '630',
            },
          ]);
          this.canal.videos = [];
          this.initAll();
          this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user: any) => {
            if (user) {
              this.user = user;
              this.initSubscription();
            } else {
              delete this.user;
              this.subscribed = false;
            }
          });
        }
      });
  }

  ngOnInit() {
    // this.initAll();
  }

  onTabChange(event: MatTabChangeEvent) {
    this.activeTabLabel = event.tab.textLabel || 'Inicio';
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.canal) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition < scrollThreshold) {
      return;
    }

    if (this.activeTabLabel === 'Listas' && this.filtersPlaylist.page && !this.loadingPlaylists) {
      this.loadPlaylists();
      return;
    }

    if (this.activeTabLabel === 'Series' && this.filtersSeries.page && !this.loadingSeries) {
      this.loadSeries();
      return;
    }

    if (this.activeTabLabel === 'Películas' && this.filtersMovie.page && !this.loadingMovies) {
      this.loadMovies();
    }
  }

  openChannelDialog() {
    if (!this.channelDialog) return;
    this.channelDialogRef = this.dialog.open(this.channelDialog, {
      panelClass: 'picta-dark-dialog',
      backdropClass: 'picta-dialog-backdrop',
      maxWidth: '720px'
    });
  }

  closeChannelDialog() {
    if (this.channelDialogRef) {
      this.channelDialogRef.close();
      this.channelDialogRef = null;
    }
  }

  loadMovies(replace = false) {
    if (this.filtersMovie.page && !this.loadingMovies) {
      this.loadingMovies = true;
      this.subs.add(
        this.publicationService
          .getPublications(this.filtersMovie)
          .pipe(finalize(() => {
            this.loadingMovies = false;
          }))
          .subscribe(response => {
            this.peliculasList = replace ? response.results : [...this.peliculasList, ...response.results];
            this.filtersMovie.page = response.next;
          })
      );
    }
  }

  initSubscription() {
    this.subscriptionLoading = true;
    if (this.user) {
      this.subs.add(
        this.subscribeService
          .getSubscriptionsByUser({
            usuarioNombre: this.user.username,
            canalId: this.canal.id,
          })
          .pipe(finalize(() => {
            this.subscriptionLoading = false;
          }))
          .subscribe((res: any) => {
            this.subscription = res.results.filter(
              sub => sub.canal.id === this.canal.id
            )[0] || null;
            this.subscribed = !!this.subscription;
            if (this.subscription) {
              // Check localStorage for silenced channels (since API doesn't support notifications)
              this.notificationMode = this.checkIfSilenced() ? 'none' : 'all';
            }
          })
      );
    } else {
      this.subscriptionLoading = false;
      this.subscribed = false;
      this.subscription = null;
    }
  }

  handleSubscribe() {
    if (this.subscribing) return;
    this.subscribing = true;
    
    if (!this.subscribed) {
      // Not subscribed yet - subscribe with notifications (all)
      this.subs.add(
        this.subscribeService.subscribe(this.canal.id).subscribe({
          next: (res) => {
            this.subscribed = true;
            this.subscribing = false;
            this.subscription = res;
            this.notificationMode = 'all';
            this.notificationService.open('ok', 'Has empezado a seguir el canal');
          },
          error: (err) => {
            this.subscribing = false;
            console.error('Error subscribing:', err);
            this.notificationService.open('error', 'No se pudo seguir el canal');
          }
        })
      );
    } else {
      // Already subscribed - open menu (handled in template with button click)
      // The menu will call handleNotificationChange or handleUnsubscribe
      this.subscribing = false;
    }
  }

  handleNotificationChange(mode: 'all' | 'none') {
    if (this.subscribing || !this.subscribed) return;
    
    // Save to localStorage (since API doesn't support notifications)
    this.saveSilencedChannel(mode);
    
    this.notificationMode = mode;
    this.subscribing = false;
    // Show notification to the user about the change
    if (mode === 'none') {
      this.notificationService.open('ok', 'Notificaciones desactivadas para el canal');
    } else {
      this.notificationService.open('ok', 'Notificaciones activadas para el canal');
    }
  }

  private getSilencedChannels(): string[] {
    const stored = this.localStorage.getItem('silenced_channels');
    return stored ? JSON.parse(stored) : [];
  }

  private saveSilencedChannel(mode: 'all' | 'none') {
    let silenced = this.getSilencedChannels();
    const channelName = this.canal.nombre;
    
    if (mode === 'none') {
      if (!silenced.includes(channelName)) {
        silenced.push(channelName);
      }
    } else {
      silenced = silenced.filter(c => c !== channelName);
    }
    
    this.localStorage.setItem('silenced_channels', JSON.stringify(silenced));
  }

  private checkIfSilenced(): boolean {
    const silenced = this.getSilencedChannels();
    return silenced.includes(this.canal.nombre);
  }

  handleUnsubscribe() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          msg: `¿Estás seguro que deseas cancelar tu suscripción al canal ${this.canal.nombre}?`,
        },
        panelClass: 'picta-dark-dialog',
        backdropClass: 'picta-dialog-backdrop',
        width: 'min(540px, 96vw)',
        maxWidth: '96vw',
        enterAnimationDuration: '320',
        exitAnimationDuration: '240',
      })
        .afterClosed()
        .subscribe(result => {
        if (result) {
          // Show loading state on the subscribe button while unsubscribe request is in progress
          this.subscribing = true;

          this.subs.add(
            this.subscribeService
              .unsubscribe(this.subscription.id)
              .pipe(
                // ensure subscribing is reset on completion/error
                finalize(() => {
                  this.subscribing = false;
                })
              )
              .subscribe({
                next: () => {
                  this.subscribed = false;
                  this.subscription = null;
                  this.notificationMode = 'all';
                  // Remove from silenced channels
                  this.saveSilencedChannel('all');
                  this.notificationService.open('ok', 'Se dejó de seguir el canal exitosamente.');
                },
                error: (err) => {
                  console.error('Error unsubscribing:', err);
                  this.notificationService.open('error', 'No se pudo dejar de seguir el canal');
                }
              })
          );
        }
      });
  }

  handleBecomeMember() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.open('error', 'Debes estar autenticado para ser miembro');
      return;
    }

    const dialogRef = this.dialog.open(MembershipPlansDialogComponent, {
      panelClass: 'picta-dark-dialog',
      backdropClass: 'picta-dialog-backdrop',
      width: 'min(640px, 96vw)',
      maxWidth: '96vw',
      maxHeight: '90vh',
      enterAnimationDuration: '320',
      exitAnimationDuration: '240',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.plan && result.offer) {
        this.openMembershipPayment(result.plan, result.offer, result.externalId);
      }
    });
  }

  private openMembershipPayment(plan: any, offer: any, externalId: string): void {
    const paymentDialogRef = this.dialog.open(PayItemComponent, {
      closeOnNavigation: true,
      hasBackdrop: true,
      panelClass: 'picta-pay-dialog',
      backdropClass: 'picta-pay-backdrop',
      width: '92vw',
      maxWidth: '980px',
      maxHeight: '90vh',
      data: {
        video: plan,
        offer,
        externalId,
        canal_id: this.canal.id,
      },
    });

    paymentDialogRef.afterClosed().subscribe(result => {
      if (result === 'payment-successful') {
        this.notificationService.open('ok', 'Membresía activada correctamente');
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setOrder(order: string) {
    this.filtersSeries.ordering = order;
    this.filtersSeries.page = 1;
    this.loadSeries(true);
  }

  setOrderMovie(order: string) {
    this.filtersMovie.ordering = order;
    this.filtersMovie.page = 1;
    this.loadMovies(true);
  }

  loadData(params?: any) {
    if (params) {
      this.filters = Object.assign(this.filters, {
        ...this.filters,
        ...params,
      });
    }
    if (!this.filters.page) {
      this.loadingVideos = false;
      return;
    }

    this.loadingVideos = true;
    this.subs.add(
      this.postService
        .loadPublicationsFromChanelByFilters(this.filters)
        .pipe(finalize(() => {
          this.loadingVideos = false;
        }))
        .subscribe({
          next: response => {
            this.total = response.count;
            this.canal.videos = [...this.canal.videos, ...response.results];
            this.videos = this.canal.videos;
            this.videoPortada = this.videos[0]; // Video mas reciente para la portada del canal.
            this.filters.page = response.next;
          },
          error: () => {
            this.total = this.total || 0;
          }
        })
    );
  }

  loadSeries(replace = false) {
    if (this.filtersSeries.page && !this.loadingSeries) {
      this.loadingSeries = true;
      this.serieService
        .getAll(this.filtersSeries)
        .pipe(finalize(() => {
          this.loadingSeries = false;
        }))
        .subscribe((response: PictaResponse<Serie>) => {
          this.series = replace
            ? response.results
            : [...this.series, ...response.results];
          this.filtersSeries.page = response.next;
          // this.filtersSeries.next = response.next;
        });
    }
  }

  private getTipologia(tipologia: string) {
    return this.postService.loadPublicationsFromChanelByFilters({
      canal_nombre_raw: this.canal.nombre,
      tipologia_nombre_raw: tipologia,
    });
  }

  private listenFilter() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        tap(query => {
          if (query) {
            this.canal.videos = [];
            this.loadingVideos = true;
            this.filters = Object.assign(this.filters, {
              ...this.filters,
              nombre__wildcard: `*${query}*`,
            });
            this.filters.page = 1;
            delete this.filters.page_size;
          } else {
            this.canal.videos = [];
            delete this.filters.nombre__wildcard;
            this.filters.page = 1;
            this.filters.page_size = 10;
          }
        })
      )
      .subscribe(() => {
        this.loadData();
      });
    this.searchControlSerie.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        tap(query => {
          if (query) {
            this.filtersSeries.nombre__wildcard = `*${query}*`;
            this.filtersSeries.page = 1;
            // delete this.filters.page_size;
          } else {
            this.series = [];
            delete this.filtersSeries.nombre__wildcard;
            this.filtersSeries.page = 1;
            this.filtersSeries.page_size = 10;
          }
        })
      )
      .subscribe(() => {
        this.loadSeries(true);
      });
    this.searchControlPelicula.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        tap(query => {
          if (query) {
            this.filtersMovie.nombre__wildcard = `*${query}*`;
            this.filtersMovie.page = 1;
          } else {
            delete this.filtersMovie.nombre__wildcard;
            this.filtersMovie.page = 1;
          }
        })
      )
      .subscribe(() => {
        this.loadMovies(true);
      });
  }

  private initAll() {
    this.loadingVideos = true;
    this.total = 0;
    this.videos = [];
    this.playlists = [];
    this.series = [];
    this.peliculasList = [];
    this.documentalList = [];
    this.reportajeList = [];
    this.videoMusicalList = [];
    this.cancionlList = [];
    this.videoCliplList = [];
    this.audioList = [];
    this.cursoList = [];

    if (!this.filtersInitialized) {
      this.listenFilter();
      this.filtersInitialized = true;
    }
    this.filtersSeries = Object.assign(this.filtersSeries, {
      ...this.filtersSeries,
      canal_nombre_raw: this.canal.nombre,
    });
    this.filtersMovie = Object.assign(this.filtersMovie, {
      ...this.filtersMovie,
      canal_nombre_raw: this.canal.nombre,
    });
    this.filters = Object.assign(this.filters, {
      ...this.filters,
      canal_nombre_raw: this.canal.nombre,
    });
    this.filtersSeries.page = 1;
    this.filtersMovie.page = 1;
    this.filtersPlaylist.page = 1;
    this.filters.page = 1;
    this.loadData();
    this.initSubscription();
    this.loadSeries();
    this.loadMovies();
    this.loadPlaylists();
    // this.getTipologia('Película').subscribe((response: PictaResponse<any>) => this.peliculasList = response.results);
    this.getTipologia('Documental').subscribe(
      (response: PictaResponse<any>) => (this.documentalList = response.results)
    );
    this.getTipologia('Reportaje').subscribe(
      (response: PictaResponse<any>) => (this.reportajeList = response.results)
    );
    this.getTipologia('Video Musical').subscribe(
      (response: PictaResponse<any>) =>
        (this.videoMusicalList = response.results)
    );
    this.getTipologia('Audio').subscribe(
      (response: PictaResponse<any>) => (this.audioList = response.results)
    );
    this.getTipologia('Curso').subscribe(
      (response: PictaResponse<any>) => (this.cursoList = response.results)
    );
    this.getTipologia('Canción').subscribe(
      (response: PictaResponse<any>) => (this.cancionlList = response.results)
    );
    this.getTipologia('Videoclip').subscribe(
      (response: PictaResponse<any>) => (this.videoCliplList = response.results)
    );
  }

  donate() {
    const ref = this.dialog.open(DonateDialogComponent, {
      closeOnNavigation: true,
      hasBackdrop: true,
      data: {
        channel_id: this.canal.id,
      },
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'donation-successful') {
        this.snackBar.open('Donación realizada satisfactoriamente');
      }
    });
  }

  loadPlaylists() {
    const filters = this.filtersPlaylist;
    filters.canal_nombre_raw = this.canal.nombre;
    if (filters.page && !this.loadingPlaylists) {
      this.loadingPlaylists = true;
      this.channelPlaylistService.getPlaylists(filters).pipe(finalize(() => {
        this.loadingPlaylists = false;
      })).subscribe(response => {
        this.playlists = [
          ...this.playlists,
          ...response.results.filter(
            playlist => playlist.publicaciones.length > 0
          ),
        ];
        this.filtersPlaylist.page = response.next;
      });
    }
  }

}
