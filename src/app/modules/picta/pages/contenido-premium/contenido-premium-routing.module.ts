import { Routes } from '@angular/router';
import { AuthGuard } from '../../../../services/auth.guard';

export const CONTENIDO_PREMIUM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contenido-premium.component').then(
        v => v.ContenidoPremiumComponent,
      ),
    canActivate: [AuthGuard],
  },
];