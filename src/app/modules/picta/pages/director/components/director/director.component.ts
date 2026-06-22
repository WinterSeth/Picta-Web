import { Component, inject, OnInit, input, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicationService } from '../../../medias/services/publication-service';
import { Meta, Title } from '@angular/platform-browser';
import { MyCarouseloComponent } from '../../../common-components/components/my-carousel-o/my-carouselo.component';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-director',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, MyCarouseloComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './director.component.html',
  styleUrls: ['./director.component.scss'],
})
export class DirectorComponent implements OnInit {
  private readonly publicationService = inject(PublicationService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly slug = input.required<string>();

  loading = true;
  movies$: any[] = [];
  series$: any[] = [];
  directorName = '';
  directorImagen = '';
  totalMovies = 0;
  totalSeries = 0;
  private pendingRequests = 0;

  constructor() {
    effect(() => {
      const slug = this.slug();

      if (isPlatformBrowser(this.platformId)) {
        this.loading = true;
        this.movies$ = [];
        this.series$ = [];
        this.pendingRequests = 2;
        this.cdr.markForCheck();

        // Usar el slug como nombre para mostrar
        this.directorName = slug;

        // Cargar películas
        this.publicationService.getPublications({
          director_raw: slug,
          page: '1',
          page_size: '10',
          tipologia_nombre_raw__in: 'Película',
        }).pipe(
          map((response: any) => {
            if (response.results && response.results.length > 0) {
              this.totalMovies = response.count || response.results.length;

              // Buscar la imagen del director en el reparto
              for (const pelicula of response.results) {
                const director = pelicula?.categoria?.pelicula?.director?.find(
                  (d: any) => d.nombre === this.directorName
                );
                if (director?.imagen) {
                  this.directorImagen = director.imagen;
                  break;
                }
              }

              return response.results;
            }
            return [];
          }),
          catchError(() => of([]))
        ).subscribe((result) => {
          this.movies$ = result;
          this.checkComplete();
        });

        // Cargar series
        this.publicationService.getSeries({
          director_raw: slug,
          page: '1',
          page_size: '10',
        }).pipe(
          map((response: any) => {
            if (response.results && response.results.length > 0) {
              this.totalSeries = response.count || response.results.length;

              // Buscar la imagen del director si no la tenemos
              if (!this.directorImagen) {
                for (const serie of response.results) {
                  const director = serie?.director?.find(
                    (d: any) => d.nombre === this.directorName
                  );
                  if (director?.imagen) {
                    this.directorImagen = director.imagen;
                    break;
                  }
                }
              }

              return response.results;
            }
            return [];
          }),
          catchError(() => of([]))
        ).subscribe((result) => {
          this.series$ = result;
          this.checkComplete();
        });
      }
    });
  }

  private checkComplete() {
    this.pendingRequests--;
    if (this.pendingRequests <= 0) {
      this.loading = false;
      this.cdr.markForCheck();
      this.updateMeta();
    }
  }

  private updateMeta() {
    this.title.setTitle(`${this.directorName} - Picta`);
    this.meta.updateTag({ name: 'description', content: `Filmografía de ${this.directorName}: ${this.totalMovies} películas, ${this.totalSeries} series` });
  }

  ngOnInit() {}
}