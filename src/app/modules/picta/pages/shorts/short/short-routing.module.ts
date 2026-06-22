import { Routes} from '@angular/router';

export const SHORT_ROUTES: Routes = [
  {
    path: '', // Primero la ruta con parámetro
    loadComponent: () => import('./short.component').then((v) => v.ShortComponent),
  },
];
