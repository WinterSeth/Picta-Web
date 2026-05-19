import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-enzona-payment-cancel',
  templateUrl: './enzona-payment-cancel.component.html',
  styleUrls: ['./enzona-payment-cancel.component.scss'],
  imports: [MatCard, MatCardContent, MatIcon, MatButtonModule, RouterLink]
})
export class EnzonaPaymentCancelComponent {
  private route = inject(ActivatedRoute);

  transactionUuid = '';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.transactionUuid = params.get('transaction_uuid') || '';
    });
  }
}
