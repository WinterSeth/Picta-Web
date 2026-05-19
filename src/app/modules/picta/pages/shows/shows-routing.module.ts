import { Routes} from '@angular/router';

export const SHOW_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/shows.component').then((v) => v.ShowsComponent)
  }
];
