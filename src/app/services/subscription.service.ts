import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';


const url = `${environment.baseUrl}/v1/suscripcion/`;
const urlv2 = `${environment.baseUrlV2}/suscripcion/`;

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  subscribe(canal: number) {
    let sub = new FormData();
    sub.append('canal', canal.toString());
    sub.append('usuario', 'true');
    return this.httpClient.post(url, sub);
  }

  unsubscribe(id: number) {
    return this.httpClient.delete(`${url}${id}/`);
  }

  update(id: number, notificaciones: boolean) {
    const form = new FormData();
    form.append('notificaciones', notificaciones.toString());
    return this.httpClient.patch(`${url}${id}/`, form);
  }

  getSubscriptionsByUser(filter: { canalId: number; usuarioNombre: string }) {
    let param = new HttpParams();
    param = param.append('canal_id', filter.canalId.toString());
    param = param.append('usuario_nombre_raw', filter.usuarioNombre);
    return this.httpClient.get(urlv2, {
      params: param,
    });
  }

  getSubscriptionsByUserOnly(filter: { usuarioNombre: string }) {
    let param = new HttpParams();
    param = param.append('usuario_nombre_raw', filter.usuarioNombre);
    return this.httpClient.get(urlv2, {
      params: param,
    });
  }

  getAllSubscriptionsByUser(filters): any {
    return this.httpClient.get(urlv2, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
}
