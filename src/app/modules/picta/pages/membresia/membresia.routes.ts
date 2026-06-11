import { Routes } from '@angular/router';

export const MEMBRESIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./membresia/membresia.component').then(
        v => v.MembresiaComponent,
      ),
  },
];
