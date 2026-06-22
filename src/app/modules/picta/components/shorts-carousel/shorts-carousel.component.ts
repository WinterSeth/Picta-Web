import { Component, inject, OnInit, signal } from '@angular/core';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import {
  PublicationService,
  VideoShort,
} from '../../pages/medias/services/publication-service';
import { DatePipe } from '@angular/common';
import { ShortNumbersPipe } from '../../pages/medias/pipes/short-numbers.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shorts-carousel',
  // RouterLink isn't used in the template — remove to fix NG8113
  imports: [CarouselModule, RouterLink],
  providers: [DatePipe, ShortNumbersPipe],
  templateUrl: './shorts-carousel.component.html',
  styleUrl: './shorts-carousel.component.scss',
})
export class ShortsCarouselComponent implements OnInit {
  private shortsService = inject(PublicationService);
  private datePipe = inject(DatePipe);
  shorts = signal<VideoShort[]>([]);

  // Signals para controlar flechas
  showPrevArrow = signal(false);
  showNextArrow = signal(false);

  carouselReady = signal(false);

  currentDate;
  weekAgo;

  // Configuración del carousel vertical
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    autoWidth: true,
    autoHeight: true,
    responsive: {
      0: {
        items: 3,
      },
      640: {
        items: 3,
      },
      768: {
        items: 3,
      },
      1024: {
        items: 3,
      },
    },
    nav: true,
  };

  ngOnInit(): void {
    this.loadShorts();
  }

  private loadShorts() {
    var date = new Date();
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.weekAgo = this.datePipe.transform(
      date.setDate(date.getDate() - 7),
      'yyyy-MM-dd',
    );
    // Suscríbete a los cambios del servicio
    const shortsSubscription = this.shortsService
      .getShortsCarousel(this.currentDate, this.weekAgo)
      .subscribe({
        next: shorts => {
          this.shorts.set(shorts.results);
          shortsSubscription.unsubscribe();
        },
        error: error => {
          console.error('Error loading shorts:', error);
          shortsSubscription.unsubscribe();
        },
      });
  }

  onCarouselInitialized() {
    this.carouselReady.set(true);
  }

  // Métodos para navegación manual si es necesario
  navigateNext(carousel: any) {
    carousel.next();
  }

  navigatePrev(carousel: any) {
    carousel.prev();
  }
}
