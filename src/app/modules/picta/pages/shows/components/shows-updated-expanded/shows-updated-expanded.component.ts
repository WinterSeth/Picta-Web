import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Serie } from '../../../medias/models/publicacion.model';
import { SerieService } from '../../../categoria/services/serie.service';
import { SerieCardComponent } from '../../../categoria/components/serie-card/serie-card.component';

@Component({
  selector: 'app-shows-updated-expanded',
  templateUrl: './shows-updated-expanded.component.html',
  styleUrls: ['./shows-updated-expanded.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton, MatIcon, SerieCardComponent],
})
export class ShowsUpdatedExpandedComponent {
  private readonly serieService = inject(SerieService);

  readonly loading = signal<boolean>(true);
  readonly shows = signal<Serie[]>([]);

  constructor() {
    this.loadUpdatedShows();
  }

  trackShow(_index: number, item: Serie): number {
    const raw = (item as any)?.pelser_id ?? (item as any)?.id;
    return Number(raw ?? 0);
  }

  private loadUpdatedShows() {
    this.serieService
      .getAll({
        genero_raw: 'Show',
        ordering: '-last_update',
        page: 1,
        page_size: 20,
      })
      .subscribe({
        next: (response: any) => {
          const batch = Array.isArray(response?.results)
            ? response.results
            : [];
          this.shows.set(batch);
          this.loading.set(false);
        },
        error: () => {
          this.shows.set([]);
          this.loading.set(false);
        },
      });
  }
}
