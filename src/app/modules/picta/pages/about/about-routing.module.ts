import {Routes} from '@angular/router';

export const ABOUR_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/about/about.component').then((v) => v.AboutComponent)
  }
];
