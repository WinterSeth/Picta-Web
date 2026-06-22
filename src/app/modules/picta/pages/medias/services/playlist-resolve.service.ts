import {inject, Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {map, of} from 'rxjs';
import {UserPlaylistService} from '../../profile/services/user-playlist.service';
import {pluck} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaylistResolveService  {

  private userPlaylistService = inject(UserPlaylistService);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    if (route.queryParamMap.get('playlist')) {
      return this.userPlaylistService.getAll({id: route.queryParamMap.get('playlist')}).pipe(
              map((response) => {
                return response.results;
              }));
    } else {
      return of(null);
    }
  }
}
