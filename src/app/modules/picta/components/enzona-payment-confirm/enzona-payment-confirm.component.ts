import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PaymentService } from '../../pages/profile/services/payment.service';
import { catchError, finalize, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-enzona-payment-confirm',
  templateUrl: './enzona-payment-confirm.component.html',
  styleUrls: ['./enzona-payment-confirm.component.scss'],
  imports: [MatCard, MatCardContent, MatIcon, MatButtonModule, RouterLink, MatProgressSpinner]
})
export class EnzonaPaymentConfirmComponent {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  transactionUuid = '';
  confirmedTransactionUuid = '';
  confirmedBuyer = '';
  isVerifying = true;
  isConfirmed = false;
  verificationMessage = 'Confirmando el pago...';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.transactionUuid = params.get('transaction_uuid') || '';

      if (!this.transactionUuid) {
        this.isVerifying = false;
        this.isConfirmed = false;
        this.verificationMessage = 'No se encontró el identificador de la transacción.';
        return;
      }

      this.verifyPayment();
    });
  }

  private verifyPayment(): void {
    this.isVerifying = true;
    this.verificationMessage = 'Confirmando el pago...';

    this.paymentService.confirmEnzonaPayment({ transaction_uuid: this.transactionUuid })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.isConfirmed = false;
          this.verificationMessage = this.resolveApiErrorMessage(err);
          return of(null);
        }),
        finalize(() => {
          this.isVerifying = false;
        }),
        takeUntilDestroyed()
      )
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        this.isConfirmed = true;
        this.confirmedTransactionUuid = response.transaction_uuid || this.transactionUuid;
        this.confirmedBuyer = response.buyer || '';
        this.verificationMessage = 'Pago confirmado correctamente.';
      });
  }

  private resolveApiErrorMessage(err: HttpErrorResponse): string {
    const fallback = 'No se pudo confirmar el pago. Intente nuevamente en unos segundos.';

    const directMessage = err?.error?.message;
    if (typeof directMessage === 'string' && directMessage.trim()) {
      return directMessage;
    }

    const detail = err?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      try {
        const parsedDetail = JSON.parse(detail);
        if (typeof parsedDetail?.message === 'string' && parsedDetail.message.trim()) {
          return parsedDetail.message;
        }
      } catch {
        return detail;
      }
    }

    return fallback;
  }
}
