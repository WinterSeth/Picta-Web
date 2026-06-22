import { Component, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import Hls from 'hls.js';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PublicationService, VideoShort } from '../../medias/services/publication-service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../../services/auth.service';
import { LocalstorageService } from '../../../../../services/localstorage.service';
import { SubscriptionService } from '../../../../../services/subscription.service';
import { ConfirmDialogComponent } from '../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import { ComentarioService } from '../../medias/services/comentario.service';
import { VotoService } from '../../medias/services/voto.service';
import { CommentsSheetService } from '../services/comments-sheet.service';
import { ShareButtonComponent } from '../components/share-button/share-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location, NgClass, NgStyle } from '@angular/common';
import { ShortNumbersPipe } from '../../medias/pipes/short-numbers.pipe';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
    selector: 'app-short',
    providers: [ShortNumbersPipe],
  imports: [DecimalPipe, ShareButtonComponent, RouterLink, MatIconModule, MatButtonModule, MatTooltipModule, ShortNumbersPipe, NgClass, MatMenuModule, NgStyle, MatProgressSpinnerModule],
    templateUrl: './short.component.html',
    styleUrl: './short.component.scss'
})
export class ShortComponent implements OnInit, OnDestroy, AfterViewInit {
  private publicationService = inject(PublicationService);
  private votoService = inject(VotoService);
  private comentarioService = inject(ComentarioService);
  authService = inject(AuthService);
  private commentsSheetService = inject(CommentsSheetService);
  private subscribeService = inject(SubscriptionService);
  dialog = inject(MatDialog);
  private localStorage = inject(LocalstorageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  readonly videoContainer = viewChild.required<ElementRef>('videoContainer');
  private location = inject(Location);
  
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
  errorMessage = signal<string | null>(null); // ← AÑADIR ESTA LÍNEA
  
  // Private properties
  private currentHlsInstance: Hls | null = null;
  private isHlsSupported: boolean = Hls.isSupported();

  votoExistente: any;

  subscribed = signal(false);
  subscribing = signal(false);
  notificationMode: 'all' | 'none' = 'all';
  subscription;
  currentVote: any = null;
  isLiked = false;
  likeLoading = signal(false);
  dislikeLoading = signal(false);
  commentsPage: any;
  user: any;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.user = this.authService.userData;
    this.loadSpecificShort();
  }

  ngAfterViewInit() {
    // El video se configura después de cargar los datos
  }

  ngOnDestroy() {
    this.destroyCurrentHls();
  }

    loadComentarios() {
    this.comentarioService.comentariosByPost({ publicacion_id: this.short()?.id, page: 1, page_size: 10}).subscribe((data: any) => {      
        if (!this.short().lista_comentarios) {
          this.short().lista_comentarios = data;
        } else {
          this.short().lista_comentarios.result = this.short().lista_comentarios.results.concat(data.results);
        }
        this.commentsPage = data.next;
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

    // Método para retroceder
  goBack() {
    // Si hay historial de navegación, retrocede
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Si no hay historial, redirige a la página de shorts
      this.router.navigate(['/shorts']);
    }
  }

  openComments(): void {
    this.commentsSheetService.openCommentsSheet(
      this.short(),
      this.user
    );
  }

  private loadSpecificShort() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      
      if (!slug) {
        this.errorMessage.set('URL inválida');
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      this.publicationService.getShortBySlug(slug).pipe(
        catchError(error => {
          console.error('Error loading short:', error);
          if (error.status === 404) {
            this.errorMessage.set('Short no encontrado');
          } else {
            this.errorMessage.set('Error al cargar el short');
          }
          this.isLoading.set(false);
          return of(null);
        })
      ).subscribe({
        next: (short) => {
          if (short) {
            this.short.set(short);
            this.isLoading.set(false);
            this.likeLoading.set(false);

            this.subscribeService.getSubscriptionsByUser({usuarioNombre: this.user.username, canalId: this.short().canal.id,}).subscribe((res: any) => {
              this.subscription = res.results.filter( sub => sub.canal.id === this.short().canal.id )[0];
              if (this.subscription) {
                this.subscribed.set(true);
                this.notificationMode = this.checkIfSilenced() ? 'none' : 'all';
              }
            });

            this.countVisit(this.user.username);
            this.getVoto();
            this.loadComentarios();
            this.cantidad_me_gusta.set(this.short().cantidad_me_gusta);
            this.cantidad_no_me_gusta.set(this.short().cantidad_no_me_gusta);
            this.cantidad_comentarios.set(this.short().cantidad_comentarios);
            
            // Pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
              this.setupCurrentVideo();
            }, 100);
          } else {
            this.errorMessage.set('Short no disponible');
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          console.error('Error in short loading:', error);
          this.errorMessage.set('Error al cargar el short');
          this.isLoading.set(false);
        }
      });
    });
  }

  private setupCurrentVideo() {
    this.destroyCurrentHls();
    
    const short = this.short();
    const videoElement = this.getCurrentVideoElement();
    
    if (videoElement && short && short.url_manifiesto) {
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
        console.log('HLS manifest parsed successfully');
        this.playCurrentVideo();
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
              this.errorMessage.set('Error al reproducir el video');
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Soporte nativo para HLS (Safari)
      videoElement.src = manifestUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        this.playCurrentVideo();
      });
      videoElement.addEventListener('error', () => {
        this.errorMessage.set('Error al reproducir el video');
      });
    } else {
      this.errorMessage.set('Tu navegador no soporta este formato de video');
    }
  }

  private destroyCurrentHls() {
    if (this.currentHlsInstance) {
      this.currentHlsInstance.destroy();
      this.currentHlsInstance = null;
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
      // Already subscribed - just close menu
      this.subscribing.set(false);
    }
  }

  handleNotificationChange(mode: 'all' | 'none') {
    if (this.subscribing() || !this.subscribed()) return;
    
    // Save to localStorage (wrap to catch storage errors)
    try {
      this.saveSilencedChannel(mode);
      this.notificationMode = mode;
      this.subscribing.set(false);
      if (mode === 'none') {
        this.notificationService.open('ok', 'Notificaciones desactivadas para el canal');
      } else {
        this.notificationService.open('ok', 'Notificaciones activadas para el canal');
      }
    } catch (err) {
      console.error('Error changing notification mode:', err);
      this.notificationService.open('error', 'No se pudo cambiar la configuración de notificaciones');
      this.subscribing.set(false);
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
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          // show loading state while unsubscribing
          this.subscribing.set(true);
          this.subscribeService.unsubscribe(this.subscription.id).pipe().subscribe({
            next: () => {
              this.subscribed.set(false);
              this.subscription = null;
              this.notificationMode = 'all';
              // Remove from silenced channels
              this.saveSilencedChannel('all');
              this.notificationService.open('ok', 'Se dejó de seguir el canal exitosamente.');
              this.subscribing.set(false);
            },
            error: (err) => {
              console.error('Error unsubscribing:', err);
              this.notificationService.open('error', 'No se pudo dejar de seguir el canal');
              this.subscribing.set(false);
            }
          });
        }
      });
  }

  playCurrentVideo() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
        this.errorMessage.set('Error al reproducir el video');
      });
      this.isPlaying.set(true);
    }
  }

  pauseCurrentVideo() {
    const videoElement = this.getCurrentVideoElement();
    if (videoElement) {
      videoElement.pause();
      this.isPlaying.set(false);
    }
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

  goBackToShorts() {
    this.router.navigate(['/shorts']);
  }

  retryLoad() {
    this.errorMessage.set(null);
    this.loadSpecificShort();
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