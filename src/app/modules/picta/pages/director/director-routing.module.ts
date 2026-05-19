import { Routes } from '@angular/router';

export const DIRECTOR_ROUTES: Routes = [
  {
    path: ':slug',
    loadComponent: () =>
      import('./components/director/director.component').then((v) => v.DirectorComponent),
  },
];