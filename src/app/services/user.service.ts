import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UtilsService} from './utils.service';
import {Observable, pluck} from 'rxjs';
import { environment } from '../../environments/environment';

const url = `${environment.baseUrl}/v1/usuario`;

@Injectable({
  providedIn: "root",
})
export class UserService {
  private httpClient = inject(HttpClient);
  private utilService = inject(UtilsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  updateUser(id, user) {
    let body = new FormData();
    for (const field in user) {
      body.append(field, user[field]);
    }
    if(user.phone_number){
    body.append("country_code", "+53");
    }
    return this.httpClient.patch(`${url}/${id}/`, body);
  }

  getUserInfo(): Observable<any> {
		return this.httpClient.get<any>(`${environment.baseUrlV2}/usuario/me/`);
	}

  verifySms(data) {
    const body = new FormData();
    data.email && body.append('email', data.email);
    data.phone && body.append('phone_number', `${data.phone}`);
    return this.httpClient.post(`${url}/sms_forgot_password/`, body);
  }

  resendSmsCode(data) {
    const body = new FormData();
    if(data.phone){
      body.append('phone_number', `${data.phone}`);
    } else {
      body.append('email', data.email);
    }
    return this.httpClient.post(`${environment.baseUrl}/v1/usuario/sms_resend/`, body);
  }

  changePassword(data) {
    let body = new FormData();
    body.append("long_token", data.long_token);
    body.append("short_token", data.short_token);
    body.append("new_password", data.new_password);
    return this.httpClient.post(`${url}/change_password_with_tk/`, body);
  }

  disableUser(id) {
    const body = new FormData();
    body.append("is_active", "false");
    return this.httpClient.patch(`${url}/${id}/`, body);
  }

  getAllUsers(params?) {
    let queryParameters = new HttpParams();
    if (params) {
      queryParameters = this.utilService.getQueryParams(params);
    }
    return this.httpClient.get(`${environment.baseUrlV2}/usuario/?asociar_canal=true&page_size=25&ordering=username&is_active=true`, {
      params: queryParameters
    }).pipe(pluck('results'));
  }
}
