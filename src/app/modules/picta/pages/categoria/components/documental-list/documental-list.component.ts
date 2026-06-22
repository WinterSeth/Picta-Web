import { Component, OnInit, input, inject } from '@angular/core';
import {PositionServiceService} from '../../services/position-service.service';
import {Documental} from '../../../medias/models/publicacion.model';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem, MatListItemAvatar, MatListItemTitle, MatListItemLine, MatListItemIcon } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { DocumentalCardComponent } from '../documental-card/documental-card.component';

@Component({
    selector: 'app-documental-list',
    templateUrl: './documental-list.component.html',
    styleUrls: ['./documental-list.component.scss'],
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
    DocumentalCardComponent
]
})
export class DocumentalListComponent implements OnInit {
  private positionServiceService = inject(PositionServiceService);

  readonly documentales = input<any[]>(undefined);
  readonly mode = input('card');

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  setCoords(docu: Documental) {
    const card = document.querySelector(`#card${docu.id}`);
    this.positionServiceService.position.next(
      {
        x: card.getBoundingClientRect().left,
        y: card.getBoundingClientRect().top,
      }
    );

  }
}
