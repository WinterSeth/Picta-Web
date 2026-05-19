import { Routes } from '@angular/router';
import { CanalesResolverService } from './services/canales-resolver.service';
import { AuthGuard } from '../../services/auth.guard';

export const PICTA_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home-routing.module').then(m => m.HOME_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'canal/:alias',
    loadChildren: () =>
      import('./pages/canal/canal-routing.module').then(m => m.CANAL_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'serie/:serieNombre',
    loadChildren: () =>
      import('./pages/serie/serie-routing.module').then(m => m.SERIE_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'historial',
    loadChildren: () =>
      import('./pages/history/history-routing.module').then(
        m => m.HISTORY_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'movie',
    loadChildren: () =>
      import('./pages/movie/movie-routing.module').then(m => m.MOVIE_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'documental',
    loadChildren: () =>
      import('./pages/documental/documental-routing.module').then(
        m => m.DOCUMENTAL_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'musical',
    loadChildren: () =>
      import('./pages/musical/musical-routing.module').then(
        m => m.MUSICAL_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'medias/:slug_url',
    loadChildren: () =>
      import('./pages/medias/medias-routing.module').then(m => m.MEDIAS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./pages/search/search-routing.module').then(m => m.SEARCH_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'categoria/:cat',
    loadChildren: () =>
      import('./pages/categoria/categoria-routing.module').then(
        m => m.CATEGORY_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'favoritos/:media',
    loadComponent: () =>
      import('./pages/categoria/components/favorites-expanded/favorites-expanded.component').then(
        v => v.FavoritesExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'recientes/:media',
    loadComponent: () =>
      import('./pages/categoria/components/recent-expanded/recent-expanded.component').then(
        v => v.RecentExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'recientes-cuba/:media',
    loadComponent: () =>
      import('./pages/categoria/components/recent-cuba-expanded/recent-cuba-expanded.component').then(
        v => v.RecentCubaExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'populares-mes/peliculas',
    loadComponent: () =>
      import('./pages/categoria/components/popular-month-expanded/popular-month-expanded.component').then(
        v => v.PopularMonthExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'series-actualizadas',
    loadComponent: () =>
      import('./pages/categoria/components/series-updated-expanded/series-updated-expanded.component').then(
        v => v.SeriesUpdatedExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'shows/recientes',
    loadComponent: () =>
      import('./pages/shows/components/shows-updated-expanded/shows-updated-expanded.component').then(
        v => v.ShowsUpdatedExpandedComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'suscripciones',
    loadChildren: () =>
      import('./pages/suscripciones/suscripciones.module').then(
        v => v.SUSCRIPCIONES_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./pages/profile/profile-routing.module').then(
        m => m.PROFILE_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'faq',
    loadChildren: () =>
      import('./pages/faq/faq-routing.module').then(m => m.FAQ_ROUTES),
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./pages/about/about-routing.module').then(m => m.ABOUR_ROUTES),
  },
  {
    path: 'terms',
    loadChildren: () =>
      import('./pages/terms/terms-routing.module').then(m => m.TERMS_ROUTES),
  },
  {
    path: 'ayuda-soporte',
    loadComponent: () =>
      import('./components/help-support/help-support.component').then(
        v => v.HelpSupportComponent,
      ),
  },
  {
    path: 'offline',
    loadChildren: () =>
      import('./pages/offline/offline-routing.module').then(
        m => m.OFFLINE_ROUTES,
      ),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./components/notification-center/notification-center.component').then(
        v => v.NotificationCenterComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'canal-list',
    loadComponent: () =>
      import('./components/canal-list/canal-list.component').then(
        v => v.CanalListComponent,
      ),
    resolve: {
      canales: CanalesResolverService,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'payment/confirm',
    loadComponent: () =>
      import('./components/payment-confirmation/payment-confirmation.component').then(
        v => v.PaymentConfirmationComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'estrenos',
    loadChildren: () =>
      import('./pages/estrenos/estrenos-routing.module').then(
        m => m.ESTRENOS_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tendencias',
    loadChildren: () =>
      import('./pages/populares/populares-routing.module').then(
        m => m.POPULARES_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'animes',
    loadChildren: () =>
      import('./pages/animes/animes-routing.module').then(m => m.ANIMES_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'shows',
    loadChildren: () =>
      import('./pages/shows/shows-routing.module').then(m => m.SHOW_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'shorts',
    loadChildren: () =>
      import('./pages/shorts/shorts-routing.module').then(m => m.SHORTS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'short/:slug',
    loadChildren: () =>
      import('./pages/shorts/short/short-routing.module').then(
        m => m.SHORT_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'deportes',
    loadChildren: () =>
      import('./pages/deportes/deportes-routing.module').then(
        m => m.DEPORTES_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'contenido-premium',
    loadChildren: () =>
      import('./pages/contenido-premium/contenido-premium-routing.module').then(
        m => m.CONTENIDO_PREMIUM_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'novelas',
    loadChildren: () =>
      import('./pages/novelas/shows-routing.module').then(
        m => m.NOVELAS_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'doramas',
    loadChildren: () =>
      import('./pages/doramas/doramas-routing.module').then(
        m => m.DORAMAS_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'infantiles',
    loadChildren: () =>
      import('./pages/infantiles/shows-routing.module').then(
        m => m.INFANTILES_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'videojuegos',
    loadChildren: () =>
      import('./pages/videojuegos/videojuegos-routing.module').then(
        m => m.JUEGOS_ROUTES,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'radioenvivo',
    loadChildren: () =>
      import('./pages/radio/radio.routes').then(m => m.RADIO_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'actor',
    loadChildren: () =>
      import('./pages/actor/actor-routing.module').then(m => m.ACTOR_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'director',
    loadChildren: () =>
      import('./pages/director/director-routing.module').then(m => m.DIRECTOR_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: '**', // Ruta comodín para capturar cualquier ruta no definida
    loadComponent: () =>
      import('../../modules/picta/pages/notfound/components/not-found/not-found.component').then(
        v => v.NotFoundComponent,
      ),
  },
];
