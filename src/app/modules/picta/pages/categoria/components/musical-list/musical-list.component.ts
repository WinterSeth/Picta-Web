import { Component, OnInit, input, inject } from '@angular/core';
import {PositionServiceService} from '../../services/position-service.service';
import {Videoclip, Publication} from '../../../medias/models/publicacion.model';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem, MatListItemAvatar, MatListItemTitle, MatListItemLine, MatListItemIcon } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MusicalCardComponent } from '../musical-card/musical-card.component';


@Component({
    selector: 'app-musical-list',
    templateUrl: './musical-list.component.html',
    styleUrls: ['./musical-list.component.scss'],
    imports: [
    RouterLink,
    MatNavList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatIcon,
    MatListItemIcon,
    NgOptimizedImage,
    MusicalCardComponent
]
})
export class MusicalListComponent implements OnInit {
  private positionServiceService = inject(PositionServiceService);

  readonly videoclips = input<Publication[]>(undefined);
  readonly mode = input('card');

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  setCoords(video: Publication) {
    const card = document.querySelector(`#card${video.id}`);
    this.positionServiceService.position.next(
      {
        x: card.getBoundingClientRect().left,
        y: card.getBoundingClientRect().top,
      }
    );
  }
}
