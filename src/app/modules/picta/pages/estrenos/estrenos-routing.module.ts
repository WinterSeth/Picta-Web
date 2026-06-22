import { Routes} from '@angular/router';

export const ESTRENOS_ROUTES: Routes = [
  {
    path: '', 
    loadComponent:() => import('./estrenos.component').then((v) => v.EstrenosComponent)
  },
];
