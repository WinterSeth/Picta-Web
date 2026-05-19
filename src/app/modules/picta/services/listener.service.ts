import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ListenerService {
  private statusUrl = 'https://radio.picta.cu/status-json.xsl';

  constructor(private http: HttpClient) {}

  // Poll listeners for given streamKey (substring to match in listenurl)
  pollListeners(streamKey: string, periodMs: number = 20000): Observable<number> {
    return timer(0, periodMs).pipe(
      switchMap(() => this.http.get<any>(this.statusUrl).pipe(
        catchError(() => of(null))
      )),
      map((data) => {
        if (!data) { return 0; }
        const sources = data?.icestats?.source ?? [];
        const list = Array.isArray(sources) ? sources : [sources];
        const match = list.find((s: any) => (s.listenurl || '').includes(streamKey));
        if (match) {
          const n = parseInt(match.listeners, 10);
          return Number.isFinite(n) ? n : 0;
        }
        return 0;
      })
    );
  }
}
