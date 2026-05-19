import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

const urlV2 = `${environment.baseUrl}/v2/temporada/`;

@Injectable({
  providedIn: 'root'
})
export class TemporadaService {
  private httpClient = inject(HttpClient);

  getAll(params?) {
    const queryParams = this.getQueryParams(params);
    return this.httpClient.get(urlV2, {params: queryParams});
  }

  getTemporadasPelserId(pelser_id: any): Observable<any> {
    let queryParameters = new HttpParams().set('serie_pelser_id', pelser_id);
    return this.httpClient.get<any>(`${urlV2}`, { params: queryParameters } ).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "";

        if(error.error instanceof ErrorEvent){
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error code: ${error.status}; message : ${error.message}`;
        }

        return throwError(() => errorMessage);
      }),
      map((response) => {
        return response.results;
      })
    )
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
