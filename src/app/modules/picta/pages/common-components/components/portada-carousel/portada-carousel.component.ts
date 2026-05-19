import {
  Component,
  input
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Publication } from '../../../medias/models/publicacion.model';
import { NgOptimizedImage } from '@angular/common';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-portada-carousel',
    templateUrl: './portada-carousel.component.html',
    styleUrls: ['./portada-carousel.component.scss'],
    imports: [CarouselModule, RouterLink, MatIcon, NgOptimizedImage]
})
export class PortadaCarouselComponent {
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    items: 1,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    center: true,
    autoplayHoverPause: true,
    merge: false,
    autoplay: true,
    smartSpeed: 1000,
    animateOut: 'animate__fadeOut',
    animateIn: 'animate__fadeIn'
  };
  readonly portadaList = input<Publication[]>(undefined);
  readonly isLoggedIn = input<boolean>(undefined);
  interval$ = interval(8000);
  subscription: Subscription;
}
