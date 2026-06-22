import { AfterViewInit, Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { CarouselComponent } from './carousel/carousel.component';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PublicationService } from '../medias/services/publication-service';
import { AuthService } from '../../../../services/auth.service';
import { MyCarouseloComponent } from "../common-components/components/my-carousel-o/my-carouselo.component";
import { map } from 'rxjs';
import { ListenerService } from '../../services/listener.service';
import { Meta, Title } from '@angular/platform-browser';
import { CanalService } from '../canal/services/canal-service.service';
import { AsyncPipe } from '@angular/common';
@Component({
    selector: 'app-cubanradio',
    imports: [
        CarouselComponent,
        FormsModule,
        MatSliderModule,
        MatIconModule,
        MatButtonModule,
        MyCarouseloComponent,
        AsyncPipe
    ],
    templateUrl: './cubanradio.component.html',
    styles: [`
    .mat-mdc-slider {
      --mat-slider-handle-color: #3b82f6;
      --mat-slider-active-track-color: #3b82f6;
      --mat-slider-inactive-track-color: #d1d5db;
    }
  `]
})
export class CubanradioComponent implements AfterViewInit, OnInit {

  private publicacionService = inject(PublicationService);
  private authService = inject(AuthService);
  private canalService = inject(CanalService);
  
  private title = inject(Title);
  private meta = inject(Meta);

  filters: any = {
    page: 1,
    page_size: 10,
    canal_nombre_raw: 'CubanDjsPro Radio'
  };

  readonly audioElementRef = viewChild.required<ElementRef>('audioPlayer');
  audioElement: HTMLAudioElement;
  player: any;
  streamUrl = 'https://radio.picta.cu/cubandjpro';
  isPlaying = false;
  volume: number = 70;
  isMuted = false;
  previousVolume: number; // Para recordar el volumen antes de mutear
  isLoading: boolean = true;
  private _onPlayBound: () => void;
  private _onPauseBound: () => void;
  listenersCount: number = 0;
  private listenersSub: any;
  private listenerService = inject(ListenerService);

  canalBanners$ = this.canalService.getChannel('CubanDjsProRadio').pipe(
    map((response) => {
      return response.results[0].banners;
    })
  );

  top10$ = this.publicacionService.loadPublicationsFromChanelByFilters(this.filters).pipe(
    map((response) => {
      return response.results;
    })
  );

  user;

  currentShow = {
    title: "ROMÁNTICOS",
    dj: "DJ ALE",
    status: "En línea ahora",
    schedule: "10:00AM HORA DE CUBA"
  };

  ngAfterViewInit() {
    this.load();
  }

