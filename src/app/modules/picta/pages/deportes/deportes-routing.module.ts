import { Routes} from '@angular/router';

export const DEPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/deportes.component').then((v) => v.DeportesComponent)
  }
];
