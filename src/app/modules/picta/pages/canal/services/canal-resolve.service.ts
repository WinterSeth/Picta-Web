import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Observable} from 'rxjs';
import {CanalService} from './canal-service.service';
import {pluck} from 'rxjs';
import {Canal} from '../models/canal.model';

@Injectable({
  providedIn: 'root'
})
export class CanalResolveService  {
  private canalService = inject(CanalService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Canal> | Promise<Canal> | Canal {
    return this.canalService.getChannel(route.paramMap.get('alias')).pipe(
      pluck('results')
    );
  }
}
