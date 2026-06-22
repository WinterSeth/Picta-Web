import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdsService {
  private http = inject(HttpClient);
  private ads$?: Observable<any[]>;

  /**
   * Devuelve el listado de anuncios leyendo `public/ads.json`.
   * Resultado cacheado con `shareReplay`.
   */
  getAds(): Observable<any[]> {
    if (!this.ads$) {
      this.ads$ = this.http.get<any[]>('/ads.json').pipe(
        // cache single last value
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.ads$;
  }

  /** Forzar recarga desde el servidor */
  refreshAds(): Observable<any[]> {
    this.ads$ = this.http.get<any[]>('/ads.json').pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
    return this.ads$;
  }
}
