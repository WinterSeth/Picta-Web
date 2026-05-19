import { Routes} from '@angular/router';
import {PlaylistResolveService} from './services/playlist-resolve.service';

export const MEDIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/publicacion/publicacion.component').then((v) => v.PublicacionComponent),
    resolve: {
      playlist: PlaylistResolveService
    }
  }
  ]
;
