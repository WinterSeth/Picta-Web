import { Component, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-payment-confirmation',
    templateUrl: './payment-confirmation.component.html',
    styleUrls: ['./payment-confirmation.component.scss'],
    imports: [MatCard, MatCardContent, MatIcon]
})
export class PaymentConfirmationComponent {
  private route = inject(ActivatedRoute);

  transaction: string;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.transaction = params.get('transaction_uuid');
    });
  }
}
