import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegisterComponent} from './components/register/register.component';

export const REGISTRO_ROUTES: Routes = [
  {
    path: '',
    component: RegisterComponent,

  }
];
