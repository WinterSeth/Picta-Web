import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Observable} from 'rxjs';
import {CanalService} from '../pages/canal/services/canal-service.service';
import {Canal} from '../pages/canal/models/canal.model';
import {PictaResponse} from '../models/response.picta.model';


@Injectable({
  providedIn: 'root'
})
export class CanalesResolverService  {
  private canalService = inject(CanalService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.canalService.getChanels({
      page: 1,
      page_size: 20,
      ordering: '-cantidad_suscripciones',
      nombre: ''
    })
  }
}
