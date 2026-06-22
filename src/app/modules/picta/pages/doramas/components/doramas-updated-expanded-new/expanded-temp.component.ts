import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Serie } from '../../../medias/models/publicacion.model';
import { SerieService } from '../../../categoria/services/serie.service';
import { SerieCardComponent } from '../../../categoria/components/serie-card/serie-card.component';

@Component({
  selector: 'app-doramas-updated-expanded',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton, MatIcon, SerieCardComponent],
  templateUrl: './doramas-updated-expanded.component.html',
  styleUrls: ['./doramas-updated-expanded.component.scss']
})
export class DoramasUpdatedExpandedComponent {
  private readonly serieService = inject(SerieService);

  readonly loading = signal<boolean>(true);
  readonly doramas = signal<Serie[]>([]);

  constructor() {
    this.loadUpdatedDoramas();
  }

  trackDorama(_index: number, item: Serie): number {
    const raw = (item as any)?.pelser_id ?? (item as any)?.id;
    return Number(raw ?? 0);
  }

  private loadUpdatedDoramas() {
    this.serieService
      .getAll({
        genero_raw: 'Dorama',
        ordering: '-last_update',
        page: 1,
        page_size: 20,
      })
      .subscribe({
        next: (response: any) => {
          const batch = Array.isArray(response?.results) ? response.results : [];
          this.doramas.set(batch);
          this.loading.set(false);
        },
        error: () => {
          this.doramas.set([]);
          this.loading.set(false);
        },
      });
  }
}
