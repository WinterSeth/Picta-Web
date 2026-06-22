import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserDeviceService {
  private httpClient = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  getUserDevices(): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrlv3}/userdevice/`);
  }

  deleteUserDevice(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${environment.baseUrlv3}/userdevice/${id}/`);
  }
}
