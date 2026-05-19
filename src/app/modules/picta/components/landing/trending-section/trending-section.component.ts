import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { PublicationService } from '../../../pages/medias/services/publication-service';

interface LandingData {
  series: any[];
  peliculas: any[];
  tendencias: {
    series: any[];
    peliculas: any[];
  };
}

@Component({
    selector: 'app-trending-section',
    imports: [AsyncPipe, MovieCardComponent],
    template: `
  @if (tendencias$ | async; as data) {
    <ng-container class="trending-container">
      <!-- Películas recientes -->
      <section class="trending-section" role="region" aria-labelledby="recent-movies-title">
        <div class="trending-wrapper">
          <h2 id="recent-movies-title" class="trending-title">Películas recientes</h2>
          <div role="list" aria-label="Recent movies grid">
            <app-movie-card [movies]="data.peliculas"></app-movie-card>
          </div>
        </div>
      </section>

      <!-- Series recientes -->
      <section class="trending-section trending-section--alt" role="region" aria-labelledby="recent-series-title">
        <div class="trending-wrapper">
          <h2 id="recent-series-title" class="trending-title">Series recientes</h2>
          <div role="list" aria-label="Recent series grid">
            <app-movie-card [movies]="data.series"></app-movie-card>
          </div>
        </div>
      </section>

      <!-- Series en tendencia -->
      <section class="trending-section" role="region" aria-labelledby="trending-series-title">
        <div class="trending-wrapper">
          <h2 id="trending-series-title" class="trending-title">Series en tendencia</h2>
          <div role="list" aria-label="Trending series grid">
            <app-movie-card [movies]="data.tendencias.series"></app-movie-card>
          </div>
        </div>
      </section>

      <!-- Películas en tendencia -->
      <section class="trending-section trending-section--alt" role="region" aria-labelledby="trending-movies-title">
        <div class="trending-wrapper">
          <h2 id="trending-movies-title" class="trending-title">Películas en tendencia</h2>
          <div role="list" aria-label="Trending movies grid">
            <app-movie-card [movies]="data.tendencias.peliculas"></app-movie-card>
          </div>
        </div>
      </section>
    </ng-container>
  }
  `,
    styles: [`
      :host {
        --picta-yellow: #f3e628;
        --picta-yellow-soft: rgba(243, 230, 40, 0.16);
        --picta-yellow-border: rgba(243, 230, 40, 0.28);
        --picta-text-muted: rgba(244, 247, 251, 0.6);
        display: block;
        width: 100%;
      }

      .trending-container {
        display: flex;
        flex-direction: column;
      }

      .trending-section {
        padding: 48px 16px;
        background: #05071f;
        width: 100%;

        &--alt {
          background: #090d22;
        }
      }

      .trending-wrapper {
        max-width: 1280px;
        margin: 0 auto;
      }

      .trending-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 400;
        letter-spacing: 0.03em;
        color: #f4f7fb;
        margin: 0 0 24px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--picta-yellow-border);
      }

      @media (max-width: 600px) {
        .trending-section {
          padding: 28px 8px;
        }

        .trending-title {
          margin-bottom: 16px;
        }
      }
    `]
})
export class TrendingSectionComponent implements OnInit {
  private publicacionService = inject(PublicationService)
  title = 'Lo más reciente';

  tendencias$: Observable<LandingData> = this.publicacionService.getLandingData()

  ngOnInit(): void {}
}