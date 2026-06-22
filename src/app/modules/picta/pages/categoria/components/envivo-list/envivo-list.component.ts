import { Component, input, inject } from '@angular/core';
import { Publication } from '../../../medias/models/publicacion.model';
import { PositionServiceService } from '../../services/position-service.service';
import { Title } from '@angular/platform-browser';
import { MatLine } from '@angular/material/core';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { LiveCardComponent } from '../live-card/live-card.component';

@Component({
    selector: 'app-envivo-list',
    templateUrl: './envivo-list.component.html',
    styleUrls: ['./envivo-list.component.scss'],
  imports: [NgOptimizedImage, RouterLink, MatIcon, MatNavList, MatListItem, MatLine, LiveCardComponent]
})
export class EnvivoListComponent {
  private positionServiceService = inject(PositionServiceService);
  private title = inject(Title);

  readonly movies = input<Publication[]>(undefined);
  readonly mode = input('card');
  colorplay = "accent";
  colorinfo = "accent";

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.title.setTitle(`En Vivo - Picta`);
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
