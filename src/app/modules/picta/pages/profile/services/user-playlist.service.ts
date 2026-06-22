import {EventEmitter, inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UtilsService} from '../../../../../services/utils.service';
import {finalize, Observable} from 'rxjs';
import { environment } from '../../../../../../environments/environment';


const urlV2 = `${environment.baseUrl}/v2/lista_reproduccion/`;
const url = `${environment.baseUrl}/v1/lista_reproduccion/`;

@Injectable({
  providedIn: 'root'
})
export class UserPlaylistService {
  onPlaylistChanged = new EventEmitter();
  private httpClient = inject(HttpClient);
  private utilesService = inject(UtilsService);

  getAll(params = {}): Observable<any> {
    const queryParams = this.getQueryParams(params);
    return this.httpClient.get(urlV2, {params: queryParams});
  }

  playlistChanged() {
    this.onPlaylistChanged.emit();
  }

  getQueryParams = (params) => {
    let queryParameters = new HttpParams();
    if (Object.keys(params).length > 0) {
      for (const param in params) {
        queryParameters = queryParameters.set(param, params[param]);
      }
      return queryParameters;
    }
    return null
  };

  create(val: any) {
    const body = this.utilesService.getBody(val);
    return this.httpClient.post(url, body);
  }

  delete(id: number) {
    return this.httpClient.delete(`${url}${id}`).pipe(
      finalize(() => {
        this.playlistChanged();
      })
    );
  }

  update(id, updateBody) {
    const body = this.utilesService.getBody(updateBody);
    return this.httpClient.patch(`${url}${id}/`, body).pipe(
      finalize(() => {
        this.playlistChanged();
      })
    );
  }
}
