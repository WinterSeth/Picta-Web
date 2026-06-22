import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, pluck} from 'rxjs';
import {UtilsService} from '../../../../../services/utils.service';
import { environment } from '../../../../../../environments/environment';

const URL = `${environment.baseUrl}/v1/palabra_clave/`;
const URLv2 = `${environment.baseUrlV2}/palabra_clave/`;

@Injectable({
  providedIn: 'root'
})
export class PalabrasClavesService {
  private httpCLient = inject(HttpClient);
  private utilesService = inject(UtilsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getAll() {
    return this.httpCLient.get(URL).pipe(map((response: any) => response.results));

  }
  getByQuery(params?) {
    let queryParameters = new HttpParams();
    if (params) {
      queryParameters = this.utilesService.getQueryParams(params);
    }

    return this.httpCLient.get(`${URLv2}`, {
      params: queryParameters
    }).pipe(pluck('results'));
  }

  create(palabra: string) {
    const body = new FormData();
    body.append('palabra', palabra);
    return this.httpCLient.post(URL, body)
  }
}
