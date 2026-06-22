import { Routes} from '@angular/router';

export const SHORTS_ROUTES: Routes = [
  {
    path: '', // Luego la ruta vacía
    loadComponent: () => import('./shorts/shorts.component').then((v) => v.ShortsComponent),
  },
];
