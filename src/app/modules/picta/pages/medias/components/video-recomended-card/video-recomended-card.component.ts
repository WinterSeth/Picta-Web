import { NgOptimizedImage } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ShortNumbersPipe } from '../../pipes/short-numbers.pipe';

@Component({
    selector: 'app-video-recomended-card',
    templateUrl: './video-recomended-card.component.html',
    styleUrls: ['./video-recomended-card.component.scss'],
    standalone: true,
    providers: [ShortNumbersPipe],
    imports: [RouterLink, NgOptimizedImage, ShortNumbersPipe]
})
export class VideoRecomendedCardComponent implements OnInit {
  private router = inject(Router);

  @Input() video;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
  }

}
