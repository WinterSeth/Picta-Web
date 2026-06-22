import { Routes } from '@angular/router';

export const RADIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./radio-list.component').then(m => m.RadioListComponent),
  },
  // Keep existing Cubanradio shortcut available under the old mount
  {
    // Static route for the special Cuban DJ mount. Placed before ':mount'
    // so it isn't captured by the parameterized route.
    path: 'cubandjspro_radio',
    loadComponent: () =>
      import('../cubanradio/cubanradio.component').then(
        v => v.CubanradioComponent,
      ),
  },
  {
    path: ':mount',
    loadComponent: () =>
      import('./radio-detail.component').then(m => m.RadioDetailComponent),
  },
];
