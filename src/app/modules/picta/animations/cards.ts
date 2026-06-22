import {animate, query, stagger, style, transition, trigger} from '@angular/animations';


export const cardsAnimation =
  trigger('photosAnimation', [
    transition(':enter', [
      query('app-my-video-card', style({transform: 'translateX(100%)', opacity: 0}), {optional: true}),
      query('app-my-video-card',
        stagger('30ms', [
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]), {optional: true})
    ]),
    transition(':leave', [
      query('app-my-video-card', style({transform: 'translateX()', opacity: 1}), {optional: true}),
      query('app-my-video-card',
        stagger('30ms', [
          animate('500ms', style({transform: 'translateX(-100%)', opacity: 0}))
        ]), {optional: true})
    ])
  ]);
