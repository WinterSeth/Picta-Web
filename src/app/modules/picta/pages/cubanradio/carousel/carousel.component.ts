import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() intervalMs = 5000;
  @Input() imageSize = '800x400';

  currentIndex = signal(0);

  getImageUrl(image: string): string {
    return `${image}_${this.imageSize}`;
  }

  private intervalId?: number;
  transitioning = signal(false);

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextImage() {
    if (this.images.length === 0) return;
    this.transitioning.set(true);
    this.currentIndex.update(i => i + 1);
  }

  prevImage() {
    if (this.images.length === 0) return;
    this.transitioning.set(true);
    this.currentIndex.update(i => i - 1);
  }

  onTransitionEnd() {
    const totalImages = this.images.length;
    if (this.currentIndex() === totalImages) {
      // Llegamos al clon, reseteamos al primero
      this.transitioning.set(false); // quitamos transición temporalmente
      this.currentIndex.set(0);
    }
    if (this.currentIndex() < 0) {
      // Si vamos hacia atrás desde la primera
      this.transitioning.set(false);
      this.currentIndex.set(totalImages - 1);
    }
  }

  private startAutoplay(): void {
    this.intervalId = window.setInterval(() => {
      this.nextImage();
    }, this.intervalMs);
  }

  private stopAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
