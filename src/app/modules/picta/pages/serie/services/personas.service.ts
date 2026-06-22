import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

const urlV2 = `${environment.baseUrl}/v2/persona/`;

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getAll(params?) {
    const queryParams = this.getQueryParams(params);
    return this.httpClient.get(urlV2, {params: queryParams});
  }


  getQueryParams = (params) => {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params[param]);
      }
    }
    return queryParameters;
  };
}
