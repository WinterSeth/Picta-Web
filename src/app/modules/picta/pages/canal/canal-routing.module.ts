import {Routes} from '@angular/router';

export const CANAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/canal/canal.component').then((v) => v.CanalComponent),
  }
];
