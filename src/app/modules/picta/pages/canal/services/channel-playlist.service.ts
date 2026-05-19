import { inject, Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UtilsService} from "../../../../../services/utils.service";
import {PictaResponse} from "../../../models/response.picta.model";
import {Playlist} from "../models/playlist";
import { environment } from '../../../../../../environments/environment';

const baseUrlV2 = `${environment.baseUrlV2}`;

@Injectable({
  providedIn: 'root'
})
export class ChannelPlaylistService {
  private httpClient = inject(HttpClient);
  private utilsService = inject(UtilsService);

  getPlaylists(params: any = {}){
    const qParams = this.utilsService.getQueryParams(params);
    return this.httpClient.get<PictaResponse<Playlist>>(`${baseUrlV2}/lista_reproduccion_canal`, {params: qParams})
  }
}
