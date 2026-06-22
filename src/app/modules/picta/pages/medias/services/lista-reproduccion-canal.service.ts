import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, Observable, of, retry} from 'rxjs';
import {pluck} from 'rxjs';
import { environment } from '../../../../../../environments/environment';

const url = 'https://api.picta.cu/v2/lista_reproduccion_canal/';

@Injectable({
  providedIn: 'root'
})
export class ListaReproduccionCanalService {
  private httpClient = inject(HttpClient);

  url = 'lista_reproduccion_canal';
  urlLRCP = `li_re_ca_pub`;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  getListaReproduccionCanales(id: any): Observable<any[]> {
    let params = new HttpParams();
    params = params.append('id', id);
    return this.httpClient.get<any>(url, { params: params })
  }

  getVideosRecomendados(id: any, extraParams?: Record<string, string>): Observable<any> {
    let params = new HttpParams().set('id_publicacion', id);

    if (extraParams) {
      for (const key of Object.keys(extraParams)) {
        params = params.set(key, extraParams[key]);
      }
    }

    return this.httpClient.get(`${environment.baseUrl}/v2/${this.url}/listar_recomendados/`, {
      params
    }).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((error) => {
        console.error('Error en getVideosRecomendados:', error);
        return of({ results: [], next: null });
      })
    );
  }

  getSeriesRecomendadas(id: any): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/v2/${this.url}/listar_recomendados_series/`, {
      params: new HttpParams()
        .set('id_serie', id)
    }).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((error) => {
        console.error('Error en getSeriesRecomendadas:', error);
        return of({ results: [], next: null });
      })
    );
  }

  getPlaylist(id: any): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/v2/${this.url}/`, {
      params: new HttpParams()
        .set('id', id)
    }).pipe(
      pluck('results')
    );
  }

  getLRCP(id): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/v2/${this.urlLRCP}/`, {
      params: new HttpParams()
        .set('lista_id', id)
        .set('ordering', 'posicion')
    }).pipe(
      pluck('results')
    );
  }
}
