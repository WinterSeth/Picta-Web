import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../../../services/auth.service';
import { environment } from '../../../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const url = `${environment.baseUrl}/v1/denuncia/`;
const urlTipos = `${environment.baseUrl}/v1/tipo_denuncia/`;

@Injectable({
  providedIn: 'root'
})
export class DenunciaService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  private user: number;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.authService.user$.pipe(takeUntilDestroyed()).subscribe((res: any) => {
      if (res) {
        this.user = res.id;

      }
    });
  }

  add(data: any, id_publicacion) {
    const denuncia = new FormData();
    denuncia.append('publicacion', id_publicacion);
    denuncia.append('tipo_denuncia', data.tipo_denuncia);
    denuncia.append('usuario', this.user.toString());
    if (data.tipo_denuncia === 1 || data.tipo_denuncia === 10){
      denuncia.append('evidencia', data.evidencia);
    }
    return this.httpClient.post(url, denuncia);
  }

  getAll() {
    return this.httpClient.get(url);
  }

  getTipos() {
    return this.httpClient.get(urlTipos);
  }

}

