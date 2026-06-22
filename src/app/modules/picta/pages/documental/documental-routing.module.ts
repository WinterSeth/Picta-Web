import { Routes} from '@angular/router';
import {VideoResolverService} from './services/video-resolver.service';

export const DOCUMENTAL_ROUTES: Routes = [
  {
    path: ':slug_url',
    loadComponent:() => import('./components/documental/documental.component').then((v) => v.DocumentalComponent),
    resolve: {
      movie: VideoResolverService
    }
  },
];