import { Routes} from '@angular/router';
import {SearchComponent} from './components/search/search.component';

export const SEARCH_ROUTES: Routes = [
  {
    path: ':query',
    loadComponent:() => import('./components/search/search.component').then((v) => v.SearchComponent),
  }
];
