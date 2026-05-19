import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Publication } from '../medias/models/publicacion.model';
import { PublicationService } from '../medias/services/publication-service';
import { MyCarouseloComponent } from '../common-components/components/my-carousel-o/my-carouselo.component';
import { MatIcon } from '@angular/material/icon';
import { CarouselSkeletonComponent } from '../common-components/components/carousel-skeleton/carousel-skeleton.component';

@Component({
  selector: 'app-contenido-premium',
  imports: [
    MyCarouseloComponent,
    CarouselSkeletonComponent,
    MatIcon,
  ],
  templateUrl: './contenido-premium.component.html',
  styleUrl: './contenido-premium.component.scss',
})
export class ContenidoPremiumComponent {
  private publicationService = inject(PublicationService);
  private titleService = inject(Title);

  readonly mostViewed = signal<Publication[]>([]);
  readonly mostLiked = signal<Publication[]>([]);
  readonly mostCommented = signal<Publication[]>([]);
  readonly latestPremium = signal<Publication[]>([]);

  readonly loadingViewed = signal(true);
  readonly loadingLiked = signal(true);
  readonly loadingCommented = signal(true);
  readonly loadingLatest = signal(true);

  carouselOptions = {
    loop: false,
    rewind: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    autoWidth: true,
    margin: 16,
    slideBy: 1,
    responsive: {
      0: { items: 2, slideBy: 1 },
      400: { items: 3, slideBy: 1 },
      768: { items: 4, slideBy: 1 },
      1024: { items: 5, slideBy: 1 },
      1280: { items: 6, slideBy: 1 },
      1536: { items: 7, slideBy: 1 },
    },
  };

  constructor() {
    this.titleService.setTitle('Contenido Premium - Picta');
    this.loadCarousels();
  }

private loadCarousels(): void {
    this.publicationService
      .getPaidMoviesByOrder('-cantidad_visitas')
      .subscribe((response: Publication[]) => {
        this.mostViewed.set(response || []);
        this.loadingViewed.set(false);
      });

    this.publicationService
      .getPaidMoviesByOrder('-cantidad_me_gusta')
      .subscribe((response: Publication[]) => {
        this.mostLiked.set(response || []);
        this.loadingLiked.set(false);
      });

    this.publicationService
      .getPaidMoviesByOrder('-cantidad_comentarios')
      .subscribe((response: Publication[]) => {
        this.mostCommented.set(response || []);
        this.loadingCommented.set(false);
      });

    this.publicationService
      .getLatestPaidMovies()
      .subscribe((response: Publication[]) => {
        this.latestPremium.set(response || []);
        this.loadingLatest.set(false);
      });
  }
}