import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, input, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PublicationService } from '../../../medias/services/publication-service';
import { Title } from '@angular/platform-browser';
import { MovieCardComponent } from '../../../categoria/components/movie-card/movie-card.component';
import { CategoriaLoadingStateComponent } from '../../../categoria/components/categoria-loading-state/categoria-loading-state.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { catchError, map, of } from 'rxjs';

type ActorMedia = 'peliculas' | 'series';

@Component({
  selector: 'app-actor-expanded',
  standalone: true,
  imports: [RouterLink, MatButton, MatIcon, MovieCardComponent, CategoriaLoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './actor-expanded.component.html',
  styleUrls: ['./actor-expanded.component.scss'],
})
export class ActorExpandedComponent {
  private readonly publicationService = inject(PublicationService);
  private readonly httpClient = inject(HttpClient);
  private readonly title = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly slug = input.required<string>();
  readonly media = input.required<ActorMedia>();

  loading = true;
  loadingMore = false;
  items: any[] = [];
  actorName = '';
  total = 0;
  hasMore = false;
  private nextPage: number | null = 1;
  private pageSize = 20;

  constructor() {
    effect(() => {
      const slug = this.slug();
      const media = this.media();

      if (isPlatformBrowser(this.platformId)) {
        this.resetAndLoad(slug, media);
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.loading || this.loadingMore || !this.hasMore || !this.nextPage) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 80;

    if (scrollPosition >= scrollThreshold) {
      this.loadPage(this.nextPage);
    }
  }

  private resetAndLoad(slug: string, media: ActorMedia) {
    this.loading = true;
    this.loadingMore = false;
    this.items = [];
    this.nextPage = 1;
    this.actorName = slug;
    
    this.loadPage(1, slug, media);
  }

  private loadPage(page: number, slug?: string, media?: ActorMedia) {
    const currentSlug = slug || this.slug();
    const currentMedia = media || this.media();

    if (page === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    this.cdr.markForCheck();

    if (currentMedia === 'peliculas') {
      this.publicationService.getPublications({
        reparto_raw: currentSlug,
        page: page.toString(),
        page_size: this.pageSize.toString(),
        tipologia_nombre_raw__in: 'Película',
      }).pipe(
        map((response: any) => {
          this.total = response.count || 0;
          this.hasMore = !!response.next;
          this.nextPage = this.hasMore ? page + 1 : null;
          return response.results || [];
        }),
        catchError(() => of([]))
      ).subscribe({
        next: (result) => {
          this.items = page === 1 ? result : [...this.items, ...result];
          this.loading = false;
          this.loadingMore = false;
          this.title.setTitle(`${this.actorName} - Películas - Picta`);
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.loadingMore = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      const urlSerie = 'https://www.picta.cu/v2/serie/';
      this.httpClient.get<any>(urlSerie, {
        params: new HttpParams()
          .set('reparto_raw', currentSlug)
          .set('page', page.toString())
          .set('page_size', this.pageSize.toString())
      }).pipe(
        map((response: any) => {
          this.total = response.count || 0;
          this.hasMore = !!response.next;
          this.nextPage = this.hasMore ? page + 1 : null;
          return response.results || [];
        }),
        catchError(() => of([]))
      ).subscribe({
        next: (result) => {
          this.items = page === 1 ? result : [...this.items, ...result];
          this.loading = false;
          this.loadingMore = false;
          this.title.setTitle(`${this.actorName} - Series - Picta`);
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.loadingMore = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  trackMovie(_index: number, item: any): number {
    return Number(item?.id ?? 0);
  }
}