import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PictaResponse} from '../../../models/response.picta.model';
import { environment } from '../../../../../../environments/environment';

const UrlProvince = environment.baseUrlV2 + '/province';
const UrlMunicipality = environment.baseUrlV2 + '/municipality';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getProvinces(params = {}): Observable<PictaResponse<any>> {
    return this.http.get<PictaResponse<any>>(UrlProvince, {
      params: new HttpParams({fromObject: params})
    });
  }

  getMunicipalities(params = {}): Observable<PictaResponse<any>> {
    return this.http.get<PictaResponse<any>>(UrlMunicipality, {
      params: new HttpParams({fromObject: params})
    });
  }
}
