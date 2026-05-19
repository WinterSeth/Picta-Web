import {Routes} from '@angular/router';

export const LOGIN_ROUTES: Routes = [
  {
    path: 'acceder',
    loadComponent: ()=> import('../login/components/login/login.component').then(m=> m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: ()=> import('../register/components/register/register.component').then(m=> m.RegisterComponent),
  },
];