import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardImage } from '@angular/material/card';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../../medias/models/publicacion.model';

const PLAY = `<svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 -960 960 960" fill="#e8eaed"><path d="M382-306.67 653.33-480 382-653.33v346.66ZM480-80q-82.33 0-155.33-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.67T80-480q0-83 31.5-156t85.83-127q54.34-54 127.34-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82.33-31.5 155.33-31.5 73-85.5 127.34Q709-143 636-111.5T480-80Zm0-66.67q139.33 0 236.33-97.33t97-236q0-139.33-97-236.33t-236.33-97q-138.67 0-236 97-97.33 97-97.33 236.33 0 138.67 97.33 236 97.33 97.33 236 97.33ZM480-480Z"/></svg>`;
const INFO = `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e8eaed"><path d="M448.67-280h66.66v-240h-66.66v240Zm31.32-316q15.01 0 25.18-9.97 10.16-9.96 10.16-24.7 0-15.3-10.15-25.65-10.16-10.35-25.17-10.35-15.01 0-25.18 10.35-10.16 10.35-10.16 25.65 0 14.74 10.15 24.7 10.16 9.97 25.17 9.97Zm.19 516q-82.83 0-155.67-31.5-72.84-31.5-127.18-85.83Q143-251.67 111.5-324.56T80-480.33q0-82.88 31.5-155.78Q143-709 197.33-763q54.34-54 127.23-85.5T480.33-880q82.88 0 155.78 31.5Q709-817 763-763t85.5 127Q880-563 880-480.18q0 82.83-31.5 155.67Q817-251.67 763-197.46q-54 54.21-127 85.84Q563-80 480.18-80Zm.15-66.67q139 0 236-97.33t97-236.33q0-139-96.87-236-96.88-97-236.46-97-138.67 0-236 96.87-97.33 96.88-97.33 236.46 0 138.67 97.33 236 97.33 97.33 236.33 97.33ZM480-480Z"/></svg>`;

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, MatCard, MatCardImage, MatIcon, MatTooltip],
})
export class MovieCardComponent {
  private static iconsRegistered = false;

  readonly movie = input.required<Publication>();
  readonly movieYear = computed(() => this.movie()?.categoria?.pelicula?.ano || '');
  readonly movieCountry = computed(() => this.movie()?.categoria?.pelicula?.pais || '');

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    if (MovieCardComponent.iconsRegistered) {
      return;
    }

    this.iconRegistry.addSvgIconLiteral('play', this.sanitizer.bypassSecurityTrustHtml(PLAY));
    this.iconRegistry.addSvgIconLiteral('info', this.sanitizer.bypassSecurityTrustHtml(INFO));
    MovieCardComponent.iconsRegistered = true;
  }
}
