import {Routes} from '@angular/router';

export const SERIE_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/serie/serie.component').then((v) => v.SerieComponent),
  },
];