import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

const url = `${environment.baseUrl}/v1/faq/`;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getFaqs() {
    return this.httpClient.get(`${url}`);
  }

  getQueryParams = (params) => {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params[param]);
      }
      return queryParameters;
    }
    return queryParameters;
  };
  getBody = (params) => {
    const body = new FormData();
    if (params) {
      if (Object.keys(params).length > 0) {
        for (const param in params) {
          if (params[param]) {
            body.append(param, params[param]);
          }
        }
      }
    }
    return body;
  };
}
