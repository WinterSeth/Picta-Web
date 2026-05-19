import { Component, inject, OnInit, input, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicationService } from '../../../medias/services/publication-service';
import { Meta, Title } from '@angular/platform-browser';
import { MyCarouseloComponent } from '../../../common-components/components/my-carousel-o/my-carouselo.component';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-actor',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, MyCarouseloComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './actor.component.html',
  styleUrls: ['./actor.component.scss'],
})
export class ActorComponent implements OnInit {
  private readonly publicationService = inject(PublicationService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly slug = input.required<string>();

  loading = true;
  movies$: any[] = [];
  series$: any[] = [];
  actorName = '';
  actorImagen = '';
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
        this.actorName = slug;

        // Cargar películas
        this.publicationService.getPublications({
          reparto_raw: slug,
          page: '1',
          page_size: '10',
          tipologia_nombre_raw__in: 'Película',
        }).pipe(
          map((response: any) => {
            if (response.results && response.results.length > 0) {
              this.totalMovies = response.count || response.results.length;
              
              // Buscar la imagen del actor en la primera película
              const primeraPelicula = response.results[0];
              const actor = primeraPelicula?.categoria?.pelicula?.reparto?.find(
                (a: any) => a.nombre === this.actorName
              );
              if (actor?.url_avatar) {
                this.actorImagen = actor.url_avatar;
              } else if (actor?.imagen) {
                this.actorImagen = actor.imagen;
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
          reparto_raw: slug,
          page: '1',
          page_size: '10',
        }).pipe(
          map((response: any) => {
            if (response.results && response.results.length > 0) {
              this.totalSeries = response.count || response.results.length;
              
              // Buscar la imagen del actor en la primera serie si no la tenemos
              if (!this.actorImagen) {
                const primeraSerie = response.results[0];
                const actor = primeraSerie?.reparto?.find(
                  (a: any) => a.nombre === this.actorName
                );
                if (actor?.url_avatar) {
                  this.actorImagen = actor.url_avatar;
                } else if (actor?.imagen) {
                  this.actorImagen = actor.imagen;
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
    this.title.setTitle(`${this.actorName} - Picta`);
    this.meta.updateTag({ name: 'description', content: `Filmografía de ${this.actorName}: ${this.totalMovies} películas, ${this.totalSeries} series` });
  }

  ngOnInit() {}
}