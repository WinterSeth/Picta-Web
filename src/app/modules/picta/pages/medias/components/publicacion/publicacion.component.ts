import { CineModeService } from '../../../../services/cine-mode.service';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  AfterViewInit,
  viewChild,
  inject,
  ViewChild,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicationService } from '../../services/publication-service';
import { ListaReproduccionCanalService } from '../../services/lista-reproduccion-canal.service';
import { CanalService } from '../../../canal/services/canal-service.service';
import { SubSink } from 'subsink';
import { VotoService } from '../../services/voto.service';
import {
  isPlatformBrowser,
  Location,
  NgStyle,
  UpperCasePipe,
  SlicePipe,
  CurrencyPipe,
  NgOptimizedImage,
} from '@angular/common';
import { UntypedFormControl } from '@angular/forms';
import { ComentarioService } from '../../services/comentario.service';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { finalize, lastValueFrom, Subject, Subscription, timer } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { NotificationService } from '../../../../../../services/notification.service';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { UserPlaylistDialogComponent } from './user-playlist-dialog/user-playlist-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Platform } from '@angular/cdk/platform';
import { ConfirmDialogComponent } from '../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import { DownloadPopupComponent } from '../../../../components/download-popup/download-popup.component';
import { UserModel } from '../../../../models/user.model';
import { SubscriptionService } from '../../../../../../services/subscription.service';
import { AuthService } from '../../../../../../services/auth.service';
import { MatSlider } from '@angular/material/slider';
import { PayItemComponent } from '../../../common-components/components/pay-item/pay-item.component';
import { PaymentService } from '../../../profile/services/payment.service';
import { Publication } from '../../models/publicacion.model';
import { Canal } from '../../../canal/models/canal.model';
import { PictaResponse } from '../../../../models/response.picta.model';
import { LocalstorageService } from '../../../../../../services/localstorage.service';
import { AdsService } from '../../../../../../services/ads.service';
import { DonateDialogComponent } from '../../../common-components/components/donate-dialog/donate-dialog.component';
import { MembershipPlansDialogComponent } from '../../../canal/components/membership-plans-dialog/membership-plans-dialog.component';
import { DialogMessageComponent } from './dialog-message/dialog-message.component';
import { VideoInfoDialogComponent } from '../../../../components/dialogs/video-info-dialog/video-info-dialog.component';
import { ShortNumbersPipe } from '../../pipes/short-numbers.pipe';
import { RecommendedListComponent } from './recommended-list/recommended-list.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { CinePlaylistComponent } from './cine-playlist/cine-playlist.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ChatComponent } from '../../../../../chat/components/chat/chat.component';
import { ComentBoxComponent } from './coment-box/coment-box.component';
import { ComentFormComponent } from './coment-form/coment-form.component';
import { DenunciaFormComponent } from './denuncia-form/denuncia-form.component';
import { MatDivider } from '@angular/material/divider';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatBadge } from '@angular/material/badge';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatAnchor, MatIconButton } from '@angular/material/button';
import { ChatService } from '../../../../../chat/services/chat.service';
import shaka from 'shaka-player/dist/shaka-player.ui';

import { MarkdownModule } from 'ngx-markdown';
import { ShortsCarouselComponent } from '../../../../components/shorts-carousel/shorts-carousel.component';
import { ProgramacionCanalComponent } from '../programacion/programacion-canal.component';
import { CategoriaLoadingStateComponent } from '../../../categoria/components/categoria-loading-state/categoria-loading-state.component';
import { MatomoTracker } from 'ngx-matomo-client';
import { NextVideoCardComponent } from './next-video-card/next-video-card.component';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.scss'],
  imports: [
    MatButton,
    MatTooltip,
    MatAnchor,
    NgStyle,
    MatIcon,
    MatProgressSpinner,
    RouterLink,
    MatBadge,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDivider,
    DenunciaFormComponent,
    ComentFormComponent,
    ComentBoxComponent,
    ChatComponent,
    MatSlideToggle,
    PlaylistComponent,
    CinePlaylistComponent,
    RecommendedListComponent,
    UpperCasePipe,
    SlicePipe,
    CurrencyPipe,
    ShortNumbersPipe,
    NgOptimizedImage,
    MarkdownModule,
    ShortsCarouselComponent,
    ProgramacionCanalComponent,
    CategoriaLoadingStateComponent,
    NextVideoCardComponent,
  ],
})
export class PublicacionComponent implements OnInit, OnDestroy, AfterViewInit {
  private chatService = inject(ChatService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private publicacionService = inject(PublicationService);
  private listaReproduccionCanalService = inject(ListaReproduccionCanalService);
  private canalService = inject(CanalService);
  private router = inject(Router);
  private votoService = inject(VotoService);
  private location = inject(Location);
  private subscribeService = inject(SubscriptionService);
  authService = inject(AuthService);
  private comentarioService = inject(ComentarioService);
  dialog = inject(MatDialog);
  private renderer2 = inject(Renderer2);
  private notificationService = inject(NotificationService);
  private paymentService = inject(PaymentService);
  private bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);
  private platform = inject(Platform);
  private localStorage = inject(LocalstorageService);
  private meta = inject(Meta);
  private matomo = inject(MatomoTracker);
  private adsService = inject(AdsService);
  readonly cineModeService = inject(CineModeService);
  private destroyRef = inject(DestroyRef);

  @Input() 'slug_url'!: any;

  poster: string = '';

  readonly videoContainerRef = viewChild<ElementRef>('videoContainer');
  readonly videoElementRef = viewChild<ElementRef>('videoPlayer');

  videoElement: HTMLVideoElement;
  videoContainerElement: HTMLDivElement | undefined;

  player: any;
  ads: any;
  controls: any;
  currentVideoIndex: number = 0; // Índice del video actual

  slug: string;
  video: Publication;
  canal: Canal;
  videosRecomendados: Publication[];
  autoplay;
  loading = true;
  client: string;
  subs = new SubSink();
  x: number;
  y: number;
  liked: boolean;
  disliked: boolean;
  likes: number;
  dislikes: number;
  likeLoading = signal(false);
  dislikeLoading = signal(false);
  votoExistente: any;
  twitterHref: string;
  denuncia: boolean;
  subscribed: boolean;
  notificationMode: 'all' | 'none' = 'all';
  subscribing: boolean;
  // indica que se está cargando el estado inicial de suscripción
  subscriptionLoading: boolean = true;
  disabled: boolean;
  loggedUser: UserModel;
  comentar: boolean;
  comentarioText: string;
  isLoggedIn = false;
  subscription;
  isMember: boolean = false;
  
  // Cine mode signals
  cineMode = signal(false);
  showCineUpgradeModal = signal(false);
  showPlaylistOverlay = signal(false);
  
  // Cine upgrade modal
  openCineUpgradeModal() {
    this.showCineUpgradeModal.set(true);
  }
  
  closeCineUpgradeModal() {
    this.showCineUpgradeModal.set(false);
  }
  
  navigateToSubscriptionsFromCine() {
    this.closeCineUpgradeModal();
    this.navigateToSubscriptions();
  }

  telegramHref: string;
  facebookHref: string;
  fechaPublicado;
  urlSubject = new Subject();
  isCounted = false;
  mediaNotFound: boolean;
  retry = 3;
  seeingNow = 0;
  show = false;
  //@ViewChild('videoContainer', { static: true }) videoContainerRef: ElementRef;
  readonly leftSide = viewChild<ElementRef>('leftSide');
  readonly rightSide = viewChild<ElementRef>('rightSide');
  readonly actionIndicatorPlay = viewChild<ElementRef>(
    'shaka-small-play-button',
  );
  readonly actionIndicatorFF = viewChild<ElementRef>('shaka-fullscreen-button');
  readonly actionIndicatorRW = viewChild<ElementRef>('actionIndicatorRW');
  readonly actionIndicatorPause = viewChild<ElementRef>('actionIndicatorPause');
  readonly actionIndicatorVolUp = viewChild<ElementRef>('actionIndicatorVolUp');
  readonly actionIndicatorVolDown = viewChild<ElementRef>(
    'actionIndicatorVolDown',
  );
  readonly actionIndicatorVolMuted = viewChild<ElementRef>(
    'actionIndicatorVolMuted',
  );
  readonly controlsOverlay = viewChild<ElementRef>('controlsOverlay');
  readonly durationSlider = viewChild<MatSlider>('durationSlider');
  readonly adContainer = viewChild<ElementRef>('adContainer');
  sseEvtSubscription: Subscription;
  playlist: any;
  hasPlayList: boolean;
  commentId: any;
  isUserPlayList: boolean;
  type = 'publicacion';
  autoplayNext: any;
  playlistBottomPanelRef: MatBottomSheetRef<any, any>;
  readonly playlistRefTemp = viewChild<TemplateRef<any>>('playlistRef');
  readonly chatMobileRef = viewChild<TemplateRef<any>>('chatMobileRef');
  isFullScreen: boolean;
  qualities: any[] = [];
  innerWidth: number;
  innerHeigth: number;
  premium = false;
  subBg = true;
  hasInternalTextTracks: boolean = false;
  subtitlesVisible: boolean = false;
  private lastSelectedTextTrackId: number | string | null = null;
  private subtitleToggleButton: HTMLElement | null = null;
  private subtitleWatcher: any = null;
  savedTextSize = 30;
  subTextSizeControl = new UntypedFormControl(30);
  subTextColorControl = new UntypedFormControl('#ffff00');
  commentsPage = 1;
  commentsLoading = false;
  platformId: any;
  private readonly COMMENTS_PER_PAGE = 10;
  //ads: Resource[] = [];

  online: any;
  user;

  // variable para controlar la descripcion de la publicaciones (sobrescribi variable por que no la encontre)
  readMore!: boolean;
  displayNext: boolean = false;
  listener: any;
  siguiente: any;
  ui: any;
  video2: any;

  showAd: boolean = false;
  adCountdown: number = 10; // Contador de 10 segundos
  playTime: number = 0;
  adsPicta: any[] = [];

  // Autoplay countdown
  autoplayCountdown: number = 10;
  autoplayCountdownInterval: any;

  adsNumber: number;
  showAdRemovalModal: boolean = false;
  adui: any;
  listenerAds: any;

  @HostListener('window:scroll')
  onWindowScrollForComments() {
    if (
      !this.video?.id ||
      !this.commentsPage ||
      this.commentsLoading ||
      this.loading
    ) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 48;

    if (scrollPosition >= scrollThreshold) {
      this.loadComentarios();
    }
  }

  adConfig = {
    addSeekBar: true,
    //enableTooltips: true,
    seekBarColors: {
      base: 'rgb(0, 0, 0, 0)',
      buffered: 'rgb(0, 0, 0, 0)',
      played: 'rgb(33, 150, 243)',
    },
    controlPanelElements: ['mute', 'volume', 'spacer'],
    addBigPlayButton: false,
  };

  liveConfig = {
    addSeekBar: false,
    enableTooltips: true,
    controlPanelElements: [
      'play_pause',
      'mute',
      'volume',
      'spacer',
      'picture_in_picture',
      'fullscreen',
    ],
    addBigPlayButton: true,
  };

  videoFullConfig = {
    addBigPlayButton: false,
    addSeekBar: true,
    seekBarColors: {
      base: 'rgba(255,255,255,.2)',
      buffered: 'rgba(255,255,255,.4)',
      played: 'rgb(232, 70, 46)',
    },
    enableTooltips: true,
    //'overflowMenuButtons' : [ 'statistics', 'loop', 'airplay', 'cast'],
    controlPanelElements: [
      'rewind',
      'play_pause',
      'fast_forward',
      'mute',
      'volume',
      'time_and_duration',
      'spacer',
      'captions',
      'language',
      'quality',
      'picture_in_picture',
      'playback_rate',
      'fullscreen',
      //'overflow_menu',
    ],
    statisticsList: ['width', 'height', 'playTime', 'bufferingTime'],
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    fastForwardRates: [2, 4, 8, 16, 32],
    rewindRates: [-2, -4, -8, -16, -32],
  };

  videoShortConfig = {
    seekBarColors: {
      base: 'rgba(255,255,255,.2)',
      buffered: 'rgba(255,255,255,.4)',
      played: 'rgb(232, 70, 46)',
    },
    overflowMenuButtons: ['statistics', 'loop', 'airplay', 'cast'],
    controlPanelElements: [
      'mute',
      'volume',
      'time_and_duration',
      'spacer',
      'captions',
      'language',
      'quality',
      'picture_in_picture',
      'fullscreen',
      //'overflow_menu',
    ],
  };
  titleOverlay: boolean = false;
  showPlayerOverlay: boolean = false; // Solo true cuando el video principal está listo
  quality: any;
  descarga: any;
  descargas: any;
  publicidad: any;
  showSidebarAd: boolean = false;
  isAdPlaying: boolean = true;
  adInterval: any;
  canSkipAd: boolean = false;
  planName: any;
  countdownInterval: NodeJS.Timeout;
  originalVideoUrl: string;
  private titleOverlayTimeoutId: ReturnType<typeof setTimeout> | null = null;
  // Programación ahora delegada al componente `ProgramacionCanalComponent`.
  waitingVideoUrl = 'https://www.picta.cu/videos/waiting/master.m3u8';
  private checkerInterval: any;
  private isCheckingStream = false;
  private preventLoopHandler = () => {
    if (!this.autoplayNext && this.videoElement.duration > 0) {
      const nearEnd = this.videoElement.duration - 0.5;
      if (this.videoElement.currentTime < nearEnd && !this.videoElement.paused) {
        this.videoElement.currentTime = nearEnd;
        this.videoElement.pause();
      }
    }
  };

