import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {delay, retryWhen, take} from 'rxjs';
import { environment } from '../../../../../../environments/environment';

const url = `${environment.baseUrl}/v1/seccion/`;
const urlV2 = `${environment.baseUrl}/v2/seccion/`;

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getSecciones(page: number) {
    const params = {
      activo: true,
      ordering: '-prioridad',
      page_size: 5,
      for_today: true
    };

    let queryParameters = this.getQueryParams(params);
    if (page) {
      queryParameters = queryParameters.append('page', page.toString());
    }

    return this.httpClient.get(`${urlV2}`, {
      params: queryParameters
    }).pipe(
      retryWhen(errors =>
        errors.pipe(
          delay(10000),
          take(500))
      )
    );
  }

  getSeccionesAdmin() {
    return this.httpClient.get(`${urlV2}`);
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

  addSeccion(data) {
    let body = new FormData();
    body.append('nombre', data.nombre);
    body.append('estilo', data.estilo);
    body.append('fecha_ini', data.fecha_ini);
    body.append('fecha_fin', data.fecha_fin);
    body.append('prioridad', data.prioridad);
    body.append('filtros', data.filtros);
    return this.httpClient.post(url, body);

  }

  deleteSeccion(id: number) {
    return this.httpClient.delete(`${url}${id}/`);
  }

  editSection(id, dirtyValues) {
    const body = new FormData();
    for (let field in dirtyValues) {
      body.append(field, dirtyValues[field]);
    }

    return this.httpClient.patch(`${url}${id.value}/`, body);
  }
}
