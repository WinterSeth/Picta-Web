import { Component, OnInit, PLATFORM_ID, input, inject } from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {DownloadPopupComponent} from '../../../../components/download-popup/download-popup.component';
import {Publication} from '../../../medias/models/publicacion.model';
import { isPlatformBrowser, AsyncPipe, UpperCasePipe, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-portada',
    templateUrl: './portada.component.html',
    styleUrls: ['./portada.component.scss'],
    imports: [NgOptimizedImage]
})
export class PortadaComponent {
  private sanitizer = inject(DomSanitizer);
  private bottomSheet = inject(MatBottomSheet);
  private platformId = inject(PLATFORM_ID);

  readonly videoPortada = input<Publication>(undefined);
  readonly imagenPortada = input<string>(undefined);
  readonly isLoggedIn = input<boolean>(undefined);
  innerWidth: number;
  innerHeigth: number;
  private poster: SafeStyle;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth + 200;
      this.innerHeigth = window.innerHeight;
    }
  }
  

/*   get descarga() {
    return JSON.parse(this.videoPortada?.descarga);
  } */

  get genero() {
    const videoPortada = this.videoPortada();
    return videoPortada.categoria.pelicula && videoPortada.categoria.pelicula.genero.map(g => g.nombre)
      || videoPortada.categoria.video && videoPortada.categoria.video.genero.map(g => g.nombre);
  }

  quality(key) {
    switch (key) {
      case 'low': {
        return '144P';
      }
      case 'medium': {
        return '360P';
      }
      case 'high': {
        return '720P';
      }
    }
    return '480P';
  }

  openDownload() {
    const ref = this.bottomSheet.open(DownloadPopupComponent, {
      data: {video: this.videoPortada()},
      panelClass: 'bottomSheet',
    });
  }
}
