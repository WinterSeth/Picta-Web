import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

const urlv3Plans = `${environment.baseUrlv3}/plans/`;
const urlv3Cancel = `${environment.baseUrlv3}/cancel/`;
const urlv3Subscription = `${environment.baseUrlv3}/subscription/`;

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private http = inject(HttpClient);

  private apiUrl = 'https://api.picta.cu/v3/suscripciones';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() { }

  getAllPlans() {
    return this.http.get(urlv3Plans);
  }

  getUserSubscriptions() {
    return this.http.get(urlv3Subscription);
  }

  cancelPlan(id: any) {
    const body = new FormData();
    return this.http.patch(`${urlv3Cancel}${id}/`, body);
  }

  getPlanById(id: number) {
    return this.http.get(`${urlv3Plans}${id}/`);
  }

}
