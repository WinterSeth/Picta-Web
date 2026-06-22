import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { RadioService, RadioStation } from '../../services/radio.service';
import { getImageSrcForStation } from '../../../../utils/radio-image.util';
import { RadioCardsComponent } from '../../../../components/radio-cards/radio-cards.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NotificationService } from '../../../../services/notification.service';
import { SectionHeaderComponent } from '../common-components/components/section-header/section-header.component';

@Component({
  standalone: true,
  // Use RadioCardsComponent (standalone) instead of legacy RadioCardComponent
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    CarouselModule,
    RadioCardsComponent,
    SectionHeaderComponent,
  ],
  templateUrl: './radio-list.component.html',
  styleUrls: ['./radio-list.component.scss'],
})
export class RadioListComponent implements OnInit {
  @ViewChild('favoritesCarousel', { static: false })
  favoritesCarousel?: any;

  private radioService = inject(RadioService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  stations: RadioStation[] = [];
  loading = true;
  skeletons = Array(10);

  readonly favoriteCarouselOptions: OwlOptions = {
    loop: false,
    dots: false,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 12,
    autoWidth: false,
    responsive: {
      0: { items: 1.2 },
      420: { items: 1.8 },
      640: { items: 2.2 },
      960: { items: 3.2 },
      1280: { items: 5 },
    },
  };

  goToPreviousFavorite() {
    this.favoritesCarousel?.prev(250);
  }

  goToNextFavorite() {
    this.favoritesCarousel?.next(250);
  }

  get favoriteStations() {
    return this.mappedStations.filter(station =>
      this.radioService.isFavorite(station),
    );
  }

  // Minimal handlers to forward events from app-radio-cards if parent wants to act.
  onPlay(st: any) {
    // noop: keep behavior local or delegate to RadioService if needed
    try {
      // optionally delegate: this.radioService.play(st);
      // removed console.log per cleanup request
    } catch (e) {
      console.error('onPlay error', e);
    }
  }

  onToggleFavorite(st: any) {
    try {
      const wasFavorite = this.radioService.isFavorite(st);
      this.radioService.toggleFavorite(st);
      const stationName = this.getFavoriteTitle(st);
      this.notificationService.open(
        'notification',
        wasFavorite
          ? `Se elimino de favoritos: ${stationName}`
          : `Se agrego a favoritos: ${stationName}`,
      );
    } catch (e) {
      console.error('onToggleFavorite error', e);
    }
  }

  isFavorite(st: any): boolean {
    return this.radioService.isFavorite(st);
  }

  getFavoriteTitle(st: any): string {
    let raw = (st?.name || '') as string;
    if (!raw || raw.toLowerCase().includes('unspecified')) {
      raw = (st?.mount ||
        st?.server_name ||
        st?.server_description ||
        'Sin nombre') as string;
    }
    return raw
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  getFavoriteImage(st: any): string {
    return getImageSrcForStation(st);
  }

  /**
   * Map stations from the service shape to the shape expected by app-radio-cards.
   * Preserve original properties (mount, listenurl, server_name, etc.) so downstream
   * RadioService or consumers continue to work.
   */
  get mappedStations() {
    return this.stations.map((s, idx) => {
      const mount = (s as any).mount ?? '';

      const id =
        (s as any).mount ??
        (s as any).server_name ??
        (s as any).listenurl ??
        String(idx);
      const name =
        (s as any).server_description ??
        (s as any).server_name ??
        (s as any).mount ??
        'Sin nombre';

      // Compute best image using centralized helper (covers named stations
      // like 'rebelde', 'taino', 'progreso', 'habana', as well as legacy
      // mount special-cases such as 'cubandjpro'). This avoids relying on
      // upstream thumbnail which may be missing and produced the default.
      const imageUrl = getImageSrcForStation(s as any);

      return {
        // keep original properties for compatibility
        ...s,
        id,
        name,
        description: (s as any).server_description ?? (s as any).description,
        imageUrl,
      } as unknown as RadioStation & Record<string, any>;
    });
  }

  /** Handle selection emitted by app-radio-cards and navigate to the station route */
  onSelect(st: any) {
    // Derive mount similar to legacy RadioCardComponent.computeMount()
    let mount = (st?.mount ?? '') as string;
    if (!mount && st?.listenurl) {
      try {
        const u = new URL(st.listenurl);
        mount = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      } catch (e) {
        const idx = (st.listenurl || '').lastIndexOf('/');
        if (idx !== -1) mount = (st.listenurl || '').substring(idx + 1);
      }
    }

    mount = (mount || '').toLowerCase();

    // Map legacy mount 'cubandjpro' to new routing path 'cubandjspro_radio'
    // (icecast URL stays as 'cubandjpro')
    if (mount === 'cubandjpro') {
      mount = 'cubandjspro_radio';
    }

    // Navigate preserving previous behavior
    this.router.navigate(['/radioenvivo', mount]);
  }

  ngOnInit(): void {
    this.loading = true;
    this.radioService.getStations().subscribe({
      next: s => {
        this.stations = s;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
