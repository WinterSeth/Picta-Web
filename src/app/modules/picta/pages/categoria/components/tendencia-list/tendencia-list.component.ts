import { Component, input, inject } from '@angular/core';
import { Publication } from '../../../medias/models/publicacion.model';
import { PositionServiceService } from '../../services/position-service.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { NgClass, SlicePipe, NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-tendencia-list',
    templateUrl: './tendencia-list.component.html',
    styleUrls: ['./tendencia-list.component.scss'],
    standalone: true,
    imports: [NgOptimizedImage, MatCard, RouterLink, NgClass, MatCardTitle, MatCardContent, MatCardActions, MatIconButton, MatIcon, SlicePipe]
})
export class TendenciaListComponent {
  private positionServiceService = inject(PositionServiceService);


  readonly movies = input<Publication[]>(undefined);
  readonly mode = input('card');
  colorplay = "accent";
  colorinfo = "accent";

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  showLayerFlag = false;

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
