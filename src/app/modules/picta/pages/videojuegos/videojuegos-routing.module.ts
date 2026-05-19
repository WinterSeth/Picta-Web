import { Routes} from '@angular/router';

export const JUEGOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/videojuegos.component').then((v) => v.VideojuegosComponent)
  }
];
