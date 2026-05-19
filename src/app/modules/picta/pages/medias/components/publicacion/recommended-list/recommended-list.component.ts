import { Component, effect, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { ShortNumbersPipe } from '../../../pipes/short-numbers.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-recommended-list',
    templateUrl: './recommended-list.component.html',
    styleUrls: ['./recommended-list.component.scss'],
    providers: [ShortNumbersPipe],
    imports: [NgClass, RouterLink, NgOptimizedImage, ShortNumbersPipe, MatIcon, MatButton]
})
export class RecommendedListComponent {
  readonly videosRecomendados = input<any[]>(undefined);
  readonly navigate = output<string>();
  visibleCount = 5;

  constructor() {
    effect(() => {
      this.videosRecomendados();
      this.visibleCount = 5;
    });
  }

  visibleVideos() {
    return (this.videosRecomendados() ?? []).slice(0, this.visibleCount);
  }

  canLoadMore() {
    return (this.videosRecomendados()?.length ?? 0) > this.visibleCount;
  }

  loadMoreVideos() {
    this.visibleCount += 5;
  }

  navigatePost(slug_url: string) {
    this.navigate.emit(slug_url);
  }


}
