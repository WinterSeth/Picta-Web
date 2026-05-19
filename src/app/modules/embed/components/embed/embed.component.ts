import { Component, ElementRef, inject, OnInit, PLATFORM_ID, input, viewChild } from '@angular/core';
import {PublicationService} from '../../../picta/pages/medias/services/publication-service';
import { Platform } from '@angular/cdk/platform';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from '../../../../services/auth.service';
import { LocalstorageService } from '../../../../services/localstorage.service';
import {MatButtonModule} from '@angular/material/button';

import Hls from 'hls.js';

import { Observable } from 'rxjs';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-embed',
    templateUrl: './embed.component.html',
    styleUrls: ['./embed.component.scss'],
    imports: [MatButtonModule, MatDialogContent, NgClass, MatIcon]
})
export class EmbedComponent implements OnInit {
  private platform = inject(Platform);
  private dialogRef = inject<MatDialogRef<EmbedComponent>>(MatDialogRef, { optional: true });
  data = inject(MAT_DIALOG_DATA, { optional: true })!;
  private localStorage = inject(LocalstorageService);

  private publicacionService = inject(PublicationService);
  public authService = inject(AuthService);

  readonly slugUrl = input.required<string>();

  videoEmbed$: Observable<any>;

  slug: string;
  video: any;
  player: any;
  isCounted = false;
  platformId: any;

  poster: string = '';
  private hls = new Hls();

  protected showQualityMenu = false;
  protected showAudioMenu = false;
  protected qualityOptions: any[] = [];
  protected audioOptions: any[] = [];
  protected currentQuality = 'auto';
  protected currentAudioTrack = 0;

  user;

  readonly videoChromeElementRef = viewChild.required<ElementRef>('videoEmbed');

  videoChromeElement: HTMLVideoElement;

  embed: boolean = true;
  listener: any;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const id = inject(PLATFORM_ID);

    this.platformId = id;
  }

  ngAfterViewInit(): void {
    this.videoChromeElement = this.videoChromeElementRef().nativeElement;   
    if(this.data){    
      this.embed = false;
      this.slug = this.data.video;
      this.loadVideos(this.slug);
    } else {
      this.embed = true;
      this.loadChrome(`https://www.picta.cu/embed/${this.slugUrl()}/master.m3u8`);
    }
  }

  ngOnInit() {
    
  }

  closeDialog(): void {
    this.dialogRef?.close();
  }

  loadVideos(slug: string) {
    this.publicacionService.loadPublication(slug).subscribe(response => {
      if (response.results.length > 0) {
        this.video = response.results[0];
        this.authService.user$.subscribe(user => {
          if (user) {
            this.user = user;
          }
        });
        if (this.user) {
          this.countVisit(this.user.username);
        } else {
            this.countVisit('Anonimo');
        }
        this.loadChrome(this.video.url_manifiesto.replace('/manifest.mpd', '/master.m3u8'));
      }
    }); 
  }

  private async loadChrome(currentVideo: string) {
		if (Hls.isSupported()) {            
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30
      });

			this.loadVideoWithHLSChrome(currentVideo);
		} else {
			if (this.videoChromeElement.canPlayType('application/vnd.apple.mpegurl')) {        
				this.loadVideo(currentVideo);
			}
		}
	}

    /**
	 * Load the video with HLS support.
	 * @param currentVideo video URL
	 */
	private loadVideoWithHLSChrome(currentVideo: string) {
    //this.videoChromeElement = this.videoChromeElementRef?.nativeElement;   
    //this.videoChromeElement.poster = this.video.url_imagen+'_600x300'; 
    
    console.log(this.videoChromeElement);
    
    
		this.hls.loadSource(currentVideo);
    this.hls.attachMedia(this.videoChromeElement);

		this.hls.on(Hls.Events.MANIFEST_PARSED, () => this.videoChromeElement.play());

    this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      this.setupQualityOptions(data.levels);
      this.setupAudioOptions(data.audioTracks);
      this.countReproduccion();
      this.videoChromeElement.play().catch(e => console.error('Error al reproducir:', e));
    });
	}

    private setupQualityOptions(levels: any[]) {
    this.qualityOptions = levels.map((level, index) => ({
      id: index,
      label: this.getQualityLabel(level.height),
      selected: index === this.hls?.currentLevel
    }));

    // Añadir opción "auto"
    this.qualityOptions.unshift({
      id: -1,
      label: 'Auto',
      selected: this.hls?.currentLevel === -1
    });

    this.showQualityMenu = levels.length > 1;
  }

  private setupAudioOptions(audioTracks: any[]) {
    this.audioOptions = audioTracks?.map((track, index) => ({
      id: index,
      label: track.name || `Audio ${index + 1}`,
      selected: index === this.currentAudioTrack
    })) || [];

    this.showAudioMenu = this.audioOptions.length > 3;
  }

  changeQuality(levelId: number) {
    if (this.hls) {
      this.hls.currentLevel = levelId;
      this.currentQuality = levelId === -1 ? 'auto' : this.getQualityLabel(this.hls.levels[levelId].height);
    }
  }

  changeAudioTrack(trackId: number) {
    this.currentAudioTrack = trackId;
    if (this.hls && this.hls.audioTracks) {
      this.hls.audioTrack = trackId;
    }
  }

  private getQualityLabel(height: number): string {
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    return `${height}p`;
  }

    /**
	 * Load video without HLS support.
	 * @param currentVideo video URL
	 */
	private loadVideo(currentVideo: string) {
		this.videoChromeElement.src = currentVideo;
	}

  countReproduccion(): any {
    if(this.localStorage.getItem(JSON.stringify(this.video.id))){
      var temp =  JSON.parse(this.localStorage.getItem(this.video.id));
      if(!temp.reproduccion){
        temp.reproduccion = true;
        this.localStorage.setItem(JSON.stringify(this.video.id), JSON.stringify(temp));
        this.publicacionService.countReproduccion(this.video.id, this.authService.isLoggedIn()).subscribe();
      }
    }else{
      var video = {"reproduccion": true};
      this.localStorage.setItem(JSON.stringify(this.video.id), JSON.stringify(video));
      this.publicacionService.countReproduccion(this.video.id, this.authService.isLoggedIn()).subscribe()
    }
  }

  countVisit(usuario: any): any {
    if(this.localStorage.getItem(JSON.stringify(this.video.id))){
      var temp =  JSON.parse(this.localStorage.getItem(this.video.id));
      if(!temp.visita){
        temp.visita = true;
        this.localStorage.setItem(JSON.stringify(this.video.id), JSON.stringify(temp));
        
          this.publicacionService
            .countVisit(this.video.id, window.location.href, usuario)
            .subscribe()
      }
    }else{
      var video = {"visita": true };
      this.localStorage.setItem(JSON.stringify(this.video.id), JSON.stringify(video));
        this.publicacionService
          .countVisit(this.video.id, window.location.href, usuario)
          .subscribe()
    
    }
  }
}
