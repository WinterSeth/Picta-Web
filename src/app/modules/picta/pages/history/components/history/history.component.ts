import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PublicationService } from '../../../medias/services/publication-service';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Observable, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ShortNumbersPipe } from '../../../medias/pipes/short-numbers.pipe';
import { MatButtonModule } from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
    selector: 'app-history',
    imports: [AsyncPipe, NgOptimizedImage, RouterLink, MatProgressSpinner, MatIconModule, ShortNumbersPipe, MatButtonModule, MatProgressBarModule],
    templateUrl: './history.component.html',
    styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private title = inject(Title);
  private publicationService = inject(PublicationService);

  recomendados$: Observable<any[]>;
  isLoading: boolean = true;

  newSections: Array<any> = [];
  publicaciones: Array<any> = [];

  ngOnInit(): void {
    this.title.setTitle('Historial Reproducción');  
    this.continueWatching();
  }

  continueWatching() {
    const keys = [];
    let limit = 0
    for (let i = 0; i < localStorage.length; i++) {
      if (limit >= 20) {
        break; // Detiene el bucle si limit es igual a 10
      }
      const key = localStorage.key(i);
      if (key && key.length > 12 && !key.startsWith('media-chrome-pref')) {
        keys.push(key);
        limit++;
      }
    }
    if (keys.length > 0) {
      const data: any = { nombre: 'Continuar Viendo', estilo: 'carrusel', filtros: [{ key: 'slug_url_raw__in', value: keys.join('__') }] };
      this.loadPublicationsBySection(data)
      this.newSections.push(data);
    }
  }

  getProgres(episode) {
    if (localStorage.getItem(episode.slug_url)) {
      //console.log(this.canal.nombre);
      const duration = episode.duracion;
      const a = duration.split(':'); // split
      let seconds = 0;
      if (a.length === 3) {
        seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
      } else if (a.length === 2) {
        seconds = (+a[0]) * 60 + (+a[1]);
      } else {
        seconds = (+a[0]);
      }
      return parseFloat(localStorage.getItem(episode.slug_url)) / seconds * 100;
    }
    return null;
  }

  deleteVideo(url){
    localStorage.removeItem(url);
  }

  private loadPublicationsBySection(section: any) {    
   this.publicationService.getByFiltros(section.filtros, '1', '20').subscribe({
      next: (response: any) => {
        this.recomendados$ = of(response.results); // Emite los resultados
      },
      error: (err) => {
        console.error('Error:', err);
        this.recomendados$ = of([]); // Fallback
      },
      complete: () => {
        this.isLoading = false; // Equivalente a finalize
      }
    });
  }

}
