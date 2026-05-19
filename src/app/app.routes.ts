import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'payment/enzona/confirm',
    loadComponent: () =>
      import('./modules/picta/components/enzona-payment-confirm/enzona-payment-confirm.component').then(
        v => v.EnzonaPaymentConfirmComponent,
      ),
  },
  {
    path: 'payment/enzona/cancel',
    loadComponent: () =>
      import('./modules/picta/components/enzona-payment-cancel/enzona-payment-cancel.component').then(
        v => v.EnzonaPaymentCancelComponent,
      ),
  },
  {
    path: 'inicio',
    loadChildren: () =>
      import('./modules/picta/pages/landing/landing-routing.module').then(
        m => m.LANDING_ROUTES,
      ),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./modules/picta/pages/profile/components/seleccionar-perfil/seleccionar-perfil.component').then(
        v => v.SeleccionarPerfilComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuario',
    loadChildren: () =>
      import('./modules/picta/pages/login/login-routing.module').then(
        m => m.LOGIN_ROUTES,
      ),
  },
  {
    path: 'embebido',
    loadChildren: () =>
      import('./modules/embed/embed-routing.module').then(m => m.EMBED_ROUTES),
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./modules/chat/chat-routing.module').then(m => m.CHAT_ROUTES),
  },
  {
    path: 'cortos',
    loadChildren: () =>
      import('./modules/picta/pages/shorts/shorts-routing.module').then(
        v => v.SHORTS_ROUTES,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/picta/components/layout/layout.component').then(
        v => v.LayoutComponent,
      ),
    children: [
      {
        path: 'radio-demo',
        loadComponent: () =>
          import('./pages/radio-demo/radio-demo.component').then(
            m => m.RadioDemoComponent,
          ),
      },
      {
        path: 'radio-favorites',
        loadComponent: () =>
          import('./pages/radio-favorites/radio-favorites.component').then(
            m => m.RadioFavoritesComponent,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./modules/picta/picta-routing.module').then(
            m => m.PICTA_ROUTES,
          ),
      },
    ],
  },
];
