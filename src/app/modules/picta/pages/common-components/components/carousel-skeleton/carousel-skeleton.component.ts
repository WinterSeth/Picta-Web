import { Component, input } from '@angular/core';

@Component({
  selector: 'app-carousel-skeleton',
  imports: [],
  templateUrl: './carousel-skeleton.component.html',
  styleUrl: './carousel-skeleton.component.scss',
})
export class CarouselSkeletonComponent {
  readonly itemCount = input<number>(8);
  readonly title = input<boolean>(true);
}