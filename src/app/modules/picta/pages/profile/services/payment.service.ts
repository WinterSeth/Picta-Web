import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {UtilsService} from '../../../../../services/utils.service';
import {map} from 'rxjs';
import { environment } from '../../../../../../environments/environment';

interface Payment {
  name: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

// const URL = `http://10.3.201.190:8000/v2/payment`;
const URL = `${environment.baseUrlV2}/payment`;
const URLItems = `${environment.baseUrlV2}/payment_item/`;
const URLPaymentMethods = `${environment.baseUrlV2}/payment/get_payment_methods/`;

@Injectable({
  providedIn: 'root'
})

export class PaymentService {
  private httpClient = inject(HttpClient);
  private utilsService = inject(UtilsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {
  }

  createPayment(items: any) {
    const body = {
      items
    };
    return this.httpClient.post(`${URL}/pay/`, body);
  }

  createQR(items) {
    const body = {
      items
    };
    return this.httpClient.post(`${URL}/generate_qr/`, body);
  }

  checkTicket(data: any) {
    const params = this.utilsService.getQueryParams(data);
    return this.httpClient.get(`${URL}/payments/`, {params});
  }

  checkPayementMethods(): any {
    return this.httpClient.get<any>(`${URLPaymentMethods}`);
  }

  checkPayedItems() {
    return this.httpClient.get(`${URLItems}payed/`);
  }

  getItems() {
    return this.httpClient.get(`${URLItems}`).pipe(
      map(data => data[0])
    );
  }

  getItem(params) {
    const qParams = this.utilsService.getQueryParams(params);
    return this.httpClient.get(`${URLItems}`, {
      params: qParams
    });
  }

  payTr(payment: any) {
    return this.httpClient.post(`${URL}/pay/`, payment);
  }

  confirmEnzonaPayment(params: { transaction_uuid: string }) {
    const qParams = this.utilsService.getQueryParams(params);
    return this.httpClient.get(`${URL}/confirm_ez/`, { params: qParams });
  }
}
