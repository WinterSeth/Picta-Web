import { Routes } from '@angular/router';
import { AuthGuard } from '../../../../services/auth.guard';

export const NOVELAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/novelas.component').then(v => v.NovelasComponent),
  },
  {
    path: 'recientes',
    loadComponent: () =>
      import('./components/novelas-updated-expanded/novelas-updated-expanded.component').then(
        v => v.NovelasUpdatedExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
];
