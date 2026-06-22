import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export const favoriteHeartAnimation = trigger('favoriteHeart', [
  state('inactive', style({ transform: 'scale(1)' })),
  state('active', style({ transform: 'scale(1)' })),
  transition('inactive => active', [
    animate(
      '300ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.13)', offset: 0.38 }),
        style({ transform: 'scale(0.98)', offset: 0.68 }),
        style({ transform: 'scale(1.04)', offset: 0.86 }),
        style({ transform: 'scale(1)', offset: 1 }),
      ])
    ),
  ]),
  transition('active => inactive', [
    animate(
      '240ms cubic-bezier(0.4, 0, 0.2, 1)',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(0.93)', offset: 0.58 }),
        style({ transform: 'scale(1)', offset: 1 }),
      ])
    ),
  ]),
]);

export const favoriteRemovalCardAnimation = trigger('favoriteRemovalCard', [
  state(
    'idle',
    style({
      opacity: 1,
      transform: 'translateY(0) scale(1)',
      filter: 'blur(0)',
    })
  ),
  state(
    'removing',
    style({
      opacity: 0,
      transform: 'translateY(10px) scale(0.96)',
      filter: 'blur(1px)',
      pointerEvents: 'none',
    })
  ),
  transition('idle => removing', animate('220ms cubic-bezier(0.4, 0, 0.2, 1)')),
]);