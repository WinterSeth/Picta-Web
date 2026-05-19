import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Canal} from '../models/canal.model';
import {PictaResponse} from '../../../models/response.picta.model';
import { environment } from '../../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CanalService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  public getChanels(params: any): Observable<PictaResponse<Canal>> {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params [param]);
      }
    }
    return this.httpClient.get<any>(`${environment.baseUrl}/v2/canal/`, { params: queryParameters });
  }

  public getChannel(alias: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrl}/v2/canal/`, { params: new HttpParams().set('alias_raw', alias) });
  }

  public getCategoria(categoria: string, page: string) {
    const params = {
      page: page,
      page_size: 15,
      palabraClave_raw: `${categoria}`
    };

    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params [param]);
      }
    }

    return this.httpClient.get<any>(`${environment.baseUrl}/v2/publicacion/`, { params: queryParameters });
  }
}
