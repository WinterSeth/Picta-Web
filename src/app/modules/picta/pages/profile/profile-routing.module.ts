import { Routes} from '@angular/router';
import {AuthGuard} from '../../../../services/auth.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/profile-sidenav/profile-sidenav.component').then((v) => v.ProfileSidenavComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'configuracion',
        pathMatch: 'full'
      },
      {
        path: 'playlists',
        loadComponent:() => import('./components/my-playlist/my-playlist.component').then((v) => v.MyPlaylistComponent),
        canActivate: [AuthGuard],
        pathMatch: 'full'
      },
      {
        path: 'request-channel',
        loadComponent:() => import('./components/request-channel-dialog/request-channel-dialog.component').then((v) => v.RequestChannelDialogComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'seller-form',
        loadComponent:() => import('./components/solicitud-form/solicitud-form.component').then((v) => v.SolicitudFormComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'following',
        loadComponent:() => import('./components/my-subscriptions/my-subscriptions.component').then((v) => v.MySubscriptionsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'mis-pagos',
        loadComponent:() => import('./components/suscripciones/suscripciones/suscripciones.component').then((v) => v.SuscripcionesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'configuracion',
        loadComponent:() => import('./components/profile/profile.component').then((v) => v.ProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'devices',
        loadComponent:() => import('./components/my-devices/my-devices.component').then((v) => v.MyDevicesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'solicitudes',
        loadComponent:() => import('./components/solicitud-list/solicitud-list.component').then((v) => v.SolicitudListComponent),
        canActivate: [AuthGuard]
      },
    ]
  },
];
