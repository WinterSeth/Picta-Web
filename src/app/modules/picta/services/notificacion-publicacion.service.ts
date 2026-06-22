import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UtilsService} from '../../../services/utils.service';
import { environment } from '../../../../environments/environment';

const URLV2 = `${environment.baseUrl}/v2/notificacion/`;
const URL = `${environment.baseUrl}/v1/notificacion/`;

@Injectable({
  providedIn: 'root'
})
export class NotificacionPublicacionService {
  private httpClient = inject(HttpClient);
  private utils = inject(UtilsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getAll(params: any) {
    const queryParameters = this.utils.getQueryParams(params);

    return this.httpClient.get(URLV2, {params: queryParameters});
  }

  markAsRead(id, ids: string) {
    const data = new FormData();
    data.append('ids', ids);
    return this.httpClient.patch(`${URL}${id}/`, data);
  }
}
