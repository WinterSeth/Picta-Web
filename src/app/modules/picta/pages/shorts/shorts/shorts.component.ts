import { Component, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, HostListener, viewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import Hls from 'hls.js';
import { PublicationService, ShortsResponse, VideoShort } from '../../medias/services/publication-service';
import { ShareButtonComponent } from '../components/share-button/share-button.component';
import { VotoService } from '../../medias/services/voto.service';
import { ComentarioService } from '../../medias/services/comentario.service';
import { AuthService } from '../../../../../services/auth.service';
import { CommentsSheetService } from '../services/comments-sheet.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import { SubscriptionService } from '../../../../../services/subscription.service';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../../services/notification.service';
import { finalize } from 'rxjs';
import { LocalstorageService } from '../../../../../services/localstorage.service';
import { ShortNumbersPipe } from '../../medias/pipes/short-numbers.pipe';
import { NgClass, NgStyle } from '@angular/common';
@Component({
    selector: 'app-shorts',
    providers: [ShortNumbersPipe],
  imports: [DecimalPipe, ShareButtonComponent, RouterLink, MatIconModule, MatButtonModule, MatTooltipModule, ShortNumbersPipe, NgClass, NgStyle, MatMenuModule, MatProgressSpinner],
    templateUrl: './shorts.component.html',
    styleUrl: './shorts.component.scss'
})
export class ShortsComponent implements OnInit, OnDestroy, AfterViewInit {
  private publicationService = inject(PublicationService);
  private router = inject(Router);
  private votoService = inject(VotoService);
  private comentarioService = inject(ComentarioService);
  authService = inject(AuthService);
  private commentsSheetService = inject(CommentsSheetService);
  private subscribeService = inject(SubscriptionService);
  dialog = inject(MatDialog);
  private localStorage = inject(LocalstorageService);
  private notificationService = inject(NotificationService);

  readonly videoContainer = viewChild.required<ElementRef>('videoContainer');
  
  // Signals
  short = signal<VideoShort | null>(null);
  shortsList = signal<VideoShort[]>([]);
  currentIndex = signal(0);
  isPlaying = signal(false);
  isLoading = signal(false);
  isMuted = signal(false);
  isFullscreen = signal(false);
  cantidad_me_gusta = signal(0);
  cantidad_no_me_gusta = signal(0);
  cantidad_comentarios = signal(0);

  liked = signal(false);       // ← Agregar este signal
  disliked = signal(false);    // ← Agregar este signal
  commentsPage = 1;
  private readonly COMMENTS_PER_PAGE = 10;

  votoExistente: any;
  
  // Private properties
  private currentHlsInstance: Hls | null = null;
  private isHlsSupported: boolean = Hls.isSupported();
  private currentPage = 1;
  private hasMoreShorts = true;
  private isScrolling = false;

  subscribed = signal(false);
  subscribing = signal(false);
  // indica que se está cargando el estado inicial de suscripción
  subscriptionLoading = signal(false);
  likeLoading = signal(false);
  dislikeLoading = signal(false);
  notificationMode: 'all' | 'none' = 'all';
  subscription;
  currentVote: any = null;

  user;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.user = this.authService.userData;
    this.loadShorts();
  }

  ngAfterViewInit() {
    this.setupSwipeGestures();
    this.setupWheelNavigation();
  }

  ngOnDestroy() {
    this.destroyCurrentHls();
  }

handleSubscribe() {
    if (this.subscribing()) return;
    this.subscribing.set(true);

    if (!this.subscribed()) {
      // Not subscribed - subscribe with notifications (all)
      this.subscribeService.subscribe(this.short().canal.id).subscribe({
        next: (res) => {
          this.subscribed.set(true);
          this.subscribing.set(false);
          this.subscription = res;
          this.notificationMode = 'all';
          this.notificationService.open('ok', 'Has empezado a seguir el canal');
        },
        error: (err) => {
          this.subscribing.set(false);
          console.error('Error subscribing:', err);
          this.notificationService.open('error', 'No se pudo seguir el canal');
        }
      });
    } else {
      // Already subscribed - just close menu (handled by clicking the button)
      this.subscribing.set(false);
    }
  }

  handleNotificationChange(mode: 'all' | 'none') {
    if (this.subscribing() || !this.subscribed()) return;
    
    // Save to localStorage
    this.saveSilencedChannel(mode);
    
    this.notificationMode = mode;
    this.subscribing.set(false);
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
    const channelName = this.short().canal.nombre;
    let silenced = this.getSilencedChannels();
    
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
    return silenced.includes(this.short().canal.nombre);
  }

  handleUnsubscribe() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          msg: `¿Estás seguro que deseas cancelar tu suscripción al canal ${this.short().canal.nombre}?`,
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
          this.subscribing.set(true);
          this.subscribeService.unsubscribe(this.subscription.id).pipe(finalize(() => this.subscribing.set(false))).subscribe({
            next: () => {
              this.subscribed.set(false);
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
          });
        }
    });
  }

  openComments(): void {
    this.commentsSheetService.openCommentsSheet(
      this.short(),
      this.user
    );
  }

  // ========== CARGA DE SHORTS ==========

  private loadShorts() {
    this.isLoading.set(true);
    
    this.publicationService.getShorts(this.currentPage).subscribe({
      next: (response: ShortsResponse) => {
        const newShorts = response.results;
        
        if (this.currentPage === 1) {
          this.shortsList.set([...newShorts]);
        } else {
          this.shortsList.update(current => [...current, ...newShorts]);
        }
        
        this.hasMoreShorts = response.next !== null;
        
        if (newShorts.length > 0 && !this.short()) {
          this.loadShortByIndex(0);
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading shorts:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadShortByIndex(index: number) {
    if (index >= 0 && index < this.shortsList().length) {
      this.destroyCurrentHls();
      this.currentIndex.set(index);
      this.short.set(this.shortsList()[index]);

      this.subscriptionLoading.set(true);
      this.subscribeService.getSubscriptionsByUser({usuarioNombre: this.user.username, canalId: this.short().canal.id,}).pipe(finalize(() => {
        this.subscriptionLoading.set(false);
      })).subscribe((res: any) => {
        this.subscription = res.results.filter( sub => sub.canal.id === this.short().canal.id )[0] || null;
        this.subscribed.set(!!this.subscription);
        if (this.subscription) {
          this.notificationMode = this.checkIfSilenced() ? 'none' : 'all';
        }
      });

      this.countVisit(this.user.username);
      this.getVoto();
      this.loadComentarios();
      this.cantidad_me_gusta.set(this.short().cantidad_me_gusta);
      this.cantidad_no_me_gusta.set(this.short().cantidad_no_me_gusta);
      this.cantidad_comentarios.set(this.short().cantidad_comentarios);
      
      this.isLoading.set(false);
      setTimeout(() => this.setupCurrentVideo(), 100);
    } else if (index >= this.shortsList().length && this.hasMoreShorts) {
      this.currentPage++;
      this.loadShorts();
    }
  }

  loadComentarios() {
    this.comentarioService.comentariosByPost({ publicacion_id: this.short()?.id, page: 1, page_size: this.COMMENTS_PER_PAGE,}).subscribe((data: any) => {      
        if (!this.short().lista_comentarios) {
          this.short().lista_comentarios = data;
        } else {
          this.short().lista_comentarios.result = this.short().lista_comentarios.results.concat(data.results);
        }
        this.commentsPage = data.next;
      });
  }

  // ========== MANEJO DE VIDEO HLS ==========

  private setupCurrentVideo() {
    this.destroyCurrentHls();
    
    const short = this.short();
    const videoElement = this.getCurrentVideoElement();
    
    if (videoElement && short) {
      this.setupHlsForVideo(videoElement, short.url_manifiesto);
    }
  }

  private setupHlsForVideo(videoElement: HTMLVideoElement, manifestUrl: string) {
    if (this.isHlsSupported) {
      this.currentHlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      this.currentHlsInstance.loadSource(manifestUrl);
      this.currentHlsInstance.attachMedia(videoElement);

      this.currentHlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        this.playCurrentVideo();
        this.countReproduccion()
      });

      this.currentHlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.currentHlsInstance?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.currentHlsInstance?.recoverMediaError();
              break;
            default:
              this.destroyCurrentHls();
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = manifestUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        this.playCurrentVideo();
      });
    }
  }

  private destroyCurrentHls() {
    if (this.currentHlsInstance) {
      this.currentHlsInstance.destroy();
      this.currentHlsInstance = null;
    }
  }

  // ========== NAVEGACIÓN ==========

  private setupSwipeGestures() {
    let startY = 0;
    const container = this.videoContainer().nativeElement;

    container.addEventListener('touchstart', (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const diffY = startY - endY;

      if (Math.abs(diffY) > 100) {
        if (diffY > 0) {
          this.nextShort();
        } else {
          this.previousShort();
        }
      }
    }, { passive: true });
  }

  private setupWheelNavigation() {
    const container = this.videoContainer().nativeElement;
    
    container.addEventListener('wheel', (e: WheelEvent) => {
      if (this.isScrolling) return;
      
      this.isScrolling = true;
      
      if (e.deltaY > 0) {
        this.nextShort();
      } else if (e.deltaY < 0) {
        this.previousShort();
      }
      
      e.preventDefault();
      
      setTimeout(() => {
        this.isScrolling = false;
      }, 1000);
    }, { passive: false });
  }

  nextShort() {
    const nextIndex = this.currentIndex() + 1;
    this.loadShortByIndex(nextIndex);
  }

  previousShort() {
    const prevIndex = this.currentIndex() - 1;
    if (prevIndex >= 0) {
      this.loadShortByIndex(prevIndex);
    }
  }

  // ========== CONTROLES DE VIDEO ==========

  async playCurrentVideo() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      try {
        await videoElement.play();
        this.isPlaying.set(true);
      } catch (error) {
        console.error('Error al reproducir el video:', error);
        this.isPlaying.set(false);
      }
    }
  }

  pauseCurrentVideo() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      videoElement.pause();
      this.isPlaying.set(false);
    }
  }

  togglePlay() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        this.isPlaying.set(true);
      } else {
        videoElement.pause();
        this.isPlaying.set(false);
      }
    }
  }

  toggleMute() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      this.isMuted.set(videoElement.muted);
    }
  }

  toggleFullscreen() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoElement.requestFullscreen().catch(console.error);
      }
    }
  }

  getProgress(): number {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement && videoElement.duration) {
      return (videoElement.currentTime / videoElement.duration) * 100;
    }
    return 0;
  }

  private getCurrentVideoElement(): HTMLVideoElement | null {
    return document.getElementById('short-video') as HTMLVideoElement;
  }

  // ========== MANEJO DE TECLADO ==========

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.nextShort();
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.previousShort();
      event.preventDefault();
    } else if (event.key === ' ') {
      this.togglePlay();
      event.preventDefault();
    }
  }

  // ========== NAVEGACIÓN A SHORT ESPECÍFICO ==========
  
  openShortDetail(short: VideoShort) {
    this.router.navigate(['/short', short.slug_url]);
  }

  getVoto() {
    this.likeLoading.set(true);
    this.dislikeLoading.set(true);
    this.votoService
      .getVotoByPublicacion(this.short().id)
      .subscribe({
        next: (votes: any) => {
          if (votes.results.length > 0) {
            console.log(votes.results[0]);
            this.votoExistente = votes.results[0];
            if(this.votoExistente.valor){
              this.liked.set(true);
              this.disliked.set(false);
            } else {
              this.liked.set(false);
              this.disliked.set(true);
            }
          } else {
            this.votoExistente = null;
            this.liked.set(false);
            this.disliked.set(false);
          }
        },
        error: (error) => {
          console.error('Error al verificar voto:', error);
        },
        complete: () => {
          this.likeLoading.set(false);
          this.dislikeLoading.set(false);
        }
      });
  }

  countVisit(usuario: any): any {
    if(this.localStorage.getItem(JSON.stringify(this.short().id))){
      var temp =  JSON.parse(this.localStorage.getItem(this.short().id));
      if(!temp.visita){
        temp.visita = true;
        this.localStorage.setItem(JSON.stringify(this.short().id), JSON.stringify(temp));
          this.publicationService
            .countVisit(this.short().id, '', usuario)
            .subscribe()

      } else {
        if(this.short().categoria.tipologia.modelo == 'pelicula' || this.short().categoria.tipologia.modelo == 'capitulo'){
          var ads_views = this.localStorage.getItem('ads');
          ads_views++;
          this.localStorage.setItem('ads', ads_views);
        }
      }
    }else{
      var video = {"visita": true };
      this.localStorage.setItem(JSON.stringify(this.short().id), JSON.stringify(video));
        this.publicationService
          .countVisit(this.short().id, '', usuario)
          .subscribe()
      if(this.short().categoria.tipologia.modelo == 'pelicula' || this.short().categoria.tipologia.modelo == 'capitulo'){
        var ads_views = this.localStorage.getItem('ads');
        ads_views++;
        this.localStorage.setItem('ads', ads_views);
      }
    }
  }

  countReproduccion(): any {
    if(this.localStorage.getItem(JSON.stringify(this.short().id))){
      var temp =  JSON.parse(this.localStorage.getItem(this.short().id));
      if(!temp.reproduccion){
        temp.reproduccion = true;
        this.localStorage.setItem(JSON.stringify(this.short().id), JSON.stringify(temp));
        this.publicationService.countReproduccion(this.short().id, this.authService.isLoggedIn())
          .subscribe()
      }
    }else{
      var video = {"reproduccion": true};
      this.localStorage.setItem(JSON.stringify(this.short().id), JSON.stringify(video));
      this.publicationService.countReproduccion(this.short().id, this.authService.isLoggedIn())
          .subscribe()
    }
  }

  handleLike() {
    if (this.likeLoading()) return;

    this.likeLoading.set(true); // Habilitar el estado de carga

    if (!this.votoExistente) { // Si no existe voto, crear un nuevo like (valor = true)      
      this.votoService.vote(this.short().id, true)
      .subscribe({
          next: (votes: any) => {
            if (votes) {
              this.votoExistente = votes;
              this.cantidad_me_gusta.set(this.cantidad_me_gusta()+1)
              this.liked.set(true);
            }
          },
          error: (error) => {
            console.error('Error al verificar voto:', error);
          },
          complete: () => {
            this.likeLoading.set(false);
          }
        });
    } else {      
      if (this.votoExistente.valor) { // Si existe voto true, eliminar el voto existente
        this.votoService.deleteVote(this.votoExistente.id)
        .subscribe({
          next: (votes: any) => {
              this.votoExistente = null;
              this.cantidad_me_gusta.set(this.cantidad_me_gusta()-1)
              this.liked.set(false);
          },
          error: (error) => {
            console.error('Error al verificar voto:', error);
          },
          complete: () => {
            this.likeLoading.set(false);
          }
        });
      } else { // Si existe voto false, actualizar el voto existente
        this.votoService.updateVote(this.votoExistente.id, true)
        .subscribe({
          next: (votes: any) => {
              this.votoExistente = votes;
              this.cantidad_me_gusta.set(this.cantidad_me_gusta()+1)
              this.cantidad_no_me_gusta.set(this.cantidad_no_me_gusta()-1)
              this.liked.set(true);
              this.disliked.set(false);
          },
          error: (error) => {
            console.error('Error al verificar voto:', error);
          },
          complete: () => {
            this.likeLoading.set(false);
          }
        });
      }
    }
  }

  handleDisLike() {
    if (this.dislikeLoading()) return;

    this.dislikeLoading.set(true); // Habilitar el estado de carga

    if (!this.votoExistente) { // Si no existe voto, crear un nuevo dislike (valor = false)      
      this.votoService.vote(this.short().id, false)
      .subscribe({
          next: (votes: any) => {
            if (votes) {
              this.votoExistente = votes;
              this.cantidad_no_me_gusta.set(this.cantidad_no_me_gusta()+1);
              this.disliked.set(true);
            }
          },
          error: (error) => {
            console.error('Error al verificar voto:', error);
          },
          complete: () => {
            this.dislikeLoading.set(false);
          }
        });
    } else {      
      if (!this.votoExistente.valor) { // Si existe voto en false, eliminar el voto existente
        this.votoService.deleteVote(this.votoExistente.id)
        .subscribe({
          next: (votes: any) => {
              this.votoExistente = null;
              this.cantidad_no_me_gusta.set(this.cantidad_no_me_gusta()-1)
              this.disliked.set(false);
          },
          error: (error) => {
            console.error('Error al verificar voto:', error);
          },
          complete: () => {
            this.dislikeLoading.set(false);
          }
        });
      } else { // Si existe voto en true, actualizar el voto existente
        this.votoService.updateVote(this.votoExistente.id, false)
        .subscribe({
          next: (votes: any) => {
            this.votoExistente = votes;
              this.cantidad_no_me_gusta.set(this.cantidad_no_me_gusta()+1);
              this.cantidad_me_gusta.set(this.cantidad_me_gusta()-1)
              this.disliked.set(true);
              this.liked.set(false);
          },
          error: (error) => {
            console.error('Error al verificar voto:', error);
          },
          complete: () => {
            this.dislikeLoading.set(false);
          }
        });
      }
    }
  }

  toggleLike() {
    this.liked.set(!this.liked());
    if (this.liked()) {
      this.disliked.set(false);
    }
  }

  toggleDislike() {
    this.disliked.set(!this.disliked());
    if (this.disliked()) {
      this.liked.set(false);
    }
  }

  goToChannel(channelName: string) {
    this.router.navigate(['/canal', channelName]);
  }
}