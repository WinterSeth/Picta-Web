import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from './components/not-found/not-found.component';

export const NOTFOUND_ROUTES: Routes = [
  {
    path: '',
    component: NotFoundComponent,

  }
];
