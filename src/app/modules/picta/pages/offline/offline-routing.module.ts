import {Routes} from '@angular/router';

export const OFFLINE_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/offline/offline.component').then((v) => v.OfflineComponent)
  }
];
