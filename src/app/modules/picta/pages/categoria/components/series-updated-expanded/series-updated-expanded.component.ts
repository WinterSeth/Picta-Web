import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Serie } from '../../../medias/models/publicacion.model';
import { SerieService } from '../../services/serie.service';
import { SerieCardComponent } from '../serie-card/serie-card.component';

@Component({
  selector: 'app-series-updated-expanded',
  templateUrl: './series-updated-expanded.component.html',
  styleUrls: ['./series-updated-expanded.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton, MatIcon, SerieCardComponent],
})
export class SeriesUpdatedExpandedComponent {
  private readonly serieService = inject(SerieService);

  readonly loading = signal<boolean>(true);
  readonly series = signal<Serie[]>([]);

  constructor() {
    this.loadUpdatedSeries();
  }

  trackSerie(_index: number, item: Serie): number {
    const raw = (item as any)?.pelser_id ?? (item as any)?.id;
    return Number(raw ?? 0);
  }

  private loadUpdatedSeries() {
    this.serieService
      .getAll({
        tipologia_nombre_raw: 'Serie',
        ordering: '-last_update',
        page: 1,
        page_size: 20,
      })
      .subscribe({
        next: (response: any) => {
          const batch = Array.isArray(response?.results) ? response.results : [];
          this.series.set(batch);
          this.loading.set(false);
        },
        error: () => {
          this.series.set([]);
          this.loading.set(false);
        },
      });
  }
}
