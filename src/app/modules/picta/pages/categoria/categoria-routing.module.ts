import { Routes} from '@angular/router';
import {CategoriaComponent} from './components/categoria/categoria.component';


export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/categoria/categoria.component').then((v) => v.CategoriaComponent),
  },
];
