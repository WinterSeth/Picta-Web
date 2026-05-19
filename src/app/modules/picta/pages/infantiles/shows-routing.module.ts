import { Routes} from '@angular/router';

export const INFANTILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/infantiles.component').then((v) => v.InfantilesComponent)
  }
];
