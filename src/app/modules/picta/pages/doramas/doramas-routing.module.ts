import { Routes} from '@angular/router';

export const DORAMAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/doramas.component').then((v) => v.DoramasComponent)
  },
  {
    path: 'recientes',
    loadComponent: () => 
      import('./components/doramas-updated-expanded/doramas-updated-expanded.component')
      .then((c) => c.DoramasUpdatedExpandedComponent)
  },
];
