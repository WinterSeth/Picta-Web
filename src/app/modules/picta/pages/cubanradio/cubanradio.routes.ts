import {Routes} from '@angular/router';

export const CUBANRADIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./cubanradio.component').then((v) => v.CubanradioComponent),
  },
  {
    path: 'cubandjsproradio',
    loadComponent:() => import('./cubanradio.component').then((v) => v.CubanradioComponent),
  }
];
