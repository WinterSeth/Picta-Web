import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, Renderer2, input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MovieDialogComponentComponent } from '../movie-dialog-component/movie-dialog-component.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-movie-card',
    imports: [NgOptimizedImage, CarouselModule, MatIconModule],
    template: `
  <div class="movie-card-carousel">
    @if (owlCar) {
      <button aria-label="izquierda" (click)="owlCar.prev()" class="carousel-nav previous">
        <mat-icon>keyboard_arrow_left</mat-icon>
      </button>
    }
    <owl-carousel-o [options]="customOptions" #owlCar class="carousel-owl">
      @for (movie of movies(); track movie) {
        <ng-template carouselSlide>
          <div class="carousel-slide">
            <div class="movie-card-thumb" (click)="openMovieDialog(movie)">
              <div class="movie-card-image">
                <img
                  [ngSrc]="movie.imagen+'_350x200'"
                  [alt]="movie.titulo"
                  width="350"
                  height="200"
                  class="movie-card-img" />
              </div>
              <div class="movie-card-info">
                <span class="movie-card-title">{{ movie.titulo }}</span>
                <p class="movie-card-year">{{ movie.ano }}</p>
              </div>
            </div>
          </div>
        </ng-template>
      }
    </owl-carousel-o>
    @if (owlCar) {
      <button aria-label="derecha" (click)="owlCar.next()" class="carousel-nav next">
        <mat-icon>keyboard_arrow_right</mat-icon>
      </button>
    }
  </div>
  `,
    styles: [`
      :host {
        --picta-yellow: #f3e628;
        --picta-yellow-soft: rgba(243, 230, 40, 0.16);
        --picta-yellow-border: rgba(243, 230, 40, 0.28);
        --picta-text-muted: rgba(244, 247, 251, 0.6);
        display: block;
      }

      .movie-card-carousel {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
      }

      .carousel-owl {
        display: block;
        width: 100%;
      }

      .carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        background: rgba(0, 0, 0, 0.65) !important;
        border: 1px solid var(--picta-yellow-border) !important;
        border-radius: 50% !important;
        color: var(--picta-yellow) !important;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        cursor: pointer;
        transition: all 180ms ease;
        backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;

        &:hover {
          background: var(--picta-yellow) !important;
          color: #0a1126 !important;
          box-shadow: 0 0 20px rgba(243, 230, 40, 0.45);
        }

        &.previous { left: 8px; }
        &.next { right: 8px; }
      }

      .movie-card-carousel:hover .carousel-nav {
        opacity: 1;
        pointer-events: auto;
      }

      .carousel-nav[disabled] {
        opacity: 0.3;
        pointer-events: none;
      }

      .carousel-slide {
        padding: 0 4px;
      }

      .movie-card-thumb {
        cursor: pointer;
        border-radius: 12px;
        overflow: hidden;
        transition: all 200ms ease;

        &:hover {
          transform: translateY(-4px);

          .movie-card-img {
            transform: scale(1.04);
          }

          .movie-card-image {
            box-shadow: 0 16px 32px -16px rgba(243, 230, 40, 0.18);
          }
        }
      }

      .movie-card-image {
        position: relative;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        transition: box-shadow 200ms ease;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .movie-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 300ms ease;
      }

      .movie-card-info {
        padding: 8px 4px 4px;
      }

      .movie-card-title {
        display: block;
        font-family: 'Roboto', sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        color: #f4f7fb;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .movie-card-year {
        font-family: 'Roboto', sans-serif;
        font-size: 0.8rem;
        color: var(--picta-text-muted);
        margin: 2px 0 0;
      }

      @media (max-width: 768px) {
        .carousel-nav { display: none; }
      }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCardComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  readonly movies = input<any>(undefined);

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      760: { items: 3 },
      1000: { items: 4 },
      1600: { items: 5 },
    },
    nav: true,
  };

  isLoading = true;

  constructor() {}

  ngOnInit(): void {}

  openMovieDialog(movie: any): void {
    this.dialog.open(MovieDialogComponentComponent, {
      width: '900px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'picta-dark-dialog',
      data: movie
    });
  }

  ngOnDestroy(): void {}
}