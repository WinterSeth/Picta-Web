import { Routes } from '@angular/router';

export const ACTOR_ROUTES: Routes = [
  {
    path: ':slug',
    loadComponent: () =>
      import('./components/actor/actor.component').then((v) => v.ActorComponent),
  },
  {
    path: ':slug/:media',
    loadComponent: () =>
      import('./components/actor-expanded/actor-expanded.component').then((v) => v.ActorExpandedComponent),
  },
];