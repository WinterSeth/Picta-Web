import {Routes} from '@angular/router';

export const TERMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/terms/terms.component').then((v) => v.TermsComponent)
  }
];