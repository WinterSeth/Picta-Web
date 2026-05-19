import {
  animate,
  group,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Reusable menu animation
 * Used for: user menu, notifications, dropdowns, and all toolbar menus
 */
export const menuSlideIn = trigger('menuSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.96) translateY(-4px)' }),
    group([
      animate(
        '180ms cubic-bezier(0.35, 0, 0.25, 1)',
        style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
      ),
    ]),
  ]),
  transition(':leave', [
    animate('120ms ease-in', style({ opacity: 0, transform: 'scale(0.98)' })),
  ]),
]);

/**
 * Menu item stagger animation for sequential appearance
 */
export const menuItemsStagger = trigger('menuItemsStagger', [
  transition('* => *', [
    style({ opacity: 0, transform: 'translateX(-8px)' }),
    animate(
      '150ms ease-out',
      style({ opacity: 1, transform: 'translateX(0)' }),
    ),
  ]),
]);
