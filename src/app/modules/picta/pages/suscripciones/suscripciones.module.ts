import { Routes} from '@angular/router';

export const SUSCRIPCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./suscripciones/suscripciones.component').then((v) => v.SuscripcionesComponent)
  }
];
