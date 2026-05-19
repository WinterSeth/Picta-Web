import { Routes} from '@angular/router';

export const ANIMES_ROUTES: Routes = [
  {
    path: '', 
    loadComponent:() => import('./components/animes.component').then((v) => v.AnimesComponent)
  },
  {
    path: 'recientes',
    loadComponent: () =>
      import('./components/animes-updated-expanded/animes-updated-expanded.component').then(
        v => v.AnimesUpdatedExpandedComponent,
      ),
  },
];
