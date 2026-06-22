import { animate, group, query, stagger, style, transition, trigger } from '@angular/animations';

export const modalScaleInAnimation = trigger('modalScaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px) scale(0.96)' }),
    query(
      '.modal-animated-item',
      style({ opacity: 0, transform: 'translateY(6px)' }),
      { optional: true }
    ),
    group([
      animate('220ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      query(
        '.modal-animated-item',
        [
          stagger(24, animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
        ],
        { optional: true }
      ),
    ]),
  ]),
  transition(':leave', [
    animate('160ms ease-in', style({ opacity: 0, transform: 'translateY(8px) scale(0.98)' })),
  ]),
]);