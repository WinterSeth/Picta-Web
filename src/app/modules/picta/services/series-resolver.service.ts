import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Observable} from 'rxjs';
import {PictaResponse} from '../models/response.picta.model';
import { Serie } from '../pages/medias/models/publicacion.model';
import { SerieService } from '../pages/categoria/services/serie.service';


@Injectable({
  providedIn: 'root'
})
export class SeriesResolverService  {
  private serieService = inject(SerieService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.serieService.getSeries();
  }
}
