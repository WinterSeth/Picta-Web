import { Component, Input, OnInit, inject } from '@angular/core';
import {PublicationService} from '../../../medias/services/publication-service';
import {Temporada} from '../../../medias/models/publicacion.model';
import { MyCarouselComponent } from '../../../common-components/components/my-carousel/my-carousel.component';
import { UpperCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-categoria-serie-item',
    templateUrl: './categoria-serie-item.component.html',
    styleUrls: ['./categoria-serie-item.component.scss'],
    standalone: true,
    imports: [MatButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, MyCarouselComponent, UpperCasePipe]
})
export class CategoriaSerieItemComponent implements OnInit {
  private publicationService = inject(PublicationService);

  @Input() temporada: Temporada;
  @Input() showTitle: boolean;
  ordering = 'nombre';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

  load(reload = false) {
    if (this.temporada.next || reload) {
      const page = this.temporada.next;
      delete this.temporada.next
      this.publicationService.getPublications({
        temporada_id: this.temporada.id,
        page: reload ? 1 : page,
        page_size: 8,
        ordering: this.ordering
      }).subscribe((res: any) => {
        this.temporada.videos = reload ? res.results : [...this.temporada.videos, ...res.results];
        this.temporada.next = res.next;
      });

    }

  }

  setOrder(order: string) {
    this.ordering = order;
    this.load(true);
  }
}
