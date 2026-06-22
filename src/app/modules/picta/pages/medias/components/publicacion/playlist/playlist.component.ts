import { AfterViewInit, Component, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, input, output, inject, computed, effect } from '@angular/core';
import { PlaylistItemComponent } from '../playlist-item/playlist-item.component';
import { isPlatformBrowser } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-playlist',
    templateUrl: './playlist.component.html',
    styleUrls: ['./playlist.component.scss'],
    imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIcon, MatExpansionPanelContent, PlaylistItemComponent]
})
export class PlaylistComponent implements OnInit, AfterViewInit, OnChanges {
  readonly playlist = input<any>(undefined);
  readonly mobile = input<boolean>(undefined);
  readonly currentVideo = input<any>(undefined);
  readonly nextVideo = output();
  currentP: any;
  platformId: any;

  // Signal para rastrear cambios en el video actual
  private currentVideoId = computed(() => this.currentVideo());

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor(){
    const id = inject(PLATFORM_ID);
    this.platformId = id;

    // Effect para reaccionar a cambios en el video actual
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const videoId = this.currentVideoId();
        if (videoId) {
          // Usar setTimeout para asegurar que el DOM esté renderizado
          setTimeout(() => this.scrollToCurrentVideo(), 0);
        }
      });
    }
  }

  ngOnInit() {
    this.currentPosition();
  }

  currentPosition(){
    const video = this.playlist().publicaciones.find(video => video.id === this.currentVideo());
    this.currentP = video.posicion;
  }

  playVideo($event: any) {
    this.nextVideo.emit($event);
  }

  ngAfterViewInit(): void {
    // Scroll inicial cuando el componente está listo
    setTimeout(() => this.scrollToCurrentVideo(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Scroll cuando cambian las props
    setTimeout(() => this.scrollToCurrentVideo(), 100);
  } 

  private scrollToCurrentVideo() {
    if (!isPlatformBrowser(this.platformId)) return;

    const videoId = this.currentVideo();
    if (!videoId) return;

    // Buscar el elemento del item en el contenedor de la lista
    const itemList = document.querySelector('.item-list');
    if (!itemList) return;

    const item = itemList.querySelector(`#pl-${videoId}`) as HTMLElement;
    if (item) {
      // Scroll suave hacia el elemento, centrado en el contenedor
      item.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}
