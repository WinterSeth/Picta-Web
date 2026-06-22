import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UtilsService} from '../../../../../services/utils.service';
import { environment } from '../../../../../../environments/environment';

const url = `${environment.baseUrl}/v1/comentario/`;
const urlV2 = `${environment.baseUrl}/v2/comentario/`;


@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private http = inject(HttpClient);
  private utilesService = inject(UtilsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

   comentariosByPost(params) {
    const qParams = this.utilesService.getQueryParams(params);
    return this.http.get(`${urlV2}`, {params: qParams});
  }
  
 /* comentariosByPost(id) {
    return this.http.get(`${urlV2}`, {params: new HttpParams().append('publicacion_id', id)});

  }*/

  addComment(idPublicacion: number, texto: string) {
    const comment = new FormData();
    comment.append('publicacion', idPublicacion.toString());
    comment.append('texto', texto);
    comment.append('usuario', 'true');
    return this.http.post(url, comment);

  }

  addRespuesta(idPublicacion: number, texto: string, idComentario: number) {
    const respuesta = new FormData();
    respuesta.append('publicacion', idPublicacion.toString());
    respuesta.append('texto', texto);
    respuesta.append('usuario', 'true');
    respuesta.append('comentario', idComentario.toString());
    return this.http.post(url, respuesta);
  }

  updateComentario(texto: string, idComentario) {
    const respuesta = new FormData();
    respuesta.append('texto', texto);
    // respuesta.append('editado', 'true');
    return this.http.patch(`${url}${idComentario}/`, respuesta);
  }

  obtenerRespuestasDeComentario(idComentario: number) {
    let param = new HttpParams();
    param = param.set('comentario_id', idComentario.toString());
    return this.http.get(urlV2, {
      params: param
    });
  }

  deleteComentario(id) {
    return this.http.delete(`${url}${id}/`);
  }

}

