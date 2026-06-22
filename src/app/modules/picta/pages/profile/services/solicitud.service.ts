import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {PictaResponse} from '../../../models/response.picta.model';
import {Solicitud} from '../models/solicitud';
import {UtilsService} from '../../../../../services/utils.service';
import { environment } from '../../../../../../environments/environment';

const URL = environment.baseUrl + '/v1/solicitud';
const URLv2 = environment.baseUrlV2 + '/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private http = inject(HttpClient);
  private utilesService = inject(UtilsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getAll(params = {}): Observable<PictaResponse<Solicitud>> {
    const qParams = this.utilesService.getQueryParams(params);
    return this.http.get<PictaResponse<Solicitud>>(URLv2, {
      params: qParams
    });
  }

  getSolicitud(params = {}): Observable<PictaResponse<Solicitud>> {
    const qParams = this.utilesService.getQueryParams(params);
    return this.http.get<PictaResponse<Solicitud>>(`${URLv2}/get_solicitud_me/`, {
    //return this.http.get<PictaResponse<Solicitud>>(`${URLv2}/`, {
      params: qParams
    });
  }

  create(data) {
    return this.http.post(`${URL}/`, data);
  }

  delete(id) {
    return this.http.delete(`${URL}/${id}`);
  }
  update(data) {
    return this.http.patch(`${URL}/${data.id}/`, data);
  }
}
