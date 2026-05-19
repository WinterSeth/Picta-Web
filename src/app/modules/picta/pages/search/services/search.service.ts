import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

const url = `${environment.baseUrlV2}/s/buscar/`;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  search(criterio: string, page?: any) {
    let params = new HttpParams();
    params = params.set('page', page ? page : '1');
    params = params.set('page_size', '20');
    params = params.set('criterio', criterio);
    return this.httpClient.get(url, {params});
  }

}
