import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Publication } from '../../../medias/models/publicacion.model';
import { PublicationService } from '../../../medias/services/publication-service';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-popular-month-expanded',
  templateUrl: './popular-month-expanded.component.html',
  styleUrls: ['./popular-month-expanded.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton, MatIcon, MovieCardComponent],
})
export class PopularMonthExpandedComponent {
  private readonly publicationService = inject(PublicationService);
  private readonly datePipe = inject(DatePipe);

  readonly loading = signal<boolean>(true);
  readonly movies = signal<Publication[]>([]);

  constructor() {
    this.loadPopularMonthMovies();
  }

  trackMovie(_index: number, item: Publication): number {
    return Number(item?.id ?? 0);
  }

  private loadPopularMonthMovies() {
    const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const monthAgoDate = new Date();
    monthAgoDate.setDate(monthAgoDate.getDate() - 30);
    const monthAgo = this.datePipe.transform(monthAgoDate, 'yyyy-MM-dd');

    this.publicationService
      .getPublications({
        fecha_publicado__gte: monthAgo,
        fecha_publicado__lt: currentDate,
        ordering: '-cantidad_visitas',
        page: 1,
        page_size: 20,
        tipologia_nombre_raw__in: 'Película',
      })
      .subscribe({
        next: (response: any) => {
          const batch = Array.isArray(response?.results) ? response.results : [];
          this.movies.set(batch);
          this.loading.set(false);
        },
        error: () => {
          this.movies.set([]);
          this.loading.set(false);
        },
      });
  }
}