  constructor() {
    const id = inject(PLATFORM_ID);

    this.platformId = id;
    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth;
      this.innerHeigth = window.innerHeight;
      //this.commentId = this.router.getCurrentNavigation().extras.state.commentId;
      // Leer autoplay - default true si no existe
      const autoPlayValue = this.localStorage.getItem('autoPlay');
      this.autoplay = autoPlayValue !== 'false';
      // Leer autoplay next - default true si no existe
      const autoPlayNextValue = this.localStorage.getItem('autoPlayNext');
      this.autoplayNext = autoPlayNextValue !== 'false' && autoPlayNextValue !== false;
      // Leer subtítulos - default true si no existe (clave: autoSubtitle)
      const subtitlesValue = this.localStorage.getItem('autoSubtitle');
      this.subtitlesVisible = subtitlesValue !== 'false' && subtitlesValue !== false;
      // this.autoplayNext = this.storageService.getItem('autoPlayNext');
      if (this.authService.isLoggedIn()) {
        this.authService
          .getUserData()
          .pipe(takeUntilDestroyed())
          .subscribe((res: any) => {
            this.authService.setUserData(res);
          });
        this.authService.user$.pipe(takeUntilDestroyed()).subscribe(user => {
          if (user) {
            this.user = user;
            this.obtener_descarga();
            this.obtenerCalidadMaxima();
          }
          /* else {
            this.chatService.login('anonimo', 'undefined', this.video.id);
          } */
        });
      }
    }
  }

  // HostListener disabled to allow Shaka UI to handle keyboard shortcuts natively.
  // If you need to re-enable the app-level handler, uncomment the decorator below.
  // @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (
      (event.target as any).type == 'text' ||
      (event.target as any).type == 'password' ||
      (event.target as any).type == 'search'
    )
      return;

    switch (event.key) {
      case 'f':
        this.openFullscreen();
        event.preventDefault();
        break;
      case ' ':
        this.playPause();
        event.preventDefault();
        break;
      case 'm':
        this.muteUnmute();
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.videoElement.volume += 0.1;
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.videoElement.volume -= 0.1;
        if (this.videoElement.volume == 0) this.videoElement.muted = true;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.videoElement.currentTime -= 5;
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.videoElement.currentTime += 5;
        event.preventDefault();
        break;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleVolumeKeys(event: KeyboardEvent) {
    const targetType = (event.target as any)?.type;
    if (
      targetType === 'text' ||
      targetType === 'password' ||
      targetType === 'search'
    )
      return;

    if (!this.videoElement) return;

    if (event.key === 'ArrowUp') {
      this.videoElement.volume = Math.min(
        1,
        (this.videoElement.volume || 0) + 0.05,
      );
      if (this.videoElement.volume > 0) this.videoElement.muted = false;
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'ArrowDown') {
      this.videoElement.volume = Math.max(
        0,
        (this.videoElement.volume || 0) - 0.05,
      );
      if (this.videoElement.volume === 0) this.videoElement.muted = true;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  handlePlayPauseKey(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    const target = event.target as any;
    const tag =
      target && target.tagName ? String(target.tagName).toLowerCase() : '';
    const inputTypes = ['text', 'password', 'search', 'email', 'tel', 'url'];
    const targetType = (target as any)?.type;
    const isEditable =
      tag === 'input' ||
      tag === 'textarea' ||
      (target as HTMLElement)?.isContentEditable ||
      inputTypes.includes(targetType);
    if (isEditable) return;
    if (!this.videoElement) return;

    const isSpace =
      event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
    if (isSpace) {
      try {
        if (this.videoElement.paused) {
          this.videoElement.play();
        } else {
          this.videoElement.pause();
        }
      } catch (e) {
        // ignore play() promise rejections
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Prevent fullscreen toggle when user is typing in any input/textarea/contenteditable
  @HostListener('document:keydown', ['$event'])
  preventFullscreenWhileTyping(event: KeyboardEvent) {
    const active = (document && document.activeElement) as HTMLElement | null;
    if (!active) return;

    const tag = active.tagName?.toLowerCase();
    const inputTypes = ['text', 'password', 'search', 'email', 'tel', 'url'];
    const targetType = (active as any)?.type;

    const isEditable =
      tag === 'input' ||
      tag === 'textarea' ||
      (active as HTMLElement).isContentEditable ||
      inputTypes.includes(targetType);

    // If the user is typing, allow the character to be entered but stop other
    // listeners (like Shaka UI) from acting on these shortcut keys.
    const keyLower = (event.key || '').toString().toLowerCase();
    const isSpaceKey =
      event.code === 'Space' || keyLower === ' ' || keyLower === 'spacebar';

    if (
      isEditable &&
      (keyLower === 'f' || keyLower === 'm' || keyLower === 'c' || isSpaceKey)
    ) {
      // Allow default so the character is typed, but prevent other listeners
      // from receiving the event and triggering player shortcuts.
      event.stopImmediatePropagation();
    }
  }

  // Capture-phase handler to ensure Space and 'm' control the player in window mode
  private documentKeydownCapture = (event: KeyboardEvent) => {
    // Prefer the actual event target (more accurate for shadow/custom elements)
    const target = (event.target as HTMLElement) || null;
    const active = (document && document.activeElement) as HTMLElement | null;
    const inputTypes = ['text', 'password', 'search', 'email', 'tel', 'url'];

    const targetTag = target?.tagName?.toLowerCase() || '';
    const targetType = (target as any)?.type;
    const targetEditable =
      targetTag === 'input' ||
      targetTag === 'textarea' ||
      (target as HTMLElement)?.isContentEditable ||
      inputTypes.includes(targetType);

    const activeTag = active?.tagName?.toLowerCase() || '';
    const activeType = (active as any)?.type;
    const activeEditable =
      activeTag === 'input' ||
      activeTag === 'textarea' ||
      (active as HTMLElement)?.isContentEditable ||
      inputTypes.includes(activeType);

    // If user is typing (either event.target or document.activeElement is editable), do nothing here.
    if (targetEditable || activeEditable) return;

    const key = (event.key || '').toLowerCase();
    const isSpace =
      event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';

    if (isSpace) {
      // Prevent default scrolling before toggling play/pause
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      try {
        if (this.videoElement) {
          if (this.videoElement.paused) this.videoElement.play();
          else this.videoElement.pause();
        }
      } catch (e) {}
      return;
    }

    if (key === 'c') {
      try {
        this.setSubtitlesVisibility(!this.subtitlesVisible);
        if (this.subtitleToggleButton) {
          this.subtitleToggleButton.innerHTML = `<span class="material-icons">${this.subtitlesVisible ? 'subtitles' : 'subtitles_off'}</span>`;
        }
      } catch (e) {}
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }

    if (key === 'm') {
      if (this.videoElement) {
        this.videoElement.muted = !this.videoElement.muted;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  };

  // Prevent default on keyup for Space to avoid browser scroll in some browsers
  private documentKeyupCapture = (event: KeyboardEvent) => {
    const target = (event.target as HTMLElement) || null;
    const active = (document && document.activeElement) as HTMLElement | null;
    const inputTypes = ['text', 'password', 'search', 'email', 'tel', 'url'];

    const targetTag = target?.tagName?.toLowerCase() || '';
    const targetType = (target as any)?.type;
    const targetEditable =
      targetTag === 'input' ||
      targetTag === 'textarea' ||
      (target as HTMLElement)?.isContentEditable ||
      inputTypes.includes(targetType);

    const activeTag = active?.tagName?.toLowerCase() || '';
    const activeType = (active as any)?.type;
    const activeEditable =
      activeTag === 'input' ||
      activeTag === 'textarea' ||
      (active as HTMLElement)?.isContentEditable ||
      inputTypes.includes(activeType);

    if (targetEditable || activeEditable) return;

    const isSpace =
      event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
    if (isSpace) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    }
  };

  // Some browsers (notably older Firefox behavior) may trigger page scroll
  // on the `keypress` event. Add a capture-phase keypress handler to
  // reliably prevent the default action when Space is pressed.
  private documentKeypressCapture = (event: KeyboardEvent) => {
    const target = (event.target as HTMLElement) || null;
    const active = (document && document.activeElement) as HTMLElement | null;
    const inputTypes = ['text', 'password', 'search', 'email', 'tel', 'url'];

    const targetTag = target?.tagName?.toLowerCase() || '';
    const targetType = (target as any)?.type;
    const targetEditable =
      targetTag === 'input' ||
      targetTag === 'textarea' ||
      (target as HTMLElement)?.isContentEditable ||
      inputTypes.includes(targetType);

    const activeTag = active?.tagName?.toLowerCase() || '';
    const activeType = (active as any)?.type;
    const activeEditable =
      activeTag === 'input' ||
      activeTag === 'textarea' ||
      (active as HTMLElement)?.isContentEditable ||
      inputTypes.includes(activeType);

    if (targetEditable || activeEditable) return;

    const isSpace =
      event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
    if (isSpace) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    }
  };

  get currentVolume() {
    if (this.player) {
      return this.player.getVolume();
    }
    return 50;
  }

  get maxDuration() {
    if (this.player) {
      return this.player.getDuration();
    }
    return 100;
  }

  get currentTime() {
    if (this.player) {
      return this.player.getCurrentTime();
    }
    return 0;
  }

  get precioReproduccion() {
    if (this.video.precios && this.video.precios.length) {
      return (
        this.video.precios.find(precio => precio.tipo === 'reproduccion')
          ?.valor || null
      );
    }
    return '';
  }

  get precioRenta() {
    if (this.video.precios && this.video.precios.length) {
      return (
        this.video.precios.find(precio => precio.tipo === 'renta')?.valor ||
        null
      );
    }
    return '';
  }

  get precioDescarga() {
    if (this.video && this.video.precios && this.video.precios.length) {
      return (
        this.video.precios.find(precio => precio.tipo === 'descarga')?.valor ||
        null
      );
    }
    return '';
  }

  handleUser(user) {
    if (user) {
      this.loggedUser = user;
      this.isLoggedIn = true;
      this.disabled = false;
      this.initSubscription();
    } else {
      this.subscribed = false;
      this.loggedUser = null;
      this.isLoggedIn = false;
      this.disabled = true;
      this.liked = false;
      this.disliked = false;
    }
  }

  ngOnInit() {
    // Esperar a que el usuario esté disponible y activar modo cine si corresponde
    this.waitForUserAndActivateCineMode();

    // Escuchar notificaciones de pago para refetchear membresía y publicación
    this.subs.add(
      this.authService.payment$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((notification: any) => {
          if (notification && notification.tipo === 'notificacion_pago') {
            this.checkMembership();
            this.loadVideos(true);
          }
        })
    );

    this.displayNext = false;
    // Obtener los segundos de publicidad del beneficio del plan
    const adConfig = this.getAdvertisementConfig();
    this.adCountdown = adConfig.seconds;
    console.log('[Ads] Configuración de publicidad:', adConfig);

    // Load ads list from public/ads.json via AdsService
    try {
      this.adsService.getAds().subscribe({
        next: data => {
          this.adsPicta = data || [];
          this.adsNumber = this.adsPicta.length
            ? Math.floor(Math.random() * this.adsPicta.length)
            : 0;
        },
        error: () => {
          this.adsPicta = [];
          this.adsNumber = 0;
        },
      });
    } catch (e) {
      this.adsPicta = [];
      this.adsNumber = 0;
    }
    //this.loadVideos();
  }

  ngAfterViewInit() {
    this.loadVideos();
    // Attach capture-phase keydown listener to prioritize app shortcuts over Shaka in window mode
    if (isPlatformBrowser(this.platformId)) {
      // Ensure listeners are non-passive so preventDefault() works reliably
      document.addEventListener('keydown', this.documentKeydownCapture, {
        capture: true,
        passive: false,
      });
      document.addEventListener('keyup', this.documentKeyupCapture, {
        capture: true,
        passive: false,
      });
      // Also listen for keypress to catch Space scroll behavior in some browsers (Firefox)
      document.addEventListener('keypress', this.documentKeypressCapture, {
        capture: true,
        passive: false,
      });
    }
  }

  async initPlayer() {
    // Main content playback: ensure ad UI stays hidden.
    this.showAd = false;
    
    // Timeout para ocultar después de 3 segundos (se activa cuando el video reproduce)
    if (this.titleOverlayTimeoutId) {
      clearTimeout(this.titleOverlayTimeoutId);
    }

    this.player = new shaka.Player();
    this.player.attach(this.videoElement);

    this.listener = new shaka.util.EventManager();

    this.listener.listen(this.videoElement, 'ended', (event: any) => {
      this.OnEnded();
    });

    this.listener.listen(this.videoElement, 'play', (event: any) => {
      this.OnPlay();
      this.countReproduccion();
      this.showVideoTitle('play');
    });

    this.listener.listen(this.videoElement, 'volumechange', (event: any) => {
      this.saveVolume();
    });

    this.listener.listen(this.videoElement, 'pause', (event: any) => {
      this.showVideoTitle('pause');
      this.OnPaused();
    });

    this.listener.listen(this.videoElement, 'playing', (event: any) => { 
      this.OnPlay(); 
    });
    //this.listener.listen(this.videoElement, 'seeking', (event: any) => { this.OnPlay(); });
    //this.listener.listen(this.videoElement, 'seeked', (event: any) => { this.OnPlay(); });

    // Listen for error events.
    this.player.addEventListener('error', this.onErrorEvent.bind(this));

    const config: any = {
      seekBarColors: {
        base: 'rgba(255,255,255,.2)',
        buffered: 'rgba(255,255,255,.4)',
        played: 'rgb(232, 70, 46)',
      },
      bigButtons: ['play_pause'],
      customContextMenu: true,
      contextMenuElements: ['statistics', 'loop', 'picture_in_picture'],
      statisticsList: ['width', 'height', 'playTime', 'bufferingTime'],
      // Enable Shaka native keyboard shortcuts and configure seek distances
      enableKeyboardPlaybackControls: true,
      enableKeyboardPlaybackControlsInWindow: true,
      keyboardSeekDistance: 5,
      keyboardLargeSeekDistance: 30,
      // Keep standard controls and place a captions toggle left of the settings (overflow_menu)
      controlPanelElements: [
        'play_pause',
        'mute',
        'volume',
        'time_and_duration',
        'spacer',
        'overflow_menu', // configuration button (settings)
        'picture_in_picture',
        'fullscreen',
      ],
      // Configure which items appear in the overflow/settings menu
      overflowMenuButtons: ['captions', 'language', 'playback_rate', 'quality'],
    };

    if (this.ui) {
      this.ui.destroy();
      this.ui = new shaka.ui.Overlay(
        this.player,
        this.videoContainerElement,
        this.videoElement,
      );
      this.ui.configure(config);
    } else {
      this.ui = new shaka.ui.Overlay(
        this.player,
        this.videoContainerElement,
        this.videoElement,
      );
      this.ui.configure(config);
    }

    // Obtener referencia a los controles
    this.controls = this.ui.getControls();

    let videoUrl;

    let subUrl = this.video.url_subtitulo;
    let mime = 'application/dash+xml';

    const forcedManifest = this.getForcedManifestByVideoId(this.video?.id);

    let videoId: string = null;
    try {
      videoId = this.extractVideoIdFromManifestUrl(
        forcedManifest || this.video.url_manifiesto,
      );
    } catch {
      videoId = null;
    }

    if (forcedManifest) {
      videoUrl = forcedManifest;
      mime = 'application/x-mpegurl';
      this.video.url_manifiesto = forcedManifest;
      // Configurar player para streaming en vivo
      this.player.configure({
        streaming: {
          lowLatencyMode: true,
        },
      });
    } else if (
      this.isLiveVideoType(this.video?.tipo) &&
      !this.video.categoria.live?.finalizado
    ) {
      mime = 'application/x-mpegurl';
      if (
        this.video.canal.nombre == 'Variedades' ||
        this.video.canal.nombre === 'Música Dj Virtual'
      ) {
        let url = this.video.url_manifiesto.replace('/live/', '/tv/');
        videoUrl = `${url}`;
      } else {
        videoUrl = this.video.url_manifiesto;
      }
      this.player.configure({
        streaming: {
          lowLatencyMode: true,
        },
        //addSeekBar: false
      });
    } else {
      if (this.platform.SAFARI && !this.isLiveVideoType(this.video?.tipo)) {
        let url = this.video.url_manifiesto.slice(0, -12);
        videoUrl = `${url}master.m3u8`;
        mime = 'application/x-mpegurl';
      } else {
        let url = this.video.url_manifiesto.replace('/live/', '/tv/');
        videoUrl = `${url}`;
      }
    }
    if (
      typeof videoUrl === 'string' &&
      videoUrl.toLowerCase().endsWith('.m3u8')
    ) {
      mime = 'application/x-mpegurl';
    }

    this.originalVideoUrl = videoUrl;

    // Leer idioma de audio del localStorage (clave: language)
    // Valores: "auto", "spa", "eng" - default: "auto"
    // Convertir códigos ISO 639-2 (spa, eng) a ISO 639-1 (es, en) que acepta Shaka
    const langCodeMap: { [key: string]: string } = {
      'spa': 'es',
      'eng': 'en'
    };
    const savedLanguage = this.localStorage.getItem('language') || 'auto';
    const language = langCodeMap[savedLanguage] || savedLanguage;

    const playerConfig: any = {
      // Shaka v5.1+ preferredAudio - configuración de idioma de audio
      preferredAudio: language && language !== 'auto' ? [
        { language: language }
      ] : [],
      abr: {
        //enabled: false,
        defaultBandwidthEstimate: 500000,
      },
      streaming: {
        bufferingGoal: 120,
        rebufferingGoal: 1,
        bufferBehind: 120,
        retryParameters: {
          timeout: 0, // timeout in ms, after which we abort
          stallTimeout: 0, // stall timeout in ms, after which we abort
          connectionTimeout: 0, // connection timeout in ms, after which we abort
          maxAttempts: 10, // the maximum number of requests before we fail
          baseDelay: 1000, // the base delay in ms between retries
          backoffFactor: 2, // the multiplicative backoff factor between retries
          fuzzFactor: 0.5, // the fuzz factor to apply to each retry delay
        },
      },
      // Get preferred text language user set - Shaka v5.1+ usa preferredText array
      // Nota: Los subtítulos se muestran/ocultan con setTextTrackVisibility, no aquí
      preferredText: [
        { language: language || 'es' }
      ],
      // Aplicar restricciones de calidad según el plan del usuario
      // Esto filtra las calidades superiores en el menú de calidad
      restrictions: {
        maxHeight: this.getCalidadMaximaPlan(),
      },
    };

    if (videoId) {
      playerConfig.drm = {
        clearKeys: {
          [videoId]: this.reverseString(videoId),
        },
      };
    }

    this.player.configure(playerConfig);
    // If video is ended live, change mime to HLS
    if (this.video.categoria.live?.finalizado) {
      mime = 'application/x-mpegurl';
    }

    /*     if( this.video.tipo == 'live'){
      this.ui.configure(this.liveConfig);
    } else {
      if(this.innerWidth > 600){
        this.ui.configure(this.videoFullConfig);
      } else {
        this.ui.configure(this.videoShortConfig);
      }
    } */

    this.controls = this.ui.getControls();

    // Get time if user has played video
    const time = JSON.parse(this.localStorage.getItem(this.video.slug_url));

    // Blindaje final: si existe mapeo por id, siempre usar ese manifiesto.
    const finalForcedManifest = this.getForcedManifestByVideoId(this.video?.id);
    if (finalForcedManifest) {
      this.video.url_manifiesto = finalForcedManifest;
      videoUrl = finalForcedManifest;
      mime = 'application/x-mpegurl';
      this.originalVideoUrl = finalForcedManifest;
    }

    // Try to load a manifest.
    // This is an asynchronous process.
    try {
      await this.player.load(videoUrl, time, mime).then(() => {
        if (this.localStorage.getItem('volume')) {
          this.videoElement.volume = this.localStorage.getItem('volume');
        }
        // Mostrar overlay DESPUÉS de que el video carga
        this.showPlayerOverlay = true;
        
        // Aplicar la calidad maxima configurada por el usuario
        this.aplicarCalidadUsuario();
        
        // Seleccionar track de audio según preferencia del usuario
        if (language && language !== 'auto' && this.player.getAudioTracks) {
          const audioTracks = this.player.getAudioTracks();
          const desiredTrack = audioTracks.find((track: any) => 
            track.language && track.language.toLowerCase().includes(language.toLowerCase())
          );
          if (desiredTrack) {
            this.player.selectAudioTrack(desiredTrack);
          }
        }
      });
    } catch (e) {
      // onError is executed if the asynchronous load fails.
      this.onError(e);
    }
    const textTracks = this.player.getTextTracks();
    const hasTextTracks = textTracks.length > 0;
    this.hasInternalTextTracks = hasTextTracks;

    // Read user's autosubtitle preference (stored as string or boolean)
    const autoSub = this.localStorage.getItem('autoSubtitle');
    // Default to true when no preference is saved
    const autoSubBool =
      autoSub === null || autoSub === undefined
        ? true
        : autoSub === 'true' || autoSub === true;

    if (hasTextTracks) {
      // Manifest already includes text tracks — respect user's preference
      try {
        this.setSubtitlesVisibility(!!autoSubBool);
      } catch (err) {
        console.warn(
          'Error setting text track visibility for embedded tracks',
          err,
        );
      }
    } else if (subUrl) {
      // Only add external subtitle when there are no embedded text tracks
      try {
        await this.player.addTextTrackAsync(
          subUrl + '.vtt',
          'es',
          'subtitle',
          'text/vtt',
        );
        this.setSubtitlesVisibility(!!autoSubBool);
      } catch (err) {
        console.warn('Error adding external subtitle track', err);
      }
    }

    // Show custom subtitles toggle only when external subtitle URL exists.
    if (this.video?.url_subtitulo) {
      this.addSubtitleToggleButton();
      // Wait for subtitle button to be in DOM, then add cine mode and skip buttons
      setTimeout(() => {
        this.addCineModeButton();
        this.addDownloadButton();
        this.addPlaylistButton();
        if (this.canGoToPrevious()) {
          this.addSkipPreviousButton();
        }
        if (this.canGoToNext()) {
          this.addSkipNextButton();
        }
      }, 100);
    } else {
      this.removeSubtitleToggleButton();
      // Add buttons directly
      this.addCineModeButton();
      this.addDownloadButton();
      this.addPlaylistButton();
      if (this.canGoToPrevious()) {
        this.addSkipPreviousButton();
      }
      if (this.canGoToNext()) {
        this.addSkipNextButton();
      }
    }

    // Reproducir automáticamente si el usuario tiene esa preferencia
    if (this.autoplay) {
      this.videoElement?.play().catch(() => {
        // El navegador puede bloquear el autoplay si no hay interacción
        console.log('[Autoplay] Bloqueado por el navegador');
      });
    }
  }

  private reverseString(str: string): string {
    // Validación adicional para evitar el error
    if (typeof str !== 'string') {
      console.error('Error: reverseString recibió:', str, typeof str);
      throw new Error('El parámetro debe ser un string');
    }

    return str.split('').reverse().join('');
  }

  // En tu servicio Angular
  extractVideoIdFromManifestUrl(manifestUrl: string): string {
    // Ejemplo: "https://videos.picta.cu/videos/78191487fa424dc6b7be1927ac0a8477/manifest.mpd"
    // Ejemplo live: "https://live.picta.cu/live/5f44e3443e5242c58b193e47c50a157e.m3u8"
    const parts = manifestUrl.split('/');

    // Para videos live, el ID está en el último segmento con extensión .m3u8
    if (manifestUrl.includes('/live/') && manifestUrl.endsWith('.m3u8')) {
      const lastPart = parts[parts.length - 1];
      // Remover la extensión .m3u8 para obtener el ID
      const videoId = lastPart.replace('.m3u8', '');

      // Validar que sea un UUID válido (32 caracteres hexadecimales)
      if (videoId && videoId.length === 32 && /^[0-9a-f]+$/.test(videoId)) {
        return videoId;
      }
    } else {
      // Para videos normales, el UUID está en la penúltima posición
      const videoId = parts[parts.length - 2];

      // Validar que sea un UUID válido (32 caracteres hexadecimales)
      if (videoId && videoId.length === 32 && /^[0-9a-f]+$/.test(videoId)) {
        return videoId;
      }
    }

    throw new Error('URL de manifiesto no válida o UUID no encontrado');
  }

  initSubscription() {
    this.meta.addTags([
      { name: 'description', content: this.video.descripcion },
      { name: 'keywords', content: this.video.palabraClave },
      { name: 'author', content: this.video.canal.alias },
      { property: 'og:title', content: this.video.nombre },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://www.picta.cu' },
      { property: 'og:image', content: this.video.url_imagen + '200x200' },
      { property: 'og:description', content: this.video.descripcion },
      { name: 'twitter:card', content: this.video.url_imagen + '200x200' },
      { name: 'twitter:title', content: this.video.nombre },
      { name: 'twitter:description', content: this.video.descripcion },
      { name: 'twitter:image', content: this.video.url_imagen + '200x200' },
    ]);
    if (this.isLoggedIn && this.loggedUser && this.canal) {
      this.subscriptionLoading = true;
      if (this.video && this.video.categoria.live) {
        this.chatService.login(
          this.user.username,
          this.user.avatar,
          this.video.id,
        );
      }
      this.subs.add(
        this.subscribeService
          .getSubscriptionsByUser({
            usuarioNombre: this.loggedUser.username,
            canalId: this.canal.id,
          })
          .pipe(finalize(() => {
            this.subscriptionLoading = false;
          }))
          .subscribe((res: any) => {
            this.subscription = res.results.filter(
              sub => sub.canal.id === this.canal.id,
            )[0] || null;
            this.subscribed = !!this.subscription;
            // set notification mode according to localStorage only when subscribed
            this.notificationMode = this.subscribed
              ? this.checkIfSilenced()
                ? 'none'
                : 'all'
              : 'all';
          }),
      );
    }
  }

  getVoto() {
    if (this.isLoggedIn) {
      this.subs.add(
        this.votoService
          .getVotoByPublicacion(this.video.id)
          .subscribe((res: any) => {
            if (res.results.length > 0) {
              this.votoExistente = res.results[0];
              res.results[0].valor
                ? (this.liked = true)
                : (this.disliked = true);
            }
          }),
      );
    }
  }

  loadVideos(fromPayment = false, slug_url: string = this.slug_url) {
    // Resetear overlay cuando se cambia de video - siempre oculto hasta que el video esté listo
    this.titleOverlay = false;
    this.showPlayerOverlay = false;
    if (this.titleOverlayTimeoutId) {
      clearTimeout(this.titleOverlayTimeoutId);
    }
    
    this.publicacionService.loadPublication(slug_url).subscribe(response => {
      if (response.results.length > 0) {
        this.mediaNotFound = false;
        this.video = response.results[0];
        this.loading = false;
        this.poster = this.video.url_imagen + '_1280x720';
        // NO llamar calcularSiguiente() aquí - se llama después de cargar playlist y recomendaciones
        if (this.user && isPlatformBrowser(this.platformId)) {
          this.countVisit(this.user.username);
        } else {
          this.countVisit('anonimo');
        }
        if (this.video.categoria?.live) {
          this.chatService.getOnline().subscribe(data => {
            this.online = data;
          });
        }
        this.title.setTitle(this.video.nombre);

        this.checkType();

        const { playlist } = this.route.snapshot.data;
        if (playlist && playlist.length) {
          if (playlist[0].publicacion.some(p => p.id === this.video.id)) {
            this.playlist = playlist[0];
            this.hasPlayList = true;
            this.isUserPlayList = true;
          } else {
            this.snackBar.open(
              'Este video no pertenece a la lista de reproducción especificada.',
            );
          }
        }
        this.listaReproduccionCanalService
          .getVideosRecomendados(this.video.id, {
            tipologia_nombre: this.video.categoria.tipologia.modelo,
          })
          .subscribe(async (res: PictaResponse<Publication>) => {
            this.videosRecomendados = res.results;
            // Calcular el siguiente video después de cargar recomendaciones
            this.calcularSiguiente();
            setTimeout(() => {
              if (isPlatformBrowser(this.platformId)) {
                shaka.polyfill.installAll();
                if (shaka.Player.isBrowserSupported()) {
                  this.videoElement = this.videoElementRef().nativeElement;
                  this.videoContainerElement =
                    this.videoContainerRef().nativeElement;
                }
                if (this.isLiveVideoType(this.video?.tipo)) {
                  if (this.video.only_subs && !this.video.url_manifiesto) {
                    this.premium = true;
                    this.isAdPlaying = false;
                    this.initPlayer();
                  } else {
                    // Verificar si es un canal de TV en vivo del switch y si debe mostrar publicidad
                    const isLiveTVChannel = this.isLiveTVChannel(
                      this.video?.id,
                    );
                    if (isLiveTVChannel) {
                      // Es canal de TV en vivo, verificar si el usuario debe ver publicidad
                      const shouldShowAds = this.shouldShowAdvertisement();
                      if (shouldShowAds) {
                        // Mostrar publicidad antes del canal de TV
                        this.isAdPlaying = true;
                        this.loadAd();
                      } else {
                        // Usuario con plan sin publicidad, ir directo al video
                        this.isAdPlaying = false;
                        this.initPlayer();
                      }
                    } else {
                      // Es un video live normal (no canal de TV), ir directo sin publicidad
                      this.isAdPlaying = false;
                      this.initPlayer();
                    }
                  }
                } else if (this.video.tipo == 'publicacion') {
                  if (this.video.url_manifiesto) {
                    this.premium = false;
                    if (
                      this.video.categoria.tipologia.modelo == 'pelicula' ||
                      this.video.categoria.tipologia.modelo == 'capitulo'
                    ) {
                      if (this.authService.isLoggedIn()) {
                        this.obtener_publicidad();
                        this.obtener_plan_nombre();
                        const shouldShowAds = this.shouldShowAdvertisement();
                        if (shouldShowAds) {
                          if (this.video.url_manifiesto == '') {
                            this.isAdPlaying = false;
                          } else {
                            this.isAdPlaying = true;
                          }
                          this.loadAd();
                        } else {
                          this.isAdPlaying = false;
                          this.initPlayer();
                        }
                      } else {
                        this.isAdPlaying = true;
                        this.loadAd();
                      }
                    } else {
                      this.isAdPlaying = false;
                      this.initPlayer();
                    }
                  } else {
                    this.premium = true;
                    this.isAdPlaying = false;
                    this.initPlayer();
                  }
                } else {
                  delete this.hasPlayList;
                  delete this.isUserPlayList;
                  delete this.playlist;
                }
              }
            });
          });
        if (!this.playlist) {
          if (this.video.lista_reproduccion_canal.length === 1) {
            const { id } = this.video.lista_reproduccion_canal[0];
            this.listaReproduccionCanalService
              .getPlaylist(id)
              .subscribe(res => {
                if (res && res.length > 0 && res[0].publicado) {
                  this.hasPlayList = true;
                  this.isUserPlayList = false;
                  this.playlist = res[0];
                  let index = res[0].publicaciones.findIndex(
                    p => p.id === this.video.id,
                  );
                  if (index < res[0].publicaciones.length - 1) {
                    this.siguiente = res[0].publicaciones[index + 1];
                  } else if (this.videosRecomendados && this.videosRecomendados.length > 0) {
                    // Si no hay siguiente en playlist, usar el primero de recomendaciones
                    this.siguiente = this.videosRecomendados[0];
                  }
                  this.playlist.canal.slug_url = this.video.canal.slug_url;
                }
              });
          } else {
            this.hasPlayList = false;
            delete this.playlist;
          }
        } else {
          if (!this.isUserPlayList) {
            if (this.video.lista_reproduccion_canal.length === 1) {
              const { id } = this.video.lista_reproduccion_canal[0];
              if (this.playlist.id !== id) {
                this.listaReproduccionCanalService
                  .getPlaylist(id)
                  .subscribe(res => {
                    if (res && res.length > 0 && res[0].publicado) {
                      this.hasPlayList = true;
                      this.playlist = res[0];
                      this.playlist.canal.slug_url = this.video.canal.slug_url;
                    }
                  });
              }
            } else {
              delete this.hasPlayList;
              delete this.isUserPlayList;
              delete this.playlist;
            }
          }
        }
        this.commentsPage = 1;
        this.loadComentarios();
        this.fechaPublicado = format(
          parseISO(this.video.fecha_publicado),
          'PPP',
          { locale: es },
        );
        this.setHrefs();
        this.getVoto();
        this.likes = this.video.cantidad_me_gusta;
        this.dislikes = this.video.cantidad_no_me_gusta;
        this.canal = this.video.canal;
        this.checkMembership();
        // initialize notification mode based on localStorage silenced channels
        this.notificationMode = this.checkIfSilenced() ? 'none' : 'all';
        // Fallback mapping: la publicación 2502 corresponde a Telerebelde
        // Si el canal no trae `idEprog`, asignarlo desde el mapeo conocido.
        try {
          // Fallback mappings for known channels without idEprog
          if ((!this.canal || !this.canal.idEprog) && this.video) {
            if (!this.canal) this.canal = {} as any;
            switch (this.video.id) {
              case 2501: // Cubavision
                this.canal.idEprog = '5c096ea5bad1b202541503cf';
                break;
              case 56343: // Canal Caribe HD
                this.canal.idEprog = '5c5357124929db17b7429949';
                break;
              case 56345: // Cubavision HD
                this.canal.idEprog = '5c5356f94929db17b7429947';
                break;
              case 55886: // Canal Habana
                this.canal.idEprog = '5c42407f4fa5d131ce00f864';
                break;
              case 55887: // Canal Educativo
                this.canal.idEprog = '596c6d4f769cf31454a473ab';
                break;
              case 55864: // Canal Clave
                this.canal.idEprog = '5a6a056c6c40dd21604965fd';
                break;
              case 366: // Cubavision Internacional
                this.canal.idEprog = '5c42078b4fa5d131ce00f85e';
                break;
              case 2504: // Canal Caribe
                this.canal.idEprog = '5c5357124929db17b7429949';
                break;
              case 33959: // Multivision
                this.canal.idEprog = '597eed8948124617b0d8b23a';
                break;
              case 2502: // Telerebelde fallback
                this.canal.idEprog = '596c6d34769cf31454a473aa';
                break;
              default:
                // no mapping
                break;
            }
            // Ensure title is present
            if (!this.canal.titulo && this.canal.nombre)
              this.canal.titulo = this.canal.nombre;
          }
        } catch (e) {
          console.warn('Error aplicando mapeo idEprog fallback', e);
        }
        this.initSubscription();
        // Update sidebar ad visibility based on user plan/benefits
        try {
          this.obtener_publicidad();
          this.obtener_plan_nombre();
          this.showSidebarAd = this.shouldShowAdvertisement();
        } catch (e) {
          this.showSidebarAd = true;
        }

        if (
          (this.type === 'live' &&
            this.video.categoria?.live?.evento !== null &&
            this.video.categoria?.live?.evento !== undefined) ||
          this.video.categoria.eventotipologia?.evento?.precio
        ) {
          if (this.video.precios || this.video.only_subs) {
            this.premium = true;
          }
        }

        if (this.authService.isLoggedIn()) {
          // Priorizar datos del usuario ya cargados en el componente (mas actualizados)
          const userForInit = this.user || this.authService.userData;
          if (userForInit) {
            this.handleUser(userForInit);
          }
        }
        this.subs.add(
          this.authService.user$.subscribe(user => {
            this.handleUser(user);
            /* if (this.premium === true) {
               this.loadVideos();
             }*/
            if (user) {
              this.getVoto();
            }
          }),
        );
        this.readMore = this.video?.descripcion?.length <= 101;
        if (this.video.descripcion === 'null')
          this.video.descripcion = 'Sin descripción';
      } else {
        this.mediaNotFound = true;
        this.title.setTitle('Publicación no encontrada - Picta');
        this.meta.updateTag({
          name: 'description',
          content: 'Publicación no encontrada',
        });
        delete this.video;
        delete this.videosRecomendados;
        this.loading = false;
        if (this.player) {
          this.player.destroy();
        }
      }
    });
  }

  async loadAd() {
    // Ad playback: ensure overlay stays hidden during ads.
    this.showAd = true;
    this.showPlayerOverlay = false;
    this.titleOverlay = false;
    if (this.titleOverlayTimeoutId) {
      clearTimeout(this.titleOverlayTimeoutId);
    }
    
    this.player = new shaka.Player();
    this.player.attach(this.videoElement);

    this.listener = new shaka.util.EventManager();
    this.listener.listen(this.videoElement, 'ended', (event: any) => {
      this.OnEndedAds();
    });

    this.listener.listen(this.videoElement, 'play', (event: any) => {
      // Comienza el contador para saltar la publicidad
      this.startAdCountdown();
    });

    this.listener.listen(this.videoElement, 'pause', (event: any) => {
      // Pausa el contador para saltar la publicidad
      //clearInterval(this.countdownInterval);
    });

    this.ui = new shaka.ui.Overlay(
      this.player,
      this.videoContainerElement,
      this.videoElement,
    );

    this.controls = this.ui.getControls();

    this.videoElement.muted = true;

    this.ui.configure(this.adConfig);
    let adUrl;
    if (this.platform.SAFARI && !this.isLiveVideoType(this.video?.tipo)) {
      adUrl = this.adsPicta[this.adsNumber].m3u8; // Reemplaza con la URL de tu anuncio
    } else {
      adUrl = this.adsPicta[this.adsNumber].url; // Reemplaza con la URL de tu anuncio
    }

    this.listener.listen(this.videoElement, 'play', (event: any) => {});

    await this.player
      .load(adUrl, 0)
      .then(() => {
        this.publicacionService
          .countReproduccion(
            this.adsPicta[this.adsNumber].id,
            this.authService.isLoggedIn(),
          )
          .subscribe();
      })
      .catch((e: any) => {
console.error(e);
      });
          // initialize notification mode when subscribing
          this.notificationMode = this.checkIfSilenced() ? 'none' : 'all';
    this.videoElement?.play();
  }

  // Función helper para calcular el siguiente video basado en el video actual
  private calcularSiguiente() {
    if (!this.video?.id) {
      this.siguiente = null;
      return;
    }

    // Buscar el video actual en el playlist
    if (this.playlist?.publicaciones) {
      const index = this.playlist.publicaciones.findIndex(
        p => p.id === this.video.id,
      );
      // Si es el último de la lista, usar el primero de recomendaciones
      if (index >= 0 && index < this.playlist.publicaciones.length - 1) {
        this.siguiente = this.playlist.publicaciones[index + 1];
      } else if (this.videosRecomendados && this.videosRecomendados.length > 0) {
        this.siguiente = this.videosRecomendados[0];
      } else {
        this.siguiente = null;
      }
    } else if (this.playlist?.publicacion) {
      // User playlist usa 'publicacion' (singular)
      const index = this.playlist.publicacion.findIndex(
        p => p.id === this.video.id,
      );
      // Si es el último de la lista, usar el primero de recomendaciones
      if (index >= 0 && index < this.playlist.publicacion.length - 1) {
        this.siguiente = this.playlist.publicacion[index + 1];
      } else if (this.videosRecomendados && this.videosRecomendados.length > 0) {
        this.siguiente = this.videosRecomendados[0];
      } else {
        this.siguiente = null;
      }
    } else if (this.videosRecomendados && this.videosRecomendados.length > 0) {
      this.siguiente = this.videosRecomendados[0];
    } else {
      this.siguiente = null;
    }
  }

  async nextVideo(ended = false, fromNextBtn = false) {
    this.adsNumber = Math.floor(Math.random() * this.adsPicta.length);
    this.displayNext = false;
    this.stopAutoplayCountdown(); // Cancelar timer si el usuario hace click
    if (ended) {
      this.localStorage.removeItem(this.video.slug_url);
    }
    // Siempre navegar cuando se llama desde el botón
    console.log('[Skip] nextVideo called - fromNextBtn:', fromNextBtn, 'autoplayNext:', this.autoplayNext);
    
    let index;
    let next;
    
    console.log('[Skip] hasPlayList:', this.hasPlayList, 'isUserPlayList:', this.isUserPlayList);
    
    if (this.hasPlayList) {
      if (this.isUserPlayList) {
        index = this.playlist.publicacion.findIndex(
          p => p.id === this.video.id,
        );
        console.log('[Skip] User playlist index:', index, 'total:', this.playlist.publicacion.length);
        
        if (index >= 0 && index < this.playlist.publicacion.length - 1) {
          const { id } = this.playlist.publicacion[index + 1];
          console.log('[Skip] Getting next video id:', id);
          const publicaciones$ = this.publicacionService.getPublications({ id });
          const response = await lastValueFrom(publicaciones$);
          next = response.results[0].slug_url;
          console.log('[Skip] Next video slug:', next);
        } else {
          next = this.videosRecomendados?.[0]?.slug_url;
          console.log('[Skip] Last video or no playlist, using recommended');
        }
      } else {
        index = this.playlist.publicaciones.findIndex(
          p => p.id === this.video.id,
        );
        console.log('[Skip] Channel playlist index:', index);
        
        if (index >= 0 && index < this.playlist.publicaciones.length - 1) {
          next = this.playlist.publicaciones[index + 1].slug_url;
        } else {
          next = this.videosRecomendados?.[0]?.slug_url;
        }
      }
    } else {
      console.log('[Skip] No playlist, using recommended videos');
      next = this.videosRecomendados?.[0]?.slug_url;
    }
    
    if (next) {
      console.log('[Skip] Navigating to:', next);
      this.setUrlSubject(next);
    } else {
      console.log('[Skip] No next video found');
    }
  }

  /**
   * Navegar al video anterior en la playlist
   */
  async goToPreviousVideo() {
    let prev: string | undefined;
    
    console.log('[Skip] goToPreviousVideo - hasPlayList:', this.hasPlayList, 'isUserPlayList:', this.isUserPlayList);
    
    if (this.hasPlayList) {
      if (this.isUserPlayList) {
        // Playlist del usuario (publicacion)
        const index = this.playlist.publicacion.findIndex(
          p => p.id === this.video.id,
        );
        console.log('[Skip] User playlist index:', index);
        
        if (index > 0) {
          const { id } = this.playlist.publicacion[index - 1];
          console.log('[Skip] Getting previous video id:', id);
          const publicaciones$ = this.publicacionService.getPublications({ id });
          const response = await lastValueFrom(publicaciones$);
          prev = response.results[0].slug_url;
          console.log('[Skip] Previous video slug:', prev);
        } else {
          console.log('[Skip] First video, no previous');
          return;
        }
      } else {
        // Playlist del canal (publicaciones)
        const index = this.playlist.publicaciones.findIndex(
          p => p.id === this.video.id,
        );
        console.log('[Skip] Channel playlist index:', index);
        
        if (index > 0) {
          prev = this.playlist.publicaciones[index - 1].slug_url;
          console.log('[Skip] Previous video slug:', prev);
        } else {
          console.log('[Skip] First video in channel playlist');
          return;
        }
      }
    } else if (this.videosRecomendados && this.videosRecomendados.length > 0) {
      // Si no hay playlist, usar videos recomendados
      const index = this.videosRecomendados.findIndex(v => v.id === this.video.id);
      if (index > 0) {
        prev = this.videosRecomendados[index - 1].slug_url;
      } else {
        return;
      }
    }
    
    if (prev) {
      this.setUrlSubject(prev);
    }
  }

  ngOnDestroy(): void {
    // Desactivar temporalmente el modo cine para que el layout muestre toolbar/footer
    // al navegar a otras páginas. La preferencia en localStorage se mantiene.
    if (this.cineMode()) {
      this.cineModeService.deactivateForNavigation();
      this.cineMode.set(false);
    }
    
    // Clear any running timers
    if (this.checkerInterval) {
      clearInterval(this.checkerInterval);
    }
    if (this.adInterval) {
      clearInterval(this.adInterval);
    }

    // Save video time if applicable
    if (!this.mediaNotFound) {
      this.saveVideoTime();
    }

    // Destroy the player to stop all downloads and free resources
    if (this.player) {
      this.player.destroy();
    }

    // Destroy the ads player
    if (this.ads) {
      this.ads.destroy();
    }

    // Clean up video elements to prevent memory leaks
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.removeAttribute('src');
      this.videoElement.load(); // Some browsers require this to release resources
    }

    // Unsubscribe from all observables
    this.subs.unsubscribe();

    // Stop subtitle watcher
    this.stopSubtitleVisibilityWatcher();

    // Remove capture-phase listener
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('keydown', this.documentKeydownCapture, {
        capture: true,
      });
      document.removeEventListener('keyup', this.documentKeyupCapture, {
        capture: true,
      });
      document.removeEventListener('keypress', this.documentKeypressCapture, {
        capture: true,
      });
    }
  }

  private addSubtitleToggleButton(): void {
    const tryAttach = () => {
      const controlsContainer = document.querySelector(
        '.shaka-controls-button-panel',
      );
      if (!controlsContainer) {
        setTimeout(tryAttach, 200);
        return;
      }
      // Avoid duplicate buttons
      if (controlsContainer.querySelector('.shaka-subtitles-toggle-button'))
        return;

      const btn = document.createElement('button');
      btn.classList.add(
        'shaka-subtitles-toggle-button',
        'bg-transparent',
        'border-none',
        'text-white',
        'cursor-pointer',
        'p-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'w-10',
        'h-10',
      );
      btn.innerHTML = `<span class="material-icons">${this.subtitlesVisible ? 'subtitles' : 'subtitles_off'}</span>`;
      btn.addEventListener('click', () => {
        try {
          this.setSubtitlesVisibility(!this.subtitlesVisible);
          btn.innerHTML = `<span class="material-icons">${this.subtitlesVisible ? 'subtitles' : 'subtitles_off'}</span>`;
        } catch (e) {
          console.error('Error toggling subtitles', e);
        }
      });
      // keep reference for external updates
      this.subtitleToggleButton = btn;

      // Insert before overflow/settings button when possible
      const overflowBtn = controlsContainer.querySelector(
        '.shaka-overflow-button, .shaka-overflow-menu-button, .shaka-settings-button',
      );
      if (overflowBtn) {
        controlsContainer.insertBefore(btn, overflowBtn);
      } else {
        controlsContainer.appendChild(btn);
      }

      // Start watcher to sync state if user uses Shaka UI controls
      this.startSubtitleVisibilityWatcher();
    };
    tryAttach();
  }

  private removeSubtitleToggleButton(): void {
    this.stopSubtitleVisibilityWatcher();
    const controlsContainer = document.querySelector(
      '.shaka-controls-button-panel',
    );
    const existingBtn = controlsContainer?.querySelector(
      '.shaka-subtitles-toggle-button',
    );
    if (existingBtn) {
      existingBtn.remove();
    }
    this.subtitleToggleButton = null;
  }

  private addCineModeButton(): void {
    const tryAttach = () => {
      const controlsContainer = document.querySelector(
        '.shaka-controls-button-panel',
      );
      if (!controlsContainer) {
        setTimeout(tryAttach, 200);
        return;
      }
      // Avoid duplicate buttons
      if (controlsContainer.querySelector('.shaka-cine-mode-button'))
        return;

      const btn = document.createElement('button');
      btn.classList.add(
        'shaka-cine-mode-button',
        'bg-transparent',
        'border-none',
        'text-white',
        'cursor-pointer',
        'p-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'w-10',
        'h-10',
      );
      // Rectangle outline icon for cine mode (inactive state)
      const getInactiveIcon = () => `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="0" y="0" width="20" height="14" rx="2"/></svg>`;
      // Rectangle filled icon for cine mode (active state)
      const getActiveIcon = () => `<svg width="20" height="14" viewBox="0 0 20 14" fill="currentColor"><rect x="1" y="1" width="18" height="12" rx="2"/></svg>`;
      
      btn.innerHTML = getInactiveIcon();
      btn.title = 'Modo cine';
      
      // Function to update icon based on mode
      const updateIcon = () => {
        if (this.cineMode()) {
          btn.innerHTML = getActiveIcon();
          btn.title = 'Salir del modo cine';
          btn.classList.add('cine-active');
        } else {
          btn.innerHTML = getInactiveIcon();
          btn.title = 'Modo cine';
          btn.classList.remove('cine-active');
        }
      };
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const userData = this.user || this.authService.userData || this.authService.user;
        const isSubscribed = !!(userData?.subscription_plan?.nombre);
        
        console.log('cine button clicked, subscribed:', isSubscribed, 'premium:', this.premium);
        
        if (this.cineMode()) {
          this.exitCineMode();
        } else if (isSubscribed || this.premium) {
          this.enterCineMode();
        } else {
          this.openCineUpgradeModal();
        }
        
        updateIcon();
      });
      
      // Insert BEFORE settings/overflow button (rightmost position in the button panel)
      // This ensures it appears to the left of the settings button
      const settingsBtn = controlsContainer.querySelector(
        '.shaka-overflow-button, .shaka-overflow-menu-button, .shaka-settings-button',
      );
      if (settingsBtn) {
        controlsContainer.insertBefore(btn, settingsBtn);
      } else {
        // Fallback: insert at the beginning
        const firstChild = controlsContainer.firstChild;
        if (firstChild) {
          controlsContainer.insertBefore(btn, firstChild);
        } else {
          controlsContainer.appendChild(btn);
        }
      }
      
      console.log('cine mode button added');
      
      // Save reference for state updates
      this.cineButtonElement = btn;
    };
    tryAttach();
  }

  /**
   * Agregar botón de descarga al reproductor Shaka
   * Solo visible cuando el modo cine está activo
   */
  private addDownloadButton(): void {
    const tryAttach = () => {
      const controlsContainer = document.querySelector(
        '.shaka-controls-button-panel',
      );
      if (!controlsContainer) {
        setTimeout(tryAttach, 200);
        return;
      }
      // Evitar botones duplicados
      if (controlsContainer.querySelector('.shaka-download-button')) return;

      const btn = document.createElement('button');
      btn.classList.add(
        'shaka-download-button',
        'bg-transparent',
        'border-none',
        'text-white',
        'cursor-pointer',
        'p-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'w-10',
        'h-10',
      );

      // Icono de descarga (Material download)
      btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>`;
      btn.title = 'Descargar video';
      btn.setAttribute('aria-label', 'Descargar video');

      // Ocultar inicialmente (solo visible en modo cine)
      btn.style.display = 'none';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openDownload();
      });

      // Insertar después del botón de modo cine
      const cineBtn = controlsContainer.querySelector('.shaka-cine-mode-button');
      if (cineBtn && cineBtn.nextSibling) {
        controlsContainer.insertBefore(btn, cineBtn.nextSibling);
      } else {
        const settingsBtn = controlsContainer.querySelector(
          '.shaka-overflow-button, .shaka-overflow-menu-button, .shaka-settings-button',
        );
        if (settingsBtn) {
          controlsContainer.insertBefore(btn, settingsBtn);
        } else {
          controlsContainer.appendChild(btn);
        }
      }

      console.log('download button added');

      // Guardar referencia para mostrar/ocultar según modo cine
      this.downloadButtonElement = btn;

      // Sincronizar estado inicial con el modo cine actual
      if (this.cineMode()) {
        btn.style.display = 'flex';
      }
    };
    tryAttach();
  }

  /**
   * Agregar botón de playlist al reproductor Shaka
   * Solo visible cuando el modo cine está activo
   */
  private addPlaylistButton(): void {
    // NO crear el botón si lista_reproduccion_canal está vacío
    const listaCanal = this.video?.lista_reproduccion_canal;
    const hasCanalPlaylist = Array.isArray(listaCanal) && listaCanal.length > 0;
    const canShowPlaylist = hasCanalPlaylist || this.isUserPlayList;
    
    // Si no hay playlist válida, no crear el botón
    if (!canShowPlaylist) {
      return;
    }
    
    const tryAttach = () => {
      const controlsContainer = document.querySelector(
        '.shaka-controls-button-panel',
      );
      if (!controlsContainer) {
        setTimeout(tryAttach, 200);
        return;
      }
      // Evitar botones duplicados
      if (controlsContainer.querySelector('.shaka-playlist-button')) return;

      const btn = document.createElement('button');
      btn.classList.add(
        'shaka-playlist-button',
        'bg-transparent',
        'border-none',
        'text-white',
        'cursor-pointer',
        'p-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'w-10',
        'h-10',
      );

      // Icono de playlist (Material playlist_play)
      btn.innerHTML = `<span class="material-icons" style="font-size: 24px;">playlist_play</span>`;
      btn.title = 'Ver playlist';
      btn.setAttribute('aria-label', 'Ver playlist');

      // Ocultar inicialmente (solo visible en modo cine)
      btn.style.display = 'none';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Toggle playlist overlay si hay una activa
        if (this.hasPlayList && this.playlist) {
          // Toggle: si ya está abierto, cerrar; si está cerrado, abrir
          this.showPlaylistOverlay.update(v => !v);
        }
      });

      // Insertar después del botón de descarga
      const downloadBtn = controlsContainer.querySelector('.shaka-download-button');
      if (downloadBtn && downloadBtn.nextSibling) {
        controlsContainer.insertBefore(btn, downloadBtn.nextSibling);
      } else {
        const settingsBtn = controlsContainer.querySelector(
          '.shaka-overflow-button, .shaka-overflow-menu-button, .shaka-settings-button',
        );
        if (settingsBtn) {
          controlsContainer.insertBefore(btn, settingsBtn);
        } else {
          controlsContainer.appendChild(btn);
        }
      }

      console.log('playlist button added');

      // Guardar referencia para mostrar/ocultar según modo cine
      this.playlistButtonElement = btn;

      // Sincronizar estado inicial con el modo cine actual
      if (this.cineMode()) {
        btn.style.display = 'flex';
      }
    };
    tryAttach();
  }

  /**
   * Agregar botón de skip previous para navegación en playlist
   */
  private addSkipPreviousButton(): void {
    const tryAttach = () => {
      const controlsContainer = document.querySelector(
        '.shaka-controls-button-panel',
      );
      if (!controlsContainer) {
        setTimeout(tryAttach, 200);
        return;
      }
      // Avoid duplicate buttons
      if (controlsContainer.querySelector('.shaka-skip-previous-button'))
        return;

      const btn = document.createElement('button');
      btn.classList.add(
        'shaka-skip-previous-button',
        'shaka-skip-button',
        'bg-transparent',
        'border-none',
        'text-white',
        'cursor-pointer',
        'p-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'w-10',
        'h-10',
      );
      
      // Icono de skip previous (Material skip_previous)
      btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>`;
      btn.title = 'Video anterior';
      btn.setAttribute('aria-label', 'Video anterior');
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Ir al video anterior
        this.goToPreviousVideo();
      });
      
      // Insertar justo después del play button
      const playPauseBtn = controlsContainer.querySelector('.shaka-play-button');
      const muteBtn = controlsContainer.querySelector('.shaka-mute-button');
      
      // Insertar después del play button y antes del mute button
      if (muteBtn) {
        controlsContainer.insertBefore(btn, muteBtn);
      } else if (playPauseBtn && playPauseBtn.nextSibling) {
        controlsContainer.insertBefore(btn, playPauseBtn.nextSibling);
      } else {
        controlsContainer.appendChild(btn);
      }
      
      console.log('skip previous button added');
    };
    tryAttach();
  }

  /**
   * Verificar si hay un video anterior en la playlist
   */
  private canGoToPrevious(): boolean {
    if (!this.hasPlayList || !this.playlist) {
      return false;
    }
    
    if (this.isUserPlayList) {
      const index = this.playlist.publicacion.findIndex(
        p => p.id === this.video.id,
      );
      return index > 0;
    } else {
      const index = this.playlist.publicaciones.findIndex(
        p => p.slug_url === this.video.slug_url,
      );
      return index > 0;
    }
  }

  /**
   * Verificar si hay un siguiente video en la playlist
   */
  private canGoToNext(): boolean {
    if (!this.hasPlayList || !this.playlist) {
      return false;
    }
    
    if (this.isUserPlayList) {
      const index = this.playlist.publicacion.findIndex(
        p => p.id === this.video.id,
      );
      return index >= 0 && index < this.playlist.publicacion.length - 1;
    } else {
      const index = this.playlist.publicaciones.findIndex(
        p => p.slug_url === this.video.slug_url,
      );
      return index >= 0 && index < this.playlist.publicaciones.length - 1;
    }
  }
  
  /**
   * Agregar botón de skip next para navegación en playlist
   */
  private addSkipNextButton(): void {
    const tryAttach = () => {
      const controlsContainer = document.querySelector(
        '.shaka-controls-button-panel',
      );
      if (!controlsContainer) {
        setTimeout(tryAttach, 200);
        return;
      }
      // Avoid duplicate buttons
      if (controlsContainer.querySelector('.shaka-skip-next-button'))
        return;

      const btn = document.createElement('button');
      btn.classList.add(
        'shaka-skip-next-button',
        'shaka-skip-button',
        'bg-transparent',
        'border-none',
        'text-white',
        'cursor-pointer',
        'p-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'w-10',
        'h-10',
      );
      
      // Icono de skip next (Material skip_next)
      btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>`;
      btn.title = 'Siguiente video';
      btn.setAttribute('aria-label', 'Siguiente video');
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Ir al siguiente video
        console.log('[Skip] Next button clicked, calling nextVideo');
        this.nextVideo(true).catch(err => console.error('[Skip] Error:', err));
      });
      
      // Insertar después del skip previous button
      const skipPrevBtn = controlsContainer.querySelector('.shaka-skip-previous-button');
      const muteBtn = controlsContainer.querySelector('.shaka-mute-button');
      
      if (skipPrevBtn) {
        // Insertar después del skip previous
        const nextSibling = skipPrevBtn.nextSibling;
        if (nextSibling) {
          controlsContainer.insertBefore(btn, nextSibling);
        } else {
          controlsContainer.appendChild(btn);
        }
      } else if (muteBtn) {
        // Si no hay skip prev, insertar antes del mute
        controlsContainer.insertBefore(btn, muteBtn);
      } else {
        controlsContainer.appendChild(btn);
      }
      
      console.log('skip next button added');
    };
    tryAttach();
  }

  // Cine mode - use service to hide toolbar and footer
  private cineButtonElement: HTMLButtonElement | null = null;
  private downloadButtonElement: HTMLButtonElement | null = null;
  private playlistButtonElement: HTMLButtonElement | null = null;
  
  enterCineMode() {
    console.log('ENTER CINE MODE');
    this.cineMode.set(true);
    this.cineModeService.enterCineMode();
    // Update button appearance
    if (this.cineButtonElement) {
      this.cineButtonElement.innerHTML = `<svg width="20" height="14" viewBox="0 0 20 14" fill="currentColor"><rect x="1" y="1" width="18" height="12" rx="2"/></svg>`;
      this.cineButtonElement.title = 'Salir del modo cine';
      this.cineButtonElement.classList.add('cine-active');
    }
    // Mostrar botón de descarga cuando se activa el modo cine
    if (this.downloadButtonElement) {
      this.downloadButtonElement.style.display = 'flex';
    }
    // Mostrar botón de playlist cuando se activa el modo cine (solo si hay playlist)
    if (this.playlistButtonElement && this.hasPlayList && this.playlist) {
      this.playlistButtonElement.style.display = 'flex';
    }
  }

exitCineMode() {
    console.log('EXIT CINE MODE');
    this.cineMode.set(false);
    this.cineModeService.exitCineMode();
    // Update button appearance
    if (this.cineButtonElement) {
      this.cineButtonElement.innerHTML = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="0" y="0" width="20" height="14" rx="2"/></svg>`;
      this.cineButtonElement.title = 'Modo cine';
      this.cineButtonElement.classList.remove('cine-active');
    }
    // Ocultar botón de descarga cuando se desactiva el modo cine
    if (this.downloadButtonElement) {
      this.downloadButtonElement.style.display = 'none';
    }
    // Ocultar botón de playlist cuando se desactiva el modo cine
    if (this.playlistButtonElement) {
      this.playlistButtonElement.style.display = 'none';
    }
  }
  
  /**
   * Esperar a que el usuario esté disponible y activar modo cine si corresponde
   * Se mantiene el intervalo indefinidamente hasta que el usuario esté disponible
   */
  private waitForUserAndActivateCineMode() {
    // Verificar si hay preferencia guardada primero
    if (!this.cineModeService.getStoredPreference()) {
      return;
    }
    
    // Verificar inmediatamente si el usuario ya está disponible
    this.checkUserAndActivateCineMode();
    
    // También escuchar el observable para cuando el usuario se cargue después
    this.authService.user$.subscribe(user => {
      if (user) {
        this.checkUserAndActivateCineMode();
      }
    });
  }
  
  /**
   * Verificar si el usuario tiene suscripción y activar modo cine si corresponde
   */
  private checkUserAndActivateCineMode() {
    // Evitar activar múltiples veces
    if (this.cineMode()) {
      return;
    }
    
    // Verificar preferencia guardada
    if (!this.cineModeService.getStoredPreference()) {
      return;
    }
    
    // Obtener usuario desde las fuentes disponibles (priorizar this.user que se actualiza del API)
    let currentUser: any = this.user || (this.authService as any).user || this.authService.userData;
    
    if (!currentUser) {
      return;
    }
    
    // Verificar suscripción y activar modo cine
    const hasSubscription = !!(
      currentUser?.subscription_plan?.nombre || 
      currentUser?.subscription_plan?.plan?.nombre
    );

    console.log(currentUser?.subscription_plan)
    
    if (hasSubscription) {
      this.enterCineMode();
    }
  }
  
  private startSubtitleVisibilityWatcher(): void {
    if (this.subtitleWatcher) return;
    this.subtitleWatcher = setInterval(() => {
      try {
        if (!this.player || !this.player.getTextTracks) return;
        const tracks = this.player.getTextTracks();
        const visible =
          Array.isArray(tracks) && tracks.some((t: any) => !!t.active);
        if (visible !== this.subtitlesVisible) {
          this.subtitlesVisible = visible;
          if (this.subtitleToggleButton) {
            this.subtitleToggleButton.innerHTML = `<span class="material-icons">${this.subtitlesVisible ? 'subtitles' : 'subtitles_off'}</span>`;
          }
        }
      } catch (e) {
        // ignore transient errors
      }
    }, 300);
  }

  // Shaka v5 removed setTextTrackVisibility from the public API.
  // Keep compatibility with both old and new versions.
  private setSubtitlesVisibility(visible: boolean): void {
    if (!this.player) return;

    const getTracks = (): any[] => {
      try {
        return (this.player.getTextTracks && this.player.getTextTracks()) || [];
      } catch {
        return [];
      }
    };

    if (typeof this.player.setTextTrackVisibility === 'function') {
      this.player.setTextTrackVisibility(!!visible);
      this.subtitlesVisible = !!visible;
      return;
    }

    if (typeof this.player.selectTextTrack === 'function') {
      const tracks = getTracks();

      if (visible) {
        const active = tracks.find((t: any) => !!t.active);
        const remembered =
          this.lastSelectedTextTrackId !== null
            ? tracks.find(
                (t: any) =>
                  String(t.id) === String(this.lastSelectedTextTrackId),
              )
            : null;
        const toEnable = active || remembered || tracks[0] || null;

        if (toEnable) {
          this.player.selectTextTrack(toEnable);
          this.lastSelectedTextTrackId = toEnable.id;
        }
      } else {
        const active = tracks.find((t: any) => !!t.active);
        if (active && active.id !== undefined && active.id !== null) {
          this.lastSelectedTextTrackId = active.id;
        }
        this.player.selectTextTrack(null);
      }

      const nextTracks = getTracks();
      this.subtitlesVisible =
        Array.isArray(nextTracks) && nextTracks.some((t: any) => !!t.active);
      return;
    }

    this.subtitlesVisible = !!visible;
  }

  private stopSubtitleVisibilityWatcher(): void {
    if (this.subtitleWatcher) {
      clearInterval(this.subtitleWatcher);
      this.subtitleWatcher = null;
    }
  }

  private goToNextChapter(): void {}

  private trackVideoEvent(action: string, detail: string = ''): void {
    if (!this.video?.id) {
      return;
    }

    const baseLabel = `${this.video.id}:${this.video.slug_url || this.video.nombre || 'sin-slug'}`;
    const eventLabel = detail ? `${baseLabel}:${detail}` : baseLabel;

    setTimeout(() => this.matomo.trackEvent('video', action, eventLabel), 0);
  }

  private trackPaymentByType(type: string): void {
    const paymentAction =
      type === 'renta' || type === 'reproduccion' ? 'renta' : 'compra';
    this.trackVideoEvent(paymentAction, type || 'evento');
  }

  private runAfterTracking(action: () => void, delayMs = 300): void {
    setTimeout(() => action(), delayMs);
  }

  handleLike() {
    if (!this.disabled) {
      this.toggleLike();
    }
  }

  handleContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  copyEmbebedCode() {
    // tslint:disable-next-line:max-line-length
    const text = `<div style="width: 100%; height:0; position: relative; padding-bottom: 56.24929688378895%;"><iframe style="position: absolute; top:0; left:0; width: 100%; height: 100%; border: 0;" allowfullscreen frameborder="0" src=https://www.picta.cu/embed/${this.video.slug_url}></iframe></div>`;
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.notificationService.open(
      'ok',
      'Código de inserción copiado al portapapeles.',
    );
  }

  handleDislike() {
    if (!this.disabled) {
      this.toggleDislike();
    }
  }

  toggleLike() {
    if (this.likeLoading()) return;
    
    this.likeLoading.set(true);
    
    if (!this.liked) {
      this.likes++;
      this.liked = true;
      
      if (this.disliked) {
        this.disliked = false;
        if (this.dislikes > 0) {
          this.dislikes--;
        }
        this.subs.add(
          this.votoService.updateVote(this.votoExistente.id, true).subscribe({
            next: (res) => {
              this.votoExistente = res;
              this.trackVideoEvent('me_gusta');
              this.likeLoading.set(false);
              this.notificationService.open('ok', 'Me gusta registrado');
            },
            error: () => {
              this.likeLoading.set(false);
              this.notificationService.open('error', 'No se pudo registrar el me gusta');
            }
          })
        );
        return;
      }
      
      this.subs.add(
        this.votoService.vote(this.video.id, true).subscribe({
          next: (res) => {
            this.votoExistente = res;
            this.trackVideoEvent('me_gusta');
              this.likeLoading.set(false);
              this.notificationService.open('ok', 'Me gusta registrado');
          },
          error: () => {
            this.likeLoading.set(false);
            this.notificationService.open('error', 'No se pudo registrar el me gusta');
          }
        })
      );
    } else {
      this.likes--;
      this.liked = false;
      this.subs.add(
        this.votoService.deleteVote(this.votoExistente.id).subscribe({
          next: () => {
            this.votoExistente = null;
            this.likeLoading.set(false);
            this.notificationService.open('ok', 'Se quitó el Me gusta');
          },
          error: () => {
            this.likeLoading.set(false);
            this.notificationService.open('error', 'No se pudo quitar el Me gusta');
          }
        })
      );
    }
  }

  toggleDislike() {
    if (this.dislikeLoading()) return;
    
    this.dislikeLoading.set(true);
    
    if (!this.disliked) {
      this.dislikes++;
      this.disliked = true;
      
      if (this.liked) {
        this.liked = false;
        if (this.likes > 0) {
          this.likes--;
        }
        this.subs.add(
          this.votoService.updateVote(this.votoExistente.id, false).subscribe({
            next: (res) => {
              this.votoExistente = res;
              this.trackVideoEvent('no_me_gusta');
              this.dislikeLoading.set(false);
              this.notificationService.open('ok', 'No me gusta registrado');
            },
            error: () => {
              this.dislikeLoading.set(false);
              this.notificationService.open('error', 'No se pudo registrar el no me gusta');
            }
          })
        );
        return;
      }
      
      this.subs.add(
        this.votoService.vote(this.video.id, false).subscribe({
          next: (res) => {
            this.votoExistente = res;
            this.trackVideoEvent('no_me_gusta');
            this.dislikeLoading.set(false);
            this.notificationService.open('ok', 'No me gusta registrado');
          },
          error: () => {
            this.dislikeLoading.set(false);
            this.notificationService.open('error', 'No se pudo registrar el no me gusta');
          }
        })
      );
    } else {
      this.dislikes--;
      this.disliked = false;
      this.subs.add(
        this.votoService.deleteVote(this.votoExistente.id).subscribe({
          next: () => {
            this.votoExistente = null;
            this.dislikeLoading.set(false);
            this.notificationService.open('ok', 'Se quitó el No me gusta');
          },
          error: () => {
            this.dislikeLoading.set(false);
            this.notificationService.open('error', 'No se pudo quitar el no me gusta');
          }
        })
      );
    }
  }

  handleDenuncia() {
    if (this.isLoggedIn) {
      this.denuncia = !this.denuncia;
    }
  }

  countReproduccion(): any {
    if (this.localStorage.getItem(JSON.stringify(this.video.id))) {
      var temp = JSON.parse(this.localStorage.getItem(this.video.id));
      if (!temp.reproduccion) {
        temp.reproduccion = true;
        this.localStorage.setItem(
          JSON.stringify(this.video.id),
          JSON.stringify(temp),
        );
        this.trackVideoEvent('reproduccion');
        this.subs.add(
          this.publicacionService
            .countReproduccion(this.video.id, this.authService.isLoggedIn())
            .subscribe(),
        );
      }
    } else {
      var video = { reproduccion: true };
      this.localStorage.setItem(
        JSON.stringify(this.video.id),
        JSON.stringify(video),
      );
      this.trackVideoEvent('reproduccion');
      this.subs.add(
        this.publicacionService
          .countReproduccion(this.video.id, this.authService.isLoggedIn())
          .subscribe(),
      );
    }
  }

  countVisit(usuario: any): any {
    if (this.localStorage.getItem(JSON.stringify(this.video.id))) {
      var temp = JSON.parse(this.localStorage.getItem(this.video.id));
      if (!temp.visita) {
        temp.visita = true;
        this.localStorage.setItem(
          JSON.stringify(this.video.id),
          JSON.stringify(temp),
        );
        this.subs.add(
          this.publicacionService
            .countVisit(this.video.id, '', usuario)
            .subscribe(),
        );
      } else {
        if (
          this.video.categoria.tipologia.modelo == 'pelicula' ||
          this.video.categoria.tipologia.modelo == 'capitulo'
        ) {
          var ads_views = this.localStorage.getItem('ads');
          ads_views++;
          this.localStorage.setItem('ads', ads_views);
        }
      }
    } else {
      var video = { visita: true };
      this.localStorage.setItem(
        JSON.stringify(this.video.id),
        JSON.stringify(video),
      );
      this.subs.add(
        this.publicacionService
          .countVisit(this.video.id, '', usuario)
          .subscribe(),
      );
      if (
        this.video.categoria.tipologia.modelo == 'pelicula' ||
        this.video.categoria.tipologia.modelo == 'capitulo'
      ) {
        var ads_views = this.localStorage.getItem('ads');
        ads_views++;
        this.localStorage.setItem('ads', ads_views);
      }
    }
  }

  toggleAutoPlayNext({ checked }) {
    this.autoplayNext = checked;
    this.localStorage.setItem('autoPlay', JSON.stringify(checked));
    // this.storageService.saveItem('autoPlay', checked);
  }

  handleSubscribe() {
    if (this.subscribing) return;
    this.subscribing = true;
    if (!this.subscribed) {
      this.subs.add(
        this.subscribeService.subscribe(this.canal.id).subscribe({
          next: (res) => {
            this.subscribed = true;
            this.subscribing = false;
            this.subscription = res;
            this.notificationService.open('ok', 'Has empezado a seguir el canal');
          },
          error: (err) => {
            this.subscribing = false;
            console.error('Error subscribing:', err);
            this.notificationService.open('error', 'No se pudo seguir el canal');
          }
        }),
      );
    } else {
      this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            msg: `¿Estás seguro que deseas cancelar tu suscripción al canal ${this.canal.nombre}?`,
          },
          panelClass: 'picta-dark-dialog',
          backdropClass: 'picta-dialog-backdrop',
          width: 'min(400px, 96vw)',
          maxWidth: '96vw',
          enterAnimationDuration: '340',
          exitAnimationDuration: '280',
        })
        .afterClosed()
        .subscribe(result => {
          if (result) {
            // show loading state on button while request in progress
            this.subscribing = true;
            this.subs.add(
              this.subscribeService
                .unsubscribe(this.subscription.id)
                .pipe(
                  finalize(() => {
                    this.subscribing = false;
                  }),
                )
                .subscribe({
                  next: () => {
                    this.subscribed = false;
                    this.subscription = null;
                    this.notificationService.open('ok', 'Has dejado de seguir el canal');
                  },
                  error: (err) => {
                    console.error('Error unsubscribing:', err);
                    this.notificationService.open('error', 'No se pudo dejar de seguir el canal');
                  }
                }),
            );
          }
        });
    }
  }

  handleNotificationChange(mode: 'all' | 'none') {
    if (this.subscribing || !this.subscribed) return;

    // Save to localStorage (since API doesn't support notifications)
    this.saveSilencedChannel(mode);

    this.notificationMode = mode;
    this.subscribing = false;
    // Notify user about the change
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

  checkMembership() {
    if (!this.canal) return;
    this.canalService.esMiembro(this.canal.id).subscribe({
      next: (res: any) => {
        this.isMember = res.is_member || false;
      },
      error: () => {
        this.isMember = false;
      },
    });
  }

  handleBecomeMember() {
    if (!this.isLoggedIn) {
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
      data: { canal: this.canal },
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
        this.checkMembership();
      }
    });
  }

  handleUnsubscribe() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          msg: `¿Estás seguro que deseas cancelar tu suscripción al canal ${this.canal.nombre}?`,
        },
        panelClass: 'picta-dark-dialog',
        backdropClass: 'picta-dialog-backdrop',
        width: 'min(400px, 96vw)',
        maxWidth: '96vw',
        enterAnimationDuration: '340',
        exitAnimationDuration: '280',
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
                }),
              )
              .subscribe({
                next: () => {
                    this.subscribed = false;
                    this.subscription = null;
                    this.notificationMode = 'all';
                    // Remove from silenced channels
                    this.saveSilencedChannel('all');
                    this.notificationService.open('ok', 'Se dejo de seguir el canal exitosamente.');
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

  toggleDenuncia() {
    if (this.isLoggedIn) {
      this.denuncia = !this.denuncia;
    }
  }

  showShareDialog() {
    if (navigator.share) {
      navigator
        .share({
          title: `${this.video.nombre} - Picta`,
          text: this.video.descripcion,
          url: `https://www.picta.cu/medias/${this.video.slug_url}`,
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing', error));
    } else {
      const dialogRef = this.dialog.open(ShareDialogComponent, {
        data: { video: this.video },
        panelClass: 'picta-dark-dialog',
        backdropClass: 'picta-dialog-backdrop',
        width: 'min(640px, 96vw)',
        maxWidth: '96vw',
        enterAnimationDuration: '380',
        exitAnimationDuration: '300',
      });
    }
  }

  dismiss($event: any) {
    if ($event) {
      this.trackVideoEvent('comentario');
      this.refreshComments();
    }
  }

  refreshComments() {
    // Resettear página para evitar duplicados al recargar
    this.commentsPage = 1;
    this.loadComentarios();
  }

  openDownload() {
    /*     if (this.premium && this.video.categoria.eventotipologia) {
      this.snackBar.open('Contenido de pago por inscripción al evento');
      return;
    } */
    if (this.precioDescarga && !this.video.pd) {
      this.openPayment('descarga');
    } else {
      this.dialog.open(DownloadPopupComponent, {
        data: { video: this.video, user: this.user },
        panelClass: 'picta-dark-dialog',
        backdropClass: 'picta-dialog-backdrop',
        width: 'min(420px, 96vw)',
        maxWidth: '96vw',
        enterAnimationDuration: '340',
        exitAnimationDuration: '280',
      });
    }
  }

  openPlaylist() {
    // Si está en modo cine, usar overlay integrado en el player
    if (this.cineMode()) {
      this.showPlaylistOverlay.set(true);
      // El scroll se maneja dentro de scrollToActivePlaylistItem con su propio timeout
      this.scrollToActivePlaylistItem();
      return;
    }
    // Otherwise use bottom sheet
    this.playlistBottomPanelRef = this.bottomSheet.open(
      this.playlistRefTemp(),
      {
        panelClass: 'bottomSheet',
      },
    );
  }

  closePlaylistOverlay() {
    this.showPlaylistOverlay.set(false);
  }

  /**
   * Abre el modal de descarga para un video específico de la playlist
   */
  openDownloadForVideo(item: any) {
    this.dialog.open(DownloadPopupComponent, {
      data: { video: item, user: this.user },
      panelClass: 'picta-dark-dialog',
      backdropClass: 'picta-dialog-backdrop',
      width: 'min(760px, 96vw)',
      maxWidth: '96vw',
      enterAnimationDuration: '380',
      exitAnimationDuration: '300',
    });
  }

  navigateToAd() {
    const ad = this.adsPicta[this.adsNumber];
    if (ad.type === 'picta-movie') {
      // Navegar a la ruta de película
      this.router.navigate(['/movie', ad.slug_url]);
    } else if (ad.type === 'picta-serie') {
      // Navegar a la ruta de serie
      this.router.navigate(['/serie', ad.title]);
    }
  }

  openAdRemovalModal() {
    this.showAdRemovalModal = true;
  }

  closeAdRemovalModal() {
    this.showAdRemovalModal = false;
  }

  navigateToSubscriptions() {
    this.closeAdRemovalModal();
    this.router.navigate(['/suscripciones']);
  }

  setUrlSubject(slugUrl: string, adss = false) {
    this.reset();
    this.showAd = false;
    // La determinación correcta de showAd se hará en loadVideos después de cargar el video
    if (adss == true) {
      this.showAd = false;
    }
    this.player?.destroy();
    this.ads?.destroy();
    this.adui?.destroy();
    this.displayNext = false;
    delete this.player;
    this.ui?.destroy();
    this.controls?.destroy();
    this.loading = true;
    this.router.navigate(['/medias', slugUrl]);
    this.loadVideos(false, slugUrl);
    // El siguiente se calcula automáticamente cuando el video se carga en loadVideos -> calcularSiguiente()
  }

  navigatePost(slugUrl: string) {
    if (this.isUserPlayList) {
      this.router.navigate(['/medias', slugUrl], {
        queryParams: { playlistId: this.playlist.id },
      });
    } else {
      this.router.navigate(['/medias', slugUrl]);
    }
    this.loadVideos();
  }

  playFromPlaylist($event: any) {
    this.slug_url = $event.slug_url;
    this.playlistBottomPanelRef && this.playlistBottomPanelRef.dismiss();
    this.saveVideoTime();
    this.setUrlSubject($event.slug_url);
    // Scroll al item activo en el overlay de playlist
    setTimeout(() => this.scrollToActivePlaylistItem(), 100);
  }

  /**
   * Hace scroll al item activo en el overlay de playlist
   * El capítulo activo aparece centrado en la vista
   */
  scrollToActivePlaylistItem() {
    setTimeout(() => {
      const activeItem = document.querySelector('.playlist-overlay-item.active') as HTMLElement;
      
      if (activeItem) {
        // Usar scrollIntoView para que el navegador encuentre el ancestro scrollable correcto
        activeItem.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        console.log('[Playlist] Scroll to item:', this.video?.id);
      } else {
        console.log('[Playlist] Active item not found');
      }
    }, 300);
  }

  openUserPlaylist() {
    this.dialog
      .open(UserPlaylistDialogComponent, {
        data: { pubId: this.video.id },
        panelClass: 'picta-dark-dialog',
        backdropClass: 'picta-dialog-backdrop',
        width: 'min(420px, 96vw)',
        maxWidth: '96vw',
        enterAnimationDuration: '340',
        exitAnimationDuration: '280',
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const ref = this.snackBar.open(
            `Video guardado en la lista ${result.nombre}`,
            'Ver mis listas',
          );
          ref.onAction().subscribe(() => {
            this.router.navigate(['/profile/playlists']);
          });
        }
      });
  }

  formatLabel(value: number) {
    const transform = (val: any, arg1: any, arg2: any) => {
      let days: any;
      let seconds: any;
      let minutes: any;
      let hours: any;

      seconds = Math.floor(val % 60);
      minutes = Math.floor((val / 60) % 60);
      hours = Math.floor(val / 60 / 60);
      return format(arg2, seconds, minutes, hours, days);
    };

    const format = (
      arg2: any,
      seconds: any,
      minutes: any,
      hours: any,
      days: any,
    ) => {
      days < 10 ? (days = '0' + days) : days;
      hours < 10 ? (hours = '0' + hours) : hours;
      minutes < 10 ? (minutes = '0' + minutes) : minutes;
      seconds < 10 ? (seconds = '0' + seconds) : seconds;

      switch (arg2) {
        case 'hhmmss':
          return `${hours}:${minutes}:${seconds}`;

        case 'ddhhmmss':
          return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;

        case 'ddhhmmssLong':
          return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

        default:
          return `${hours}:${minutes}:${seconds}`; // Opción por defecto
      }
    };
    return transform(value, 's', 'hhmmss');
  }

  playFromRecomended($event: string) {
    this.slug_url = $event;
    this.saveVideoTime();
    this.setUrlSubject($event);
  }

  keyDown($event: KeyboardEvent) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    $event.stopPropagation();
  }

  goBack() {
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    }
  }

  openPayment(type = '') {
    if (type === 'donacion') {
      const ref = this.dialog.open(DonateDialogComponent, {
        closeOnNavigation: true,
        hasBackdrop: true,
        data: { channel_id: this.canal.id },
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'donation-successful') {
          this.snackBar.open('Donación realizada satisfactoriamente');
        }
      });
    } else if (
      type === 'reproduccion' ||
      type === 'renta' ||
      type === 'descarga'
    ) {
      const externalId = `${this.video.tipo}_${type}_${this.video.id}`;
      this.paymentService
        .getItem({ external_id: externalId })
        .subscribe((data: any) => {
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
              data: { video: this.video, offer, externalId },
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result === 'payment-successful') {
                this.trackPaymentByType(type);
                this.snackBar.open('Pago realizado satisfactoriamente');
                //this.loadVideos(true);
                this.runAfterTracking(() => window.location.reload());
              }
            });
          } else {
            this.snackBar.open('No existe una oferta para esta publicación');
          }
        });
    } else {
      const externalId = `evento_plan-evento_${this.video.categoria.eventotipologia.evento.id}`;
      this.paymentService
        .getItem({ external_id: externalId })
        .subscribe((data: any) => {
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
              data: {
                video: this.video,
                offer,
                externalId,
              },
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result === 'payment-successful') {
                this.trackPaymentByType('evento');
                this.snackBar.open('Pago realizado satisfactoriamente');
                this.runAfterTracking(() => this.loadVideos(true));
              }
            });
          } else {
            this.snackBar.open('No existe una oferta para esta publicación');
          }
        });
    }
  }

  loadComentarios() {
    if (!this.video?.id || !this.commentsPage || this.commentsLoading) {
      return;
    }

    this.commentsLoading = true;
    this.comentarioService
      .comentariosByPost({
        publicacion_id: this.video?.id,
        page: this.commentsPage,
        page_size: this.COMMENTS_PER_PAGE,
      })
      .pipe(
        finalize(() => {
          this.commentsLoading = false;
        }),
      )
      .subscribe((data: any) => {
        // Si es página 1, reemplazar resultados; si no, concatenar
        if (this.commentsPage === 1) {
          this.video.lista_comentarios = data;
        } else {
          if (!this.video.lista_comentarios) {
            this.video.lista_comentarios = data;
          } else {
            this.video.lista_comentarios.results =
              this.video.lista_comentarios.results.concat(data.results);
          }
        }
        this.commentsPage = data.next;
      });
  }

  private removeQueryParam() {
    this.router.navigate([], {
      queryParams: {
        questionId: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private reset() {
    this.liked = false;
    this.disliked = false;
    this.likes = 0;
    this.dislikes = 0;
    this.denuncia = false;
    this.votoExistente = null;
    this.subscribing = false;
    this.comentar = false;
    // ensure subscription-related state is cleared when switching videos
    this.subscribed = false;
    this.subscription = null;
    this.notificationMode = 'all';
    // show loading for subscription until initSubscription finishes
    this.subscriptionLoading = true;
    this.isCounted = false;
    this.commentsPage = 1;
    delete this.commentId;
    /*if (this.video && (this.video.canal.id === 207 || this.video.id === 2601)) {
      this.publicacionService.updateSeeingNow(this.video.id, false).subscribe();
      this.sseEvtSubscription.unsubscribe();
    }*/
  }

  private setHrefs() {
    this.facebookHref = `https://www.facebook.com/sharer/sharer.php?u=https://www.picta.cu${this.location.path()}`;
    // tslint:disable-next-line:max-line-length
    this.twitterHref = `https://twitter.com/intent/tweet?text=${
      this.video.nombre
    } ${
      this.video.url_imagen
    }&url=https://www.picta.cu${this.location.path()}&original_referer=https://www.picta.cu${this.location.path()}`;
    this.telegramHref = `https://telegram.me/share/url?text=${
      this.video.nombre
    }&url=https://www.picta.cu${this.location.path()}`;
  }

  private goToComment() {
    const element =
      document.querySelector('#comment-' + this.commentId) ||
      document.querySelector('#commentBox');
    element.scrollIntoView(false);
  }

  private showIcon(element) {
    if (element) {
      this.renderer2.setStyle(element.nativeElement, 'display', 'flex');
      setTimeout(() => {
        this.renderer2.setStyle(element.nativeElement, 'display', 'none');
      }, 800);
    }
  }

  private checkType() {
    switch (Number(this.video?.id)) {
      case 2501:
        this.video.url_manifiesto =
          'https://tv.picta.cu/cubavision/cubavision_master.m3u8';
        break;
      case 56343:
        this.video.url_manifiesto =
          'https://tvhd.picta.cu/caribehd/caribehd_master.m3u8';
        break;
      case 56344:
        this.video.url_manifiesto =
          'https://tvhd.picta.cu/telerebledehd/telerebledehd_master.m3u8';
        break;
      case 56345:
        this.video.url_manifiesto =
          'https://tvhd.picta.cu/cubavisionhd/cubavisionhd_master.m3u8';
        break;
      case 56346:
        this.video.url_manifiesto =
          'https://tvhd.picta.cu/rusiatodayhd/rusiatodayhd_master.m3u8';
        break;
      case 2502:
        this.video.url_manifiesto =
          'https://tv.picta.cu/telerebelde/telerebelde_master.m3u8';
        break;
      case 366:
        this.video.url_manifiesto = 'https://tv.picta.cu/cvi/cvi_master.m3u8';
        break;
      case 55864:
        this.video.url_manifiesto =
          'https://tv.picta.cu/clave/clave_master.m3u8';
        break;
      case 33959:
        this.video.url_manifiesto =
          'https://tv.picta.cu/multivision/multivision_master.m3u8';
        break;
      case 55887:
        this.video.url_manifiesto =
          'https://tv.picta.cu/educativo/educativo_master.m3u8';
        break;
      case 55888:
        this.video.url_manifiesto =
          'https://tv.picta.cu/educativo2/educativo2_master.m3u8';
        break;
      case 55886:
        this.video.url_manifiesto =
          'https://tv.picta.cu/infantil/infantil_master.m3u8';
        break;
      default:
        break;
    }

    this.type = 'publicacion';
  }

  private getForcedManifestByVideoId(videoId: any): string | null {
    const manifests: { [id: number]: string } = {
      2501: 'https://tv.picta.cu/cubavision/cubavision_master.m3u8',
      56343: 'https://tvhd.picta.cu/caribehd/caribehd_master.m3u8',
      56344: 'https://tvhd.picta.cu/telerebledehd/telerebledehd_master.m3u8',
      56345: 'https://tvhd.picta.cu/cubavisionhd/cubavisionhd_master.m3u8',
      56346: 'https://tvhd.picta.cu/rusiatodayhd/rusiatodayhd_master.m3u8',
      2502: 'https://tv.picta.cu/telerebelde/telerebelde_master.m3u8',
      366: 'https://tv.picta.cu/cvi/cvi_master.m3u8',
      2504: 'https://tv.picta.cu/clave/clave_master.m3u8',
      55864: 'https://tv.picta.cu/clave/clave_master.m3u8',
      33959: 'https://tv.picta.cu/multivision/multivision_master.m3u8',
      55887: 'https://tv.picta.cu/educativo/educativo_master.m3u8',
      55888: 'https://tv.picta.cu/educativo2/educativo2_master.m3u8',
      55886: 'https://tv.picta.cu/infantil/infantil_master.m3u8',
    };

    return manifests[Number(videoId)] || null;
  }

  private isLiveVideoType(tipo: string): boolean {
    return (
      !!this.getForcedManifestByVideoId(this.video?.id) ||
      tipo === 'live' ||
      tipo === 'publicacion_en_vivo'
    );
  }

  private isLiveTVChannel(videoId: any): boolean {
    // Verifica si es uno de los canales de TV en vivo del switch
    return !!this.getForcedManifestByVideoId(videoId);
  }

  /**
 * Retorna la configuración de publicidad
 * @returns { show: boolean, seconds: number }
 *   - show: true si debe mostrar publicidad, false si no
 *   - seconds: segundos de publicidad a mostrar (solo relevante si show=true)
 */
private getAdvertisementConfig(): { show: boolean; seconds: number } {
    // Si no hay usuario logueado, mostrar publicidad con segundos por defecto
    if (!this.authService.isLoggedIn()) {
      return { show: true, seconds: 10 };
    }

    // Priorizar el usuario emitido por user$ (actualizado) y usar los otros como respaldo.
    const userCandidates = [
      this.user,
      this.authService.userData,
      this.authService.user,
    ].filter((u: any) => !!u);

    // Si aún no hay datos del usuario logueado, no mostrar ads por defecto
    if (!userCandidates.length) {
      return { show: false, seconds: 0 };
    }

    // Buscar el beneficio de publicidad en cualquier snapshot del usuario
    for (const userData of userCandidates) {
      const beneficioPublicidad = userData?.subscription_plan?.beneficios?.find(
        beneficio => beneficio?.nombre_raw === 'publicidad',
      );
      
      if (beneficioPublicidad?.valor) {
        const valor = beneficioPublicidad.valor;
        
        // Si es "No" string, no mostrar publicidad
        if (typeof valor === 'string' && valor.toString().trim().toLowerCase() === 'no') {
          return { show: false, seconds: 0 };
        }
        
        // Si es un número, usarlo como segundos de publicidad
        const segundos = parseInt(valor.toString(), 10);
        if (!isNaN(segundos) && segundos > 0) {
          return { show: true, seconds: segundos };
        }
      }
    }

    // Si hay usuario logueado sin plan, debe ver publicidad
    const hasSubscriptionPlan = userCandidates.some(
      (u: any) => !!u?.subscription_plan,
    );
    if (!hasSubscriptionPlan) {
      return { show: true, seconds: 5 };
    }

    // Tiene plan pero no encontró beneficio de publicidad específico
    return { show: false, seconds: 0 };
  }

  private shouldShowAdvertisement(): boolean {
    return this.getAdvertisementConfig().show;
  }

  @HostListener('window:beforeunload')
  public saveVideoTime() {
    if (
      this.type === 'publicacion' &&
      !this.mediaNotFound &&
      this.videoElement?.currentTime > 0
    ) {
      this.localStorage.setItem(
        this.video.slug_url,
        JSON.stringify(this.videoElement.currentTime),
      );
    }
  }

  openChat() {
    this.playlistBottomPanelRef = this.bottomSheet.open(this.chatMobileRef(), {
      panelClass: 'bottomSheet',
    });
  }

  get isAdmin() {
    // return this.user.groups.some((g: any) => g.id === 2 || g.id === 5 || g.id === 4);
    return this.authService.user.groups.some(
      (g: any) => g.name === 'Administrador' || g.name === 'Webmaster',
    );
  }

  startAdCountdown(): void {
    this.adInterval = setInterval(() => {
      this.playTime = this.player.getStats().playTime;

      this.adCountdown = 5 - Math.floor(this.player.getStats().playTime);
      if (this.playTime >= 5) {
        clearInterval(this.adInterval);
      }
    }, 1000);
  }

  async skipAd() {
    if (this.playTime >= 5) {
      await this.player.detach();
      this.player.unload();
      this.showAd = false;
      this.initPlayer();
    }
  }

  showVideoTitle(action: string) {
    // No mostrar overlay durante publicidad
    if (this.showAd) {
      return;
    }
    
    // Always show on mouse move, hide after 3 seconds of inactivity
    this.titleOverlay = true;
    
    if (this.titleOverlayTimeoutId) {
      clearTimeout(this.titleOverlayTimeoutId);
    }
    
    this.titleOverlayTimeoutId = setTimeout(() => {
      // Hide only if video is playing, keep visible when paused
      if (!this.videoElement?.paused) {
        this.titleOverlay = false;
      }
    }, 3000);
  }

  onMouseMove() {
    // No mostrar overlay durante publicidad
    if (this.showAd) {
      return;
    }
    
    // Show overlay header on mouse move (like Shaka controls)
    this.showVideoTitle('play');
  }

  isChapterVideo(): boolean {
    return this.video?.categoria?.tipologia?.modelo === 'capitulo';
  }

  getCurrentSeriesName(): string {
    return this.video?.categoria?.capitulo?.temporada?.serie?.nombre || '';
  }

  getCurrentSeasonName(): string {
    return this.video?.categoria?.capitulo?.temporada?.nombre || '';
  }

  getCurrentEpisodeNumber(): number | null {
    const episodeNumber = Number(this.video?.categoria?.capitulo?.numero);
    if (!Number.isFinite(episodeNumber) || episodeNumber <= 0) {
      return null;
    }

    return episodeNumber;
  }

  obtenerAlturaMaxima(calidad: string | number): number {
    // Si es número directo (del localStorage: 144, 240, 360, etc)
    if (typeof calidad === 'number') {
      return calidad;
    }
    // Si es string con formato "480p", "720p", etc
    switch (calidad) {
      case '480p':
        return 480;
      case '720p':
        return 720;
      case '1080p':
        return 1080;
      default:
        return 480; // Valor por defecto
    }
  }

  obtenerCalidadMaxima() {
    // Si el usuario tiene una calidad configurada en localStorage (preferencias), usarla
    const calidadLocalStorage = this.localStorage.getItem('quality');
    if (calidadLocalStorage && calidadLocalStorage !== 'auto') {
      this.quality = parseInt(calidadLocalStorage, 10);
      return;
    }
    
    // Si no hay localStorage o es "auto", usar la calidad del plan del usuario
    // o 480p por defecto si no tiene suscripción
    const beneficioCalidad = this.user?.subscription_plan?.beneficios?.find(
      beneficio => beneficio.nombre_raw === 'calidad',
    );
    if (beneficioCalidad && beneficioCalidad.valor) {
      const valor = beneficioCalidad.valor;
      if (typeof valor === 'number') {
        this.quality = valor;
      } else {
        // Parsear string como "1080p" -> 1080
        this.quality = parseInt(valor.toString().replace('p', ''), 10) || 480;
      }
    } else {
      // Usuario sin plan de suscripción - calidad máxima 480p
      this.quality = 480;
    }
  }

  /**
   * Obtiene la calidad máxima según el plan del usuario
   */
  private getCalidadMaximaPlan(): number {
    const beneficioCalidad = this.user?.subscription_plan?.beneficios?.find(
      beneficio => beneficio.nombre_raw === 'calidad',
    );
    
    if (beneficioCalidad && beneficioCalidad.valor) {
      // El valor puede ser número (480) o string ("1080p")
      const valor = beneficioCalidad.valor;
      if (typeof valor === 'number') {
        return valor;
      }
      // Parsear string como "1080p" -> 1080
      const parsed = parseInt(valor.toString().replace('p', ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    // Usuario sin plan - 480p máximo
    return 480;
  }

  /**
   * Aplica la calidad por defecto configurada por el usuario al reproductor Shaka
   */
  private aplicarCalidadUsuario() {
    if (!this.player) return;
    
    // Obtener la calidad del localStorage directamente (puede ser "auto" o un número)
    const calidadLocalStorage = this.localStorage.getItem('quality');
    console.log('[Quality] localStorage quality:', calidadLocalStorage);
    
    // Si es "auto", no aplicar restricciones - dejar que Shaka elija automáticamente
    if (!calidadLocalStorage || calidadLocalStorage === 'auto') {
      console.log('[Quality] Modo auto - no se aplica restricción');
      return;
    }
    
    try {
      const calidadDeseada = parseInt(calidadLocalStorage, 10);
      if (isNaN(calidadDeseada) || calidadDeseada <= 0) {
        console.warn('[Quality] Valor de calidad inválido:', calidadLocalStorage);
        return;
      }
      
      // Obtener la calidad máxima según el plan del usuario
      const calidadMaximaPlan = this.getCalidadMaximaPlan();
      
      // Usar la menor entre la preferencia del usuario y su plan
      const alturaMaxima = Math.min(calidadDeseada, calidadMaximaPlan);
      
      console.log('[Quality] Calidad deseada:', calidadDeseada, 'p, Plan máx:', calidadMaximaPlan, 'p -> Aplicando:', alturaMaxima, 'p');
      
      // Desactivar ABR para forzar la calidad seleccionada
      this.player.configure({ abr: { enabled: false } });
      
      // Obtener las pistas de video usando getVariantTracks()
      const tracks = this.player.getVariantTracks();
      if (!tracks || tracks.length === 0) {
        console.warn('[Quality] No hay pistas de video disponibles');
        return;
      }
      
      console.log('[Quality] Pistas disponibles:', tracks.map(t => t.height));
      
      // Seleccionar la pista que coincida con la calidad configurada (la más alta dentro del límite)
      const sortedTracks = tracks
        .filter(t => t.height && t.height > 0)
        .sort((a, b) => b.height - a.height);
      
      const selectedTrack = sortedTracks.find(t => t.height <= alturaMaxima) 
        || sortedTracks[sortedTracks.length - 1]; // Si ninguna cumple, usar la más baja
      
      if (selectedTrack) {
        // Usar selectVariantTrack para seleccionar la calidad (segundo parametro true para limpiar buffer)
        this.player.selectVariantTrack(selectedTrack, true);
        console.log('[Quality] Calidad aplicada:', selectedTrack.height, 'p');
      }
    } catch (error) {
      console.error('[Quality] Error al aplicar calidad:', error);
    }
  }

  obtener_descarga() {
    const beneficioDescarga = this.user.subscription_plan?.beneficios.find(
      beneficio => beneficio.nombre_raw === 'descargas',
    );
    if (beneficioDescarga) {
      this.descargas = beneficioDescarga.valor;
    } else {
      this.descargas = 'No'; // Valor por defecto
    }
  }

  obtener_plan_nombre() {
    const userData =
      this.user || this.authService.userData || this.authService.user;
    this.planName = userData?.subscription_plan?.nombre;
  }

  obtener_publicidad() {
    const userData =
      this.user || this.authService.userData || this.authService.user;
    const beneficioPublicidad = userData?.subscription_plan?.beneficios?.find(
      beneficio => beneficio.nombre_raw === 'publicidad',
    );
    if (beneficioPublicidad) {
      this.publicidad = beneficioPublicidad.valor;
    } else {
      this.publicidad = 'Si'; // Valor por defecto
    }
  }

  onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    this.onError(event.detail);
  }

  onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
    if (
      error.code === shaka.util.Error.Code.BAD_HTTP_STATUS &&
      error.data[1] === 404
    ) {
      if (
        this.isLiveVideoType(this.video?.tipo) &&
        !this.video.categoria.live.finalizado &&
        !this.isCheckingStream
      ) {
        // Set loop for waiting video
        this.videoElement.loop = true;
        // Load waiting video
        this.player
          .load(this.waitingVideoUrl)
          .then(() => {
            this.ui.configure(this.liveConfig);
            this.videoElement.play();
          })
          .catch(e => this.onError(e));

        // Start checking for the original stream
        this.isCheckingStream = true;
        this.checkerInterval = setInterval(() => {
          this.checkStream();
        }, 5000); // Check every 5 seconds
      }
    }
  }

  checkStream() {
    fetch(this.originalVideoUrl)
      .then(response => {
        if (response.ok) {
          // Stream is available
          clearInterval(this.checkerInterval);
          this.isCheckingStream = false;
          // Unset loop
          this.videoElement.loop = false;
          this.player.load(this.originalVideoUrl).then(() => {
            this.videoElement.play();
          });
        }
      })
      .catch(error => {
        // Stream not yet available, do nothing, the interval will try again
        console.log('Stream not available yet, trying again in 5s...');
      });
  }

  OnEnded() {
    // This logic is for the main video, as the waiting video will loop.
    // Delete video from localstorage
    if (this.localStorage.getItem(this.video.slug_url)) {
      this.localStorage.removeItem(this.video.slug_url);
    }
    
    console.log('[NextVideo] OnEnded - autoplayNext:', this.autoplayNext, 'siguiente:', !!this.siguiente);
    
    // Si autoplay está desactivado, pausar el reproductor y evitar que haga loop
    if (!this.autoplayNext) {
      this.videoElement.pause();
      // Forzar que se quede al final del video
      const duration = this.videoElement.duration;
      if (duration && duration > 0) {
        this.videoElement.currentTime = duration - 0.1;
      }
      // Prevenir que el video haga loop escuchandose
      this.videoElement.addEventListener('timeupdate', this.preventLoopHandler, { once: true });
    }
    
    // Show display next content
    this.displayNext = true;
    
    // Si autoplayNext está activo, iniciar contador para siguiente video
    if (this.autoplayNext && this.siguiente) {
      this.startAutoplayCountdown();
    }
  }

  startAutoplayCountdown() {
    this.autoplayCountdown = 10;
    this.stopAutoplayCountdown();
    this.autoplayCountdownInterval = setInterval(() => {
      this.autoplayCountdown--;
      if (this.autoplayCountdown <= 0) {
        this.stopAutoplayCountdown();
        this.nextVideo(true, true);
      }
    }, 1000);
  }

  stopAutoplayCountdown() {
    if (this.autoplayCountdownInterval) {
      clearInterval(this.autoplayCountdownInterval);
      this.autoplayCountdownInterval = null;
    }
  }

  dismissNextVideo() {
    this.stopAutoplayCountdown();
    this.displayNext = false;
  }

  saveVolume() {
    // Update volume from localstorage
    this.localStorage.setItem(
      'volume',
      JSON.stringify(this.videoElement.volume),
    );
  }

  OnEndedAds() {
    // When an ad finishes naturally, reuse skipAd() to perform cleanup
    try {
      // skipAd is async; call it and let it handle cleanup + initPlayer
      (this.skipAd as any)();
    } catch (e) {
      console.error('Error calling skipAd from OnEndedAds', e);
      // Fallback: best-effort cleanup and initialization
      try {
        this.showAd = false;
      } catch (err) {}
      try {
        this.ads && this.ads.destroy && this.ads.destroy();
      } catch (err) {}
      try {
        this.adui && this.adui.destroy && this.adui.destroy();
      } catch (err) {}
      try {
        this.initPlayer();
      } catch (err) {
        console.error(err);
      }
    }
  }

  OnPaused() {
    // Solo mostrar el card si autoplay está desactivado, hay un siguiente video,
    // Y el video está cerca del final (más del 95% reproducido)
    if (!this.autoplayNext && this.siguiente && this.videoElement.duration > 0) {
      const progress = this.videoElement.currentTime / this.videoElement.duration;
      if (progress > 0.95) {
        this.displayNext = true;
      }
    }
  }

  OnPlay() {
    // Si autoplay está activado, ocultar el card
    // Si autoplay está desactivado, solo ocultar el card si el usuario está haciendo seek (video en progreso, no al final)
    if (this.autoplayNext) {
      this.displayNext = false;
    } else if (this.videoElement.duration > 0) {
      const progress = this.videoElement.currentTime / this.videoElement.duration;
      if (progress < 0.95) {
        // El usuario está haciendo seek, ocultar el card
        this.displayNext = false;
      }
    }
  }

  playPause() {
    if (this.videoElement.paused) {
      this.videoElement.play();
    } else {
      this.videoElement.pause();
    }
  }

  openFullscreen() {
    this.controls.toggleFullScreen();
  }

  openVideoInfo() {
    if (!this.video) return;
    
    const dialogRef = this.dialog.open(VideoInfoDialogComponent, {
      data: { video: this.video },
      maxWidth: '600px',
      width: '90vw',
      panelClass: 'video-info-dialog-panel',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '150ms',
    });
  }

  muteUnmute() {
    if (this.videoElement.muted) {
      this.videoElement.muted = false;
    } else {
      this.videoElement.muted = true;
    }
  }

  openMessage() {
    let videoWidth = this.innerWidth;
    if (videoWidth > 800) {
      videoWidth = this.innerWidth / 2;
    }
    const dialogRef = this.dialog.open(DialogMessageComponent, {
      maxWidth: videoWidth,
      enterAnimationDuration: '100ms',
      exitAnimationDuration: '100ms',
    });
  }
}
