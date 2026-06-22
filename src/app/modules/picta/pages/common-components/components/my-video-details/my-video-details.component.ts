import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, input, output, inject } from '@angular/core';
import { PublicationService } from '../../../medias/services/publication-service';
import { SubSink } from 'subsink';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Publication } from '../../../medias/models/publicacion.model';
import { PictaResponse } from '../../../../models/response.picta.model';
import { MyCarouselComponent } from '../my-carousel/my-carousel.component';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTabGroup, MatTab, MatTabContent } from '@angular/material/tabs';
import { MatIconButton, MatAnchor } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-my-video-details',
    templateUrl: './my-video-details.component.html',
    styleUrls: ['./my-video-details.component.scss'],
    imports: [MatIconButton, NgOptimizedImage, MatTabGroup, MatTab, MatTabContent, MatAnchor, RouterLink, MatIcon, MyCarouselComponent]
})
export class MyVideoDetailsComponent implements OnInit, OnChanges, OnDestroy {
  private publicationService = inject(PublicationService);
  private sanitizer = inject(DomSanitizer);

  video = input<Publication>(undefined);
    isLoggedIn = input<boolean>(false);
  readonly closePanel = output();
  selectedTab: number;
  related: Publication[];
  subs = new SubSink();
  poster: SafeStyle;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.video = changes['video'].currentValue;
    this.setPoster();
  }

  setPoster() {
    const style = `background-image: linear-gradient(to right, #05071F, rgba(5, 7, 31, .1) 80%),
    linear-gradient(to bottom, #05071F, rgba(5, 7, 31, .1) 5% ),
     linear-gradient(to top, #05071F, rgba(5, 7, 31, .1) 5% ),
                   url(${this.video().url_imagen})`;
    this.poster = this.sanitizer.bypassSecurityTrustStyle(style);
  }

  ngOnInit() {
    this.selectedTab = 0;
    this.getRelatedVideos();
  }

  getRelatedVideos() {
    this.subs.add(
      this.publicationService.getPublications({ page_size: 10 }).subscribe((response: PictaResponse<Publication>) => {
        this.related = response.results;
      })
    );
  }

  close() {
    this.closePanel.emit();
  }

  selectTab(tabSelected) {
    this.selectedTab = tabSelected;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  playText() {
    const time = localStorage.getItem(this.video().slug_url);
    if (time) {
      return 'Reanudar';
    }
    return 'Reproducir';
  }
}
