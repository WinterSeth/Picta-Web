import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Perfil {
  id?: number;
  nombre: string;
  tipo: 'ADULTO' | 'INFANTIL' | string;
  clasificacion?: string;
  preferencias?: any;
  avatar?: string;
  puede_eliminar?: boolean;
  activo?: boolean;
}

const baseUrl = `${environment.baseUrlV1}/perfiles/`;

@Injectable({ providedIn: 'root' })
export class PerfilesService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(baseUrl);
  }

  create(payload: Partial<Perfil>): Observable<any> {
    return this.http.post(baseUrl, payload);
  }

  put(id: number | string, payload: Partial<Perfil>): Observable<any> {
    return this.http.put(`${baseUrl}${id}/`, payload);
  }

  patch(id: number | string, payload: Partial<Perfil>): Observable<any> {
    return this.http.patch(`${baseUrl}${id}/`, payload);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${baseUrl}${id}/`);
  }

  setActive(id: number | string): Observable<any> {
    return this.http.post(`${baseUrl}${id}/set_active/`, { activo: true });
  }
}