import { Routes} from '@angular/router';

export const POPULARES_ROUTES: Routes = [
  {
    path: '', 
    loadComponent:() => import('./populares.component').then((v) => v.PopularesComponent)
  },
];
