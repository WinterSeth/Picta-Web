import { Routes} from '@angular/router';
import {VideoResolverService} from './services/video-resolver.service';

export const MOVIE_ROUTES: Routes = [
  {
    path: ':slug_url', 
    loadComponent:() => import('./components/movie/movie.component').then((v) => v.MovieComponent)
  },
];