  ngOnInit(): void {
    this.title.setTitle('Picta | CubanDJsPro Radio');
    this.meta.updateTag({ name: 'description', content: 'Tu destino musical para los ritmos más vibrantes y las mejores mezclas.' });
    this.meta.updateTag({ name: 'keywords', content: 'radio, web radio, radio online, musica online, radio web, radio on line, la musica, radios dj, musica vivo, radio musical, musica online gratis musica gratis online alex sensation radio djay radio stream free music free music on line free music online for free free music online music free online music online radio on web' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: 'Picta | CubanDJsPro Radio' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://www.picta.cu/radioenvivo/cubandjsproradio' });
    this.meta.updateTag({ property: 'og:image', content: 'https://public-rf-upload.minhawebradio.net/247079/fbplayer/19171d86d4a26fec5e6ca6681cd99b7e.jpg' });
    this.meta.updateTag({ property: 'og:description', content: 'Tu destino musical para los ritmos más vibrantes y las mejores mezclas.' });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Picta' });

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Picta | CubanDjsPro Radio' });
    this.meta.updateTag({ name: 'twitter:url', content: 'https://www.picta.cu/radioenvivo/cubandjsproradio' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Tu destino musical para los ritmos más vibrantes y las mejores mezclas.' });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://public-rf-upload.minhawebradio.net/247079/fbplayer/19171d86d4a26fec5e6ca6681cd99b7e.jpg' });
    this.meta.updateTag({ name: 'twitter:site', content: '@PictaCuba' });  // Tu cuenta de Twitter

    if(this.authService.isLoggedIn()) {
        this.authService.getUserData().subscribe((res: any) => {          
          this.authService.setUserData(res);
        })
        this.authService.user$.subscribe(user => {
          if (user) {
            this.user = user;          
          } 
        });
      } 
  }

  togglePlay() {
    if (!this.player) { return; }
    if (this.player.paused) {
      const p = this.player.play();
      if (p && p.catch) { p.catch(() => {}); }
    } else {
      this.player.pause();
    }
  }

  toggleMute() {
    if (!this.player) { return; }

    if (this.player.muted) {
      // Si está muteado, desmutear y restaurar volumen
      this.player.muted = false;
      if (this.previousVolume !== undefined) {
        this.player.volume = this.previousVolume;
        this.volume = Math.round(this.previousVolume * 100);
      } else {
        this.player.volume = Math.max(0, Math.min(1, this.volume / 100));
      }
    } else {
      // Si no está muteado, guardar volumen y mutear
      this.previousVolume = this.player.volume;
      this.player.muted = true;
      this.volume = 0;
    }

    this.isMuted = !!this.player.muted;
  }

  onVolumeChange(event: any) {
    const newVolume = (typeof event === 'number') ? event : (event?.value ?? 0);
    this.volume = newVolume;
    if (!this.player) { return; }
    this.player.volume = Math.max(0, Math.min(1, this.volume / 100));

    // Si subimos el volumen, desactivar mute
    if (this.volume > 0 && this.player.muted) {
      this.player.muted = false;
      this.isMuted = false;
    }
  }

  ngOnDestroy() {
    // Cleanup player reference: pause, remove listeners and unload src to stop stream
    if (this.player) {
      try { this.player.pause(); } catch(e) {}
      try {
        if (this._onPlayBound) { this.player.removeEventListener('play', this._onPlayBound); }
        if (this._onPauseBound) { this.player.removeEventListener('pause', this._onPauseBound); }
      } catch(e) {}
      try {
        this.player.src = '';
        this.player.load();
      } catch(e) {}
      this.isPlaying = false;
      this.player = null;
    }
    if (this.listenersSub) {
      try { this.listenersSub.unsubscribe(); } catch(e) {}
      this.listenersSub = null;
    }
  }

  onAudioPlay() {
    this.countReproduccion();
    this.isPlaying = true;
  }

  onAudioPause() {
    this.isPlaying = false;
  }

  private load() {
    if (this.user) {
      this.countVisit(this.user.username);
    } else {
      this.countVisit('anonimo');
    }
    this.player = this.audioElementRef().nativeElement as HTMLAudioElement;

    // Configure audio element for Icecast stream
    try {
      if (!this.player.src || !this.player.src.includes(this.streamUrl)) {
        this.player.src = this.streamUrl;
      }
      this.player.autoplay = true;
      this.player.volume = Math.max(0, Math.min(1, this.volume / 100));
      this.player.muted = this.isMuted;
      this.player.load();
      const p = this.player.play();
      if (p && p.then) {
        p.then(() => {
          this.isPlaying = !this.player.paused;
        }).catch(() => {});
      }

      // Attach listeners so UI reflects actual playback state
      this._onPlayBound = () => this.onAudioPlay();
      this._onPauseBound = () => this.onAudioPause();
      this.player.addEventListener('play', this._onPlayBound);
      this.player.addEventListener('pause', this._onPauseBound);
      this.player.addEventListener('ended', this._onPauseBound);
      // Start polling listeners via ListenerService
      this.listenersSub = this.listenerService.pollListeners('cubandjpro', 20000).subscribe(n => this.listenersCount = n);
    } catch (e) {
      console.warn('audio init error', e);
    }
  }


  countReproduccion(): any {
    this.publicacionService.countReproduccion(45562, this.authService.isLoggedIn()).subscribe()
  }

  countVisit(usuario: any): any {
    this.publicacionService.countVisit(45562, '', usuario).subscribe() 
  }

  private updateAudioVolume(): void {    
    // Asegurar que el volumen esté entre 0 y 1
    const volumeValue = Math.max(0, Math.min(1, this.volume / 100));
    
    if (!isNaN(volumeValue)) {
      if (this.player) { this.player.volume = volumeValue; }
      
      // Actualizar estado de mute si el volumen cambia
      if (volumeValue > 0 && this.isMuted) {
        this.isMuted = false;
        if (this.player) { this.player.muted = false; }
      } else if (volumeValue === 0 && !this.isMuted) {
        this.isMuted = true;
        if (this.player) { this.player.muted = true; }
      }
    }
  }
}
