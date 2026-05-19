import { Injectable, NgZone, inject } from '@angular/core';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SseService {
  private zone = inject(NgZone);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  getServerSentEvent(url: string): Observable<any> {
    return Observable.create(observer => {
      const eventSource = this.getEventSource(url);
      eventSource.onmessage = event => {
        this.zone.run(() => {
          observer.next(event);
        });
      };
      eventSource.onerror = error => {
        this.zone.run(() => {
          observer.error(error);
        });
      };
    });

  }

  private getEventSource(url: string): EventSource {
    return new EventSource(url);

  }
}
