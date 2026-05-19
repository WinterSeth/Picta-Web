import { Routes} from '@angular/router';
import {VideoResolverService} from './services/video-resolver.service';

export const MUSICAL_ROUTES: Routes = [
  {
    path: ':slug_url', 
    loadComponent:() => import('./components/musical/musical.component').then((v) => v.MusicalComponent),
    resolve: {
      movie: VideoResolverService
    }
  },
];
