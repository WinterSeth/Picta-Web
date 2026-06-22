import {Routes} from '@angular/router';

export const EMBED_ROUTES: Routes = [
  {
    path: ':slugUrl',
    loadComponent:() => import('./components/embed/embed.component').then((v) => v.EmbedComponent)
  }
];
