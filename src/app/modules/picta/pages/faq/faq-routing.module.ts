import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FaqComponent} from './components/faq/faq.component';

export const FAQ_ROUTES: Routes = [
  {
    path: '',
    loadComponent:() => import('./components/faq/faq.component').then((v) => v.FaqComponent)
  }
];
