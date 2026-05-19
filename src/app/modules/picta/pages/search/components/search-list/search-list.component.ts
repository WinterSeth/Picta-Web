import { Component, OnInit, input, inject } from '@angular/core';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Documental, Publication, Videoclip} from '../../../medias/models/publicacion.model';
import { PositionServiceService } from '../../../categoria/services/position-service.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ShortNumbersPipe } from '../../../medias/pipes/short-numbers.pipe';


@Component({
    selector: 'app-search-list',
    templateUrl: './search-list.component.html',
    styleUrls: ['./search-list.component.scss'],
    imports: [
    RouterLink,
    MatIconModule,
    ShortNumbersPipe
]
})
export class SearchListComponent implements OnInit {
  private positionServiceService = inject(PositionServiceService);
  private router = inject(Router);

  readonly videoclips = input<any[]>(undefined);
  readonly mode = input('list');

  readonly query = input(undefined);
  readonly count = input(undefined);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  ngOnInit() {
  }

  goToChannel(event: Event, video: any) {
    event.stopPropagation();
    event.preventDefault();
    const alias = video?.canal?.alias || video?.canal_slug_url || video?.canal?.slug_url || video?.canal || video?.canal_alias || video?.canal_nombre;
    if (!alias) {
      return;
    }
    this.router.navigate(['/canal', alias]);
  }

  getResultRoute(video: any): any[] {
    if (!video?.tipo) {
      return ['/medias', video?.slug_url];
    }

    switch (video.tipo) {
      case 'canal':
        return ['/canal', video.alias];
      case 'publicacion':
      case 'live':
        return ['/medias', video.slug_url];
      case 'lista_reproduccion_canal':
        return ['/medias', video.publicaciones?.[0]?.slug_url];
      default:
        return ['/medias', video.slug_url];
    }
  }

  setCoords(video: any) {
    const card = document.querySelector(`#card${video.id}`);
    if (!card) {
      return;
    }
    this.positionServiceService.position.next(
      {
        x: card.getBoundingClientRect().left,
        y: card.getBoundingClientRect().top,
      }
    );
  }
}
