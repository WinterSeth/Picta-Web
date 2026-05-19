import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {PositionServiceService} from '../../services/position-service.service';
import {Publication} from '../../../medias/models/publicacion.model';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem, MatListItemAvatar, MatListItemTitle, MatListItemLine, MatListItemIcon } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { modalScaleInAnimation } from '../../../../animations/dialogs';

@Component({
    selector: 'app-movie-list',
    templateUrl: './movie-list.component.html',
    styleUrls: ['./movie-list.component.scss'],
  animations: [modalScaleInAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    RouterLink,
    MatIcon,
    MatNavList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatListItemIcon,
    NgOptimizedImage,
    MovieCardComponent
]
})
export class MovieListComponent {
  readonly movies = input<Publication[]>(undefined);
  readonly mode = input('card');

  private positionServiceService = inject(PositionServiceService);

  colorplay = "primary";
  colorinfo = "primary";

  showLayerFlag = false;

  getVideoQualities(downloadData: string): {label: string, size: string}[] {
  if (!downloadData) return [];
  
  try {
    const qualities = JSON.parse(downloadData);

    // Mostrar solo la máxima calidad disponible
    if (qualities.pro) {
      return [{label: '1080p', size: qualities.pro}];
    }

    if (qualities.high) {
      return [{label: '720p', size: qualities.high}];
    }

    return [];
  } catch (e) {
    console.error('Error parsing download data', e);
    return [];
  }
}

  showLayer() {
    this.showLayerFlag = true;
  }

  hideLayer() {
    this.showLayerFlag = false;
  }

  setCoords(movie: Publication) {
    const card = document.querySelector(`#card${movie.id}`);
    this.positionServiceService.position.next(
      {
        x: card.getBoundingClientRect().left,
        y: card.getBoundingClientRect().top,
      }
    );

  }
}
