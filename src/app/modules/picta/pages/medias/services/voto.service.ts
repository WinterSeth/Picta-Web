import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from "../../../../../services/auth.service";
import { environment } from '../../../../../../environments/environment';

const url = `${environment.baseUrl}/v1/voto/`;
const urlV2 = `${environment.baseUrl}/v2/voto/`;

@Injectable({
  providedIn: 'root'
})
export class VotoService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getVotoByPublicacion(id_publicacion: number) {
    let params = new HttpParams();
    const { id } = this.authService.userData;
    params = params.set('usuario_id', id);
    params = params.set('publicacion_id', id_publicacion.toString());
    return this.httpClient.get(`${urlV2}`, {
      params
    });
  }

  vote(id_publicacion: number, valor) {
    let vote = new FormData();
    vote.append('usuario', 'true');
    vote.append('publicacion', id_publicacion.toString());
    vote.append('valor', valor);
    return this.httpClient.post(`${url}`, vote);
  }

  updateVote(id_vote: number, valor) {
    let vote = new FormData();
    vote.append('valor', valor);
    return this.httpClient.patch(`${url}${id_vote}/`, vote);
  }

  deleteVote(id_voto: number) {
    return this.httpClient.delete(`${url}${id_voto}/`);
  }
}
