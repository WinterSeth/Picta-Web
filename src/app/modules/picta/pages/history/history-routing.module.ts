import { Routes} from '@angular/router';

export const HISTORY_ROUTES: Routes = [
  {
    path: '', 
    loadComponent:() => import('./components/history/history.component').then((v) => v.HistoryComponent)
  },
];
